const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { writeFile } = require('node:fs/promises');
const { join } = require('node:path');

const OUTPUT_FILE = join(__dirname, 'seed.sql');
const SEEDERS = [
  { name: 'types', script: 'type-seeder.js', port: 3000 },
  { name: 'pokemon', script: 'pokemon-seeder.js', port: 3001 },
  { name: 'abilities', script: 'ability-seeder.js', port: 3002 },
  { name: 'moves', script: 'move-seeder.js', port: 3003 },
  { name: 'games', script: 'game-seeder.js', port: 3004 },
];

function startSeeder({ name, script, port }) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [join(__dirname, script)], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';

    const onOutput = (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(`[${name}] ${text}`);

      if (text.includes(`http://127.0.0.1:${port}/`)) {
        cleanup();
        resolve(child);
      }
    };

    const onError = (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(`[${name}] ${text}`);
    };

    const onExit = (code) => {
      cleanup();
      reject(new Error(`${name} seeder exited before it was ready (code ${code}).\n${output}`));
    };

    const cleanup = () => {
      child.stdout.off('data', onOutput);
      child.stderr.off('data', onError);
      child.off('exit', onExit);
    };

    child.stdout.on('data', onOutput);
    child.stderr.on('data', onError);
    child.once('exit', onExit);
  });
}

async function stopSeeder(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  await once(child, 'exit');
}

async function runSeeder(seeder) {
  console.log(`\nRunning ${seeder.name} seeder...`);
  const child = await startSeeder(seeder);

  try {
    const response = await fetch(`http://127.0.0.1:${seeder.port}/generate`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error ?? `${seeder.name} seeder failed with status ${response.status}`);
    }

    console.log(`[${seeder.name}] ${result.message}`);
  } finally {
    await stopSeeder(child);
  }
}

async function main() {
  await writeFile(OUTPUT_FILE, '', 'utf8');
  console.log(`Generating ${OUTPUT_FILE}`);

  for (const seeder of SEEDERS) {
    await runSeeder(seeder);
  }

  console.log(`\nDone: generated ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(`\nSeed generation failed: ${error.message}`);
  process.exitCode = 1;
});
