// Test MUD client functionality
import { EQClient } from './client/eq-client';

const client = new EQClient({
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
});

console.log('\n=== EQ MUD Test ===\n');

client.on('status', (m: string) => console.log('[STATUS]', m));

client.on('serverList', (servers: any[]) => {
  console.log(`[SERVERS] ${servers.length} servers available`);
  if (servers.length > 0) {
    client.selectServer(1);
  }
});

client.on('characterList', (chars: any[]) => {
  console.log(`[CHARACTERS] ${chars.length} characters:`);
  chars.forEach((c, i) => console.log(`  ${i+1}. ${c.name} Level ${c.level}`));
});

client.on('playerProfile', (p: any) => {
  console.log(`\n[PROFILE] ${p.name} - Level ${p.level}`);
});

client.on('spawn', (s: any) => {
  // Only log first few spawns
  if (client.getEntities().length <= 5) {
    console.log(`[SPAWN] ${s.name}`);
  }
});

let spawnLogTimer: NodeJS.Timeout | null = null;
client.on('spawn', () => {
  // Debounce spawn count logging
  if (spawnLogTimer) clearTimeout(spawnLogTimer);
  spawnLogTimer = setTimeout(() => {
    console.log(`[SPAWNS] Total: ${client.getEntities().length} entities in zone`);
  }, 1000);
});

async function main() {
  try {
    await client.connect();
    console.log('[INFO] Waiting for character list...');
    await new Promise(r => setTimeout(r, 10000));

    const chars = client.getCharacters();
    if (chars.length === 0) {
      console.log('[ERROR] No characters found');
      process.exit(1);
    }

    console.log(`\n[INFO] Entering world as ${chars[0].name}...`);
    await client.enterWorld(chars[0].name);

    console.log('[INFO] Waiting for zone data...');
    await new Promise(r => setTimeout(r, 20000));

    // Show spawn summary
    const entities = client.getEntities();
    console.log(`\n=== Zone Summary ===`);
    console.log(`Total entities: ${entities.length}`);

    const npcs = entities.filter(e => e.isNpc);
    const pcs = entities.filter(e => !e.isNpc);
    console.log(`NPCs: ${npcs.length}`);
    console.log(`Players: ${pcs.length}`);

    console.log('\nSample NPCs:');
    npcs.slice(0, 10).forEach(n => console.log(`  - ${n.name}`));

    console.log('\n[SUCCESS] MUD test complete!');
    process.exit(0);
  } catch (e) {
    console.log('[ERROR]', (e as Error).message);
    process.exit(1);
  }
}

main();
