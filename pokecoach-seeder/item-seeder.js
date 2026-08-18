const { createServer } = require('node:http');
const { appendFile, stat } = require('node:fs/promises');
const { join } = require('node:path');

const hostname = '127.0.0.1';
const port = 3005;
const HOLDABLE_ITEMS_URL = 'https://pokeapi.co/api/v2/item-attribute/holdable';
const HOLDABLE_ACTIVE_ITEMS_URL =
  'https://pokeapi.co/api/v2/item-attribute/holdable-active';

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
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

function sqlString(value) {
  return value.replace(/'/g, "''");
}

function englishShortEffect(effectEntries) {
  return effectEntries.find((entry) => entry.language.name === 'en')?.short_effect ?? '';
}

async function generateSQL() {
  console.log('Fetching holdable and holdable-active items...');
  const itemLists = await Promise.all([
    fetchJSON(HOLDABLE_ITEMS_URL),
    fetchJSON(HOLDABLE_ACTIVE_ITEMS_URL),
  ]);
  const itemsByName = new Map();

  for (const { items } of itemLists) {
    for (const item of items) {
      itemsByName.set(item.name, item);
    }
  }

  const items = [...itemsByName.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const rows = [];

  console.log(`Found ${items.length} unique holdable items`);
  for (const [index, item] of items.entries()) {
    const data = await fetchJSON(item.url);
    rows.push(`  ('${sqlString(data.name)}', '${sqlString(englishShortEffect(data.effect_entries))}')`);
    console.log(`  [${index + 1}/${items.length}] ${data.name}`);
  }

  const sql =
`-- Holdable item seed
-- Sources:
-- ${HOLDABLE_ITEMS_URL}
-- ${HOLDABLE_ACTIVE_ITEMS_URL}
-- Generated on ${new Date().toISOString()}

INSERT INTO item (name, description) VALUES
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
        message: `Generated SQL with ${count} holdable items`,
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
    res.end('Item seeder running\nGET /generate to append to seed.sql');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  console.log(`Hit GET http://${hostname}:${port}/generate to append to seed.sql`);
});
