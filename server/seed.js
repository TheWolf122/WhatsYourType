import 'dotenv/config';
import { writeFileSync } from 'fs';
import db from './db.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (attempt < retries - 1) await sleep(1000);
  }
  console.error(`Failed to fetch after ${retries} attempts: ${url}`);
  throw new Error(`Failed to fetch: ${url}`);
}

const insert = db.prepare(`
  INSERT OR IGNORE INTO pokemon (id, name, sprite_url, type_1, type_2, generation, is_legendary, is_mythical)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

async function seedPokemon(id) {
  const [pokeRes, speciesRes] = await Promise.all([
    fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetchWithRetry(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);

  const pokeData = await pokeRes.json();
  const speciesData = await speciesRes.json();

  const name = pokeData.name;
  const sprite_url = pokeData.sprites?.other?.['official-artwork']?.front_default ?? null;
  const type_1 = pokeData.types[0]?.type.name ?? null;
  const type_2 = pokeData.types[1]?.type.name ?? null;

  const generationUrl = speciesData.generation?.url ?? '';
  const genMatch = generationUrl.match(/\/generation\/(\d+)\//);
  const generation = genMatch ? parseInt(genMatch[1]) : null;
  const is_legendary = speciesData.is_legendary ? 1 : 0;
  const is_mythical = speciesData.is_mythical ? 1 : 0;

  insert.run(id, name, sprite_url, type_1, type_2, generation, is_legendary, is_mythical);
}

async function main() {
  const res = await fetchWithRetry('https://pokeapi.co/api/v2/pokemon?limit=2000');
  const data = await res.json();

  const ids = data.results.map(p => {
    const parts = p.url.split('/').filter(Boolean);
    return parseInt(parts[parts.length - 1]);
  });

  console.log(`Found ${ids.length} Pokémon to seed.`);

  const batchSize = 20;
  let seeded = 0;
  const failedIds = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async id => {
        try {
          await seedPokemon(id);
          seeded++;
        } catch (err) {
          console.error(`Failed ID ${id}: ${err.message}`);
          failedIds.push(id);
        }
      })
    );

    console.log(`Seeded ${Math.min(i + batchSize, ids.length)} / ${ids.length}...`);
    if (i + batchSize < ids.length) await sleep(500);
  }

  if (failedIds.length > 0) {
    writeFileSync('./failed_ids.txt', failedIds.join('\n') + '\n');
    console.log(`${failedIds.length} failed IDs written to failed_ids.txt`);
  }

  console.log(`Done! Successfully inserted ${seeded} Pokémon.`);
}

main().catch(err => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
