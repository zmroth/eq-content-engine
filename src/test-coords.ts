// Test spawn coordinate parsing
import { EQClient } from './client/eq-client';

const client = new EQClient({
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
});

console.log('\n=== EQ Coordinate Test ===\n');

client.on('status', (m: string) => console.log('[STATUS]', m));
client.on('serverList', (servers: any[]) => {
  if (servers.length > 0) client.selectServer(1);
});

client.on('playerProfile', (p: any) => {
  console.log(`\n[PROFILE] ${p.name} - Level ${p.level}`);
});

// Track spawns with coordinates
const spawnCoords: Array<{name: string, x: number, y: number, z: number}> = [];

client.on('spawn', (s: any) => {
  if (s.x !== 0 || s.y !== 0 || s.z !== 0) {
    spawnCoords.push({ name: s.name, x: s.x, y: s.y, z: s.z });
    if (spawnCoords.length <= 5) {
      console.log(`[SPAWN] ${s.name} at (${s.x}, ${s.y}, ${s.z})`);
    }
  }
});

async function main() {
  try {
    await client.connect();
    await new Promise(r => setTimeout(r, 8000));

    const chars = client.getCharacters();
    if (chars.length === 0) {
      console.log('[ERROR] No characters found');
      process.exit(1);
    }

    console.log(`\n[INFO] Entering world as ${chars[0].name}...`);
    await client.enterWorld(chars[0].name);
    await new Promise(r => setTimeout(r, 15000));

    // Show coordinate summary
    const entities = client.getEntities();
    const withCoords = entities.filter(e => e.x !== 0 || e.y !== 0 || e.z !== 0);
    const withoutCoords = entities.filter(e => e.x === 0 && e.y === 0 && e.z === 0);

    console.log(`\n=== Coordinate Summary ===`);
    console.log(`Total entities: ${entities.length}`);
    console.log(`With coordinates: ${withCoords.length}`);
    console.log(`Without coordinates: ${withoutCoords.length}`);

    if (withCoords.length > 0) {
      // Calculate bounding box
      const xs = withCoords.map(e => e.x);
      const ys = withCoords.map(e => e.y);
      const zs = withCoords.map(e => e.z);
      console.log(`\nZone bounds:`);
      console.log(`  X: ${Math.min(...xs)} to ${Math.max(...xs)}`);
      console.log(`  Y: ${Math.min(...ys)} to ${Math.max(...ys)}`);
      console.log(`  Z: ${Math.min(...zs)} to ${Math.max(...zs)}`);

      console.log(`\nSample spawns with coordinates:`);
      withCoords.slice(0, 10).forEach(e => {
        console.log(`  ${e.name}: (${e.x}, ${e.y}, ${e.z})`);
      });
    }

    console.log('\n[SUCCESS] Coordinate test complete!');
    process.exit(0);
  } catch (e) {
    console.log('[ERROR]', (e as Error).message);
    process.exit(1);
  }
}

main();
