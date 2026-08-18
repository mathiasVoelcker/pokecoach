const { createServer } = require('node:http');
const { appendFile, stat } = require('node:fs/promises');
const { join } = require('node:path');

const hostname = '127.0.0.1';
const port = 3003;

const TOTAL_MOVES = 919;
const TOTAL_POKEMON = 1025;
const VARIANT_POKEMON_START_ID = 10001;
const VARIANT_POKEMON_END_ID = 10325;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function appendSeedSQL(sql) {
  const outputPath = join(__dirname, '..', 'supabase', 'seed.sql');
  let prefix = '';

  try {
    const { size } = await stat(outputPath);
    if (size > 0) prefix = '\n\n';
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  await appendFile(outputPath, `${prefix}${sql}`, 'utf8');
  return outputPath;
}

async function generateSQL() {
  const moveRows = [];
  const pokemonMoveLinks = []; // array of [pokemonName, moveName] pairs
  const validPokemonNames = new Set();

  // ── 1. Pre-fetch valid Pokémon names ─────────────────────────────────────
  console.log(`Pre-fetching names for ${TOTAL_POKEMON} Pokémon...`);
  for (let id = 1; id <= TOTAL_POKEMON; id++) {
    const data = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`);
    validPokemonNames.add(data.name);
    console.log(`  [${id}/${TOTAL_POKEMON}] ${data.name}`);
  }

  // get variant forms too, to ensure we capture moves for those (e.g. alolan, galarian)
  for (let id = VARIANT_POKEMON_START_ID; id <= VARIANT_POKEMON_END_ID; id++) {
    const data = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (data.name.includes('-mega') || data.name.includes('-gmax')) continue; // skip mega and gmax forms as they don't have unique movesets
    validPokemonNames.add(data.name);
    console.log(`  [${id}/${TOTAL_POKEMON}] ${data.name}`);
  }

  // ── 2. Fetch all moves ───────────────────────────────────────────────────
  console.log(`\nFetching ${TOTAL_MOVES} moves...`);
  for (let id = 1; id <= TOTAL_MOVES; id++) {
    try {
      const data = await fetchJSON(`https://pokeapi.co/api/v2/move/${id}`);

      const name     = data.name.replace(/'/g, "''");
      const power    = data.power ?? null;
      const typeName = data.type?.name ?? null;
      const category = data.damage_class?.name ?? 'unknown';

      console.log(`  [${id}/${TOTAL_MOVES}] ${name} | power: ${power} | type: ${typeName} | category: ${category}`);

      const typeExpr = typeName
        ? `(SELECT id FROM type WHERE name = '${typeName}')`
        : 'NULL';

      moveRows.push(
        `  ('${name}', ${typeExpr}, ${power ?? 'NULL'}, '${category}')`
      );

      for (const entry of data.learned_by_pokemon) {
        if (!validPokemonNames.has(entry.name)) continue;
        pokemonMoveLinks.push(`  ('${entry.name}', '${name}')`);
      }
    } catch (err) {
      console.warn(`  [${id}/${TOTAL_MOVES}] skipped — ${err.message}`);
    }
  }

  // ── 3. Write SQL ─────────────────────────────────────────────────────────
  const sql =
`-- Move + pokemon_moves seed
-- Generated on ${new Date().toISOString()}

INSERT INTO move (name, type, base_power, category) VALUES
${moveRows.join(',\n')};

WITH
  pokemon_ids AS (SELECT id, name FROM pokemon),
  move_ids    AS (SELECT id, name FROM move)
INSERT INTO pokemon_moves (pokemon_id, move_id)
SELECT p.id, m.id
FROM (VALUES
${pokemonMoveLinks.join(',\n')}
) AS data(pokemon_name, move_name)
JOIN pokemon_ids p ON p.name = data.pokemon_name
JOIN move_ids   m ON m.name  = data.move_name;
`;

  const outputPath = await appendSeedSQL(sql);
  return {
    outputPath,
    moveCount: moveRows.length,
    pokemonMoveCount: pokemonMoveLinks.length,
  };
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/generate') {
    try {
      const { outputPath, moveCount, pokemonMoveCount } = await generateSQL();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: `Generated SQL with ${moveCount} moves and ${pokemonMoveCount} pokemon-move links`,
        file: outputPath,
      }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Move seeder running\nGET /generate to append to seed.sql');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Hit GET http://${hostname}:${port}/generate to append to seed.sql`);
});
