const { createServer } = require('node:http');
const { appendFile, stat } = require('node:fs/promises');
const { join } = require('node:path');

const hostname = '127.0.0.1';
const port = 3001;

const TOTAL_POKEMON = 1025; 
const VARIANT_POKEMON_START_ID = 10001;
const VARIANT_POKEMON_END_ID = 10325; // includes variant forms; gmax forms are skipped below
// 10278 - first of the new megas (clefable)
// 10325 - last one

async function fetchPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch pokemon ${id}: ${res.status}`);
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

function parseStats(stats) {
  const map = {};
  for (const entry of stats) {
    map[entry.stat.name] = entry.base_stat;
  }
  return {
    hp:               map['hp'],
    attack:           map['attack'],
    defense:          map['defense'],
    specialAttack:    map['special-attack'],
    specialDefense:   map['special-defense'],
    speed:            map['speed'],
  };
}

function parseTypes(types) {
  const sorted = types.slice().sort((a, b) => a.slot - b.slot);
  const first  = sorted[0]?.type.name ?? null;
  const second = sorted[1]?.type.name ?? null;
  return { first, second };
}

function typeRef(typeName) {
  if (!typeName) return 'NULL';
  return `(SELECT id FROM type WHERE name = '${typeName}')`;
}

function resourceIdFromUrl(url) {
  if (!url) return null;
  const parts = url.split('/').filter(Boolean);
  return parts.at(-1) ?? null;
}

function buildPokemonRow(data, id) {
  const name = data.name;
  if (name.includes('-gmax')) return null;

  const { hp, attack, defense,
          specialAttack, specialDefense, speed } = parseStats(data.stats);
  const { first, second } = parseTypes(data.types);
  const megaEvolution = name.includes('-mega')
    ? resourceIdFromUrl(data.species?.url)
    : null;

  console.log(`  ${name} (${first}${second ? '/' + second : ''})`);

  return `  ('${name}', ${typeRef(first)}, ${typeRef(second)}, ${hp}, ${attack}, ${defense}, ${specialAttack}, ${specialDefense}, ${speed}, ${megaEvolution ?? 'NULL'}, ${id})`;
}

async function generateSQL() {
  const rows = [];

  console.log(`Fetching ${TOTAL_POKEMON} Pokémon...`);
  for (let id = 1; id <= TOTAL_POKEMON; id++) {
    const data = await fetchPokemon(id);
    const row = buildPokemonRow(data, id);

    if (row) {
      console.log(`    [${id}/${TOTAL_POKEMON}] added`);
      rows.push(row);
    } else {
      console.log(`    [${id}/${TOTAL_POKEMON}] skipped gmax form`);
    }
  }

  for (let id = VARIANT_POKEMON_START_ID; id <= VARIANT_POKEMON_END_ID; id++) {
    const data = await fetchPokemon(id);
    const row = buildPokemonRow(data, id);

    if (row) {
      console.log(`    [${id}/${VARIANT_POKEMON_END_ID}] added`);
      rows.push(row);
    } else {
      console.log(`    [${id}/${VARIANT_POKEMON_END_ID}] skipped gmax form`);
    }
  }

  const sql =
`-- Pokemon seed
-- Generated on ${new Date().toISOString()}

INSERT INTO pokemon (name, first_type, second_type, base_hp, base_attack, base_defense, base_special_attack, base_special_defense, base_speed, mega_evolves_from, artwork_id) VALUES
${rows.join(',\n')};
`;

  const outputPath = await appendSeedSQL(sql);
  return { outputPath, count: rows.length };
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/generate') {
    try {
      const { outputPath, count } = await generateSQL();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: `Generated SQL with ${count} Pokémon`,
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
    res.end('Pokemon seeder running\nGET /generate to append to seed.sql');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Hit GET http://${hostname}:${port}/generate to append to seed.sql`);
});
