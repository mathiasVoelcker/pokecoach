const { createServer } = require('node:http');
const { appendFile, stat } = require('node:fs/promises');
const { join } = require('node:path');

const hostname = '127.0.0.1';
const port = 3004;
const CHAMPIONS_ROSTER_URL =
  'https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_in_Pok%C3%A9mon_Champions';

const KANTO_DEX = Array.from({ length: 151 }, (_, index) => index + 1);

// These are the version-specific non-Kanto species from the FireRed and
// LeafGreen availability list. The game-specific Deoxys form is added below.
const FIRE_RED_EXTRA_POKEMON = [
  182, 194, 195, 198, 211, 212, 225, 227, 239,
];
const LEAF_GREEN_EXTRA_POKEMON = [
  183, 184, 199, 200, 215, 223, 224, 226, 240, 298,
];

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

async function fetchChampionsDexNumbers() {
  const response = await fetch(CHAMPIONS_ROSTER_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch the Pokémon Champions roster: ${response.status}`);
  }

  const html = await response.text();
  const start = html.indexOf('id="List_of_Pokémon_in_Champions"');
  const end = html.indexOf('id="Forms"', start);

  if (start === -1 || end === -1) {
    throw new Error('Could not locate the Pokémon Champions roster on Bulbapedia');
  }

  const dexNumbers = new Set();
  for (const match of html
    .slice(start, end)
    .matchAll(/font-family:monospace,monospace">#(\d{4})/g)) {
    dexNumbers.add(Number(match[1]));
  }

  // The source currently lists 208 species. Fail loudly if its structure or
  // roster changes, rather than silently generating incomplete SQL.
  if (dexNumbers.size !== 208) {
    throw new Error(`Expected 208 Champions species, found ${dexNumbers.size}`);
  }

  return [...dexNumbers].sort((a, b) => a - b);
}

function valuesForDexNumbers(gameName, dexNumbers) {
  return dexNumbers.map((dexNumber) => `  (${dexNumber}, '${gameName}')`);
}

async function generateSQL() {
  console.log('Fetching the Pokémon Champions roster from Bulbapedia...');
  const championsDexNumbers = await fetchChampionsDexNumbers();

  const gamePokemonRows = [
    ...valuesForDexNumbers('Pokemon Champions', championsDexNumbers),
    ...valuesForDexNumbers('Pokemon Fire Red', [
      ...KANTO_DEX,
      ...FIRE_RED_EXTRA_POKEMON,
    ]),
    ...valuesForDexNumbers('Pokemon Leaf Green', [
      ...KANTO_DEX,
      ...LEAF_GREEN_EXTRA_POKEMON,
    ]),
  ];

  // artwork_id is the National Pokédex number for each base-form Pokémon.
  // Deoxys is form-specific in FireRed and LeafGreen, so it joins by name.
  const sql =
`-- Game + Pokémon availability seed
-- Sources:
-- ${CHAMPIONS_ROSTER_URL}
-- https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_FireRed_and_LeafGreen
-- Generated on ${new Date().toISOString()}

INSERT INTO game (name) VALUES
  ('Pokemon Champions'),
  ('Pokemon Fire Red'),
  ('Pokemon Leaf Green');

WITH game_pokemon (pokedex_number, game_name) AS (VALUES
${gamePokemonRows.join(',\n')}
), game_ids AS (
  SELECT id, name FROM game
)
INSERT INTO pokemon_game (pokemon_id, game_id)
SELECT pokemon.id, game_ids.id
FROM game_pokemon
JOIN pokemon ON pokemon.artwork_id = game_pokemon.pokedex_number
JOIN game_ids ON game_ids.name = game_pokemon.game_name;

INSERT INTO pokemon_game (pokemon_id, game_id)
SELECT pokemon.id, game.id
FROM pokemon
JOIN game ON game.name = 'Pokemon Fire Red'
WHERE pokemon.name = 'deoxys-attack'
UNION ALL
SELECT pokemon.id, game.id
FROM pokemon
JOIN game ON game.name = 'Pokemon Leaf Green'
WHERE pokemon.name = 'deoxys-defense';
`;

  const outputPath = await appendSeedSQL(sql);
  return {
    outputPath,
    championsCount: championsDexNumbers.length,
    fireRedCount: KANTO_DEX.length + FIRE_RED_EXTRA_POKEMON.length + 1,
    leafGreenCount: KANTO_DEX.length + LEAF_GREEN_EXTRA_POKEMON.length + 1,
  };
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/generate') {
    try {
      const result = await generateSQL();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: `Generated game links for ${result.championsCount} Champions, ${result.fireRedCount} Fire Red, and ${result.leafGreenCount} Leaf Green Pokémon`,
        file: result.outputPath,
      }));
    } catch (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Game seeder running\nGET /generate to append to seed.sql');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Hit GET http://${hostname}:${port}/generate to append to seed.sql`);
});
