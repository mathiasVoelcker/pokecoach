const { createServer } = require('node:http');
const { appendFile, stat } = require('node:fs/promises');
const { join } = require('node:path');

const hostname = '127.0.0.1';
const port = 3002;

const TOTAL_POKEMON = 1025;
const TOTAL_ABILITIES = 311;    // total abilities in pokeapi
const VARIANT_POKEMON_START_ID = 10001;
const VARIANT_POKEMON_END_ID = 10325;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

async function appendSeedSQL(sql) {
  const outputPath = join(__dirname, 'seed.sql');
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
  // ── 1. Fetch all abilities ───────────────────────────────────────────────
  const abilityRows = [];
  const abilityNames = new Set(); // used to skip unknown abilities in pokemon_abilities

  console.log(`Fetching ${TOTAL_ABILITIES} abilities...`);
  for (let id = 1; id <= TOTAL_ABILITIES; id++) {
    try {
      const data = await fetchJSON(`https://pokeapi.co/api/v2/ability/${id}`);
      abilityNames.add(data.name);
      abilityRows.push(`  ('${data.name}')`);
      console.log(`  [${id}/${TOTAL_ABILITIES}] ${data.name}`);
    } catch (err) {
      // Some IDs are retired/missing in the API — skip them gracefully
      console.warn(`  [${id}/${TOTAL_ABILITIES}] skipped — ${err.message}`);
    }
  }

  // ── 2. Fetch pokemon abilities ───────────────────────────────────────────
  const pokemonAbilityRows = [];

  console.log(`\nFetching abilities for ${TOTAL_POKEMON} Pokémon...`);
  for (let id = 1; id <= TOTAL_POKEMON; id++) {
    const data = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`);
    console.log(`  [${id}/${TOTAL_POKEMON}] ${data.name}`);
    for (const entry of data.abilities) {
      const abilityName = entry.ability.name;

      if (!abilityNames.has(abilityName)) {
        console.warn(`    skipping unknown ability '${abilityName}' for ${data.name}`);
        continue;
      }

      pokemonAbilityRows.push(
        `  ((SELECT id FROM pokemon WHERE name = '${data.name}'), (SELECT id FROM ability WHERE name = '${abilityName}'))`
      );
    }
  }

  for (let id = VARIANT_POKEMON_START_ID; id <= VARIANT_POKEMON_END_ID; id++) {
    const data = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`);
    console.log(`  [${id}/${TOTAL_POKEMON}] ${data.name}`);

    if (data.name.includes('-gmax')) continue; // skip gmax forms as they don't have unique abilities
    for (const entry of data.abilities) {
      const abilityName = entry.ability.name;

      if (!abilityNames.has(abilityName)) {
        console.warn(`    skipping unknown ability '${abilityName}' for ${data.name}`);
        continue;
      }

      pokemonAbilityRows.push(
        `  ((SELECT id FROM pokemon WHERE name = '${data.name}'), (SELECT id FROM ability WHERE name = '${abilityName}'))`
      );
    }
  }

  // ── 3. Write SQL ─────────────────────────────────────────────────────────
  const sql =
`-- Ability + pokemon_abilities seed
-- Generated on ${new Date().toISOString()}

INSERT INTO ability (name) VALUES
${abilityRows.join(',\n')};

INSERT INTO pokemon_abilities (pokemon_id, ability_id) VALUES
${pokemonAbilityRows.join(',\n')};
`;

  const outputPath = await appendSeedSQL(sql);
  return {
    outputPath,
    abilityCount: abilityRows.length,
    pokemonAbilityCount: pokemonAbilityRows.length,
  };
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/generate') {
    try {
      const { outputPath, abilityCount, pokemonAbilityCount } = await generateSQL();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: `Generated SQL with ${abilityCount} abilities and ${pokemonAbilityCount} pokemon-ability links`,
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
    res.end('Ability seeder running\nGET /generate to append to seed.sql');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Hit GET http://${hostname}:${port}/generate to append to seed.sql`);
});
