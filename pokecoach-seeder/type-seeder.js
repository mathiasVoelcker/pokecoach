const { createServer } = require('node:http');
const { appendFile, stat } = require('node:fs/promises');
const { join } = require('node:path');

const hostname = '127.0.0.1';
const port = 3000;

const TYPE_COLORS = {
  normal:   '#A8A878',
  fire:     '#F08030',
  water:    '#6890F0',
  electric: '#F8D030',
  grass:    '#78C850',
  ice:      '#98D8D8',
  fighting: '#C03028',
  poison:   '#A040A0',
  ground:   '#E0C068',
  flying:   '#A890F0',
  psychic:  '#F85888',
  bug:      '#A8B820',
  rock:     '#B8A038',
  ghost:    '#705898',
  dragon:   '#7038F8',
  dark:     '#705848',
  steel:    '#B8B8D0',
  fairy:    '#EE99AC',
  stellar:  '#40B5A5',
};

async function fetchType(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/type/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch type ${id}: ${res.status}`);
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
  const total = 19;
  const types = [];
  const damageModifiers = [];

  console.log(`Fetching ${total} Pokémon types...`);
  for (let id = 1; id <= total; id++) {
    const data = await fetchType(id);
    const name = data.name;
    const color = TYPE_COLORS[name] ?? '#CCCCCC';
    types.push({ name, color });
    console.log(`  [${id}/${total}] ${name} → ${color}`);

    const { double_damage_to, half_damage_to, no_damage_to } = data.damage_relations;

    for (const t of double_damage_to) {
      damageModifiers.push({ attacking: name, defending: t.name, modifier: 2 });
    }
    for (const t of half_damage_to) {
      damageModifiers.push({ attacking: name, defending: t.name, modifier: 0.5 });
    }
    for (const t of no_damage_to) {
      damageModifiers.push({ attacking: name, defending: t.name, modifier: 0 });
    }
  }

  // -- type inserts --
  const typeValues = types
    .map(({ name, color }) => `  ('${name}', '${color}')`)
    .join(',\n');

  // -- type_damage_modifier inserts (subquery FK lookup) --
  const modifierValues = damageModifiers
    .map(({ attacking, defending, modifier }) =>
      `  (${modifier}, (SELECT id FROM type WHERE name = '${attacking}'), (SELECT id FROM type WHERE name = '${defending}'))`
    )
    .join(',\n');

  const sql =
`-- Pokemon types + damage modifiers insert
-- Generated on ${new Date().toISOString()}

INSERT INTO type (name, color) VALUES
${typeValues};

INSERT INTO type_damage_modifier (modifier, attacking_type, defending_type) VALUES
${modifierValues};
`;

  const outputPath = await appendSeedSQL(sql);
  return { outputPath, typeCount: types.length, modifierCount: damageModifiers.length };
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/generate') {
    try {
      const { outputPath, typeCount, modifierCount } = await generateSQL();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: `Generated SQL with ${typeCount} types and ${modifierCount} damage modifier rows`,
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
    res.end('Type seeder running\nGET /generate to append to seed.sql');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Hit GET http://${hostname}:${port}/generate to append to seed.sql`);
});
