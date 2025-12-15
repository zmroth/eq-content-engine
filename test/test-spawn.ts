import dotenv from 'dotenv';
import { OpenRouterClient } from '../src/api/openrouter';
import { SpireClient } from '../src/api/spire';
import { DatabaseClient } from '../src/api/database';
import { NpcGenerator } from '../src/content/npc-generator';

dotenv.config();

async function main() {
  console.log('\n=== EQ Content Engine - Full Spawn Test ===\n');

  // Initialize clients
  const llm = new OpenRouterClient(
    process.env.OPENROUTER_API_KEY!,
    process.env.OPENROUTER_MODEL || 'anthropic/claude-opus-4.5'
  );

  const spire = new SpireClient(
    process.env.SPIRE_API_URL || 'http://127.0.0.1:3000/api/v1'
  );

  const db = new DatabaseClient({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  });

  const npcGenerator = new NpcGenerator(llm, spire, db);

  const description = 'A mysterious elven sage who offers cryptic wisdom to adventurers';
  const zone = 'qeynos'; // South Qeynos
  const x = 0;
  const y = 0;
  const z = 3;

  console.log(`Generating and spawning NPC...`);
  console.log(`Description: "${description}"`);
  console.log(`Location: ${zone} at (${x}, ${y}, ${z})\n`);

  try {
    const result = await npcGenerator.generateAndSpawn(description, zone, x, y, z);

    console.log('\n=== NPC Spawned Successfully! ===\n');
    console.log(`NPC ID: ${result.npc.id}`);
    console.log(`Name: ${result.npc.name}`);
    console.log(`Level: ${result.npc.level}`);
    console.log(`Race: ${result.npc.race}`);
    console.log(`Class: ${result.npc.class}`);
    console.log(`HP: ${result.npc.hp}`);
    console.log(`\nSpawn Group ID: ${result.spawnGroup?.id}`);
    console.log(`Spawn Entry: NPC ${result.spawnEntry?.npcID} in group ${result.spawnEntry?.spawngroupID}`);
    console.log(`Spawn2 ID: ${result.spawn2?.id}`);
    console.log(`Location: ${result.spawn2?.zone} (${result.spawn2?.x}, ${result.spawn2?.y}, ${result.spawn2?.z})`);

    if (result.luaScript) {
      const scriptPath = `quests/${zone}/${result.npc.name?.replace(/ /g, '_')}.lua`;
      console.log(`\nLua Script (save to ${scriptPath}):`);
      console.log('---');
      console.log(result.luaScript);
      console.log('---');
    }

    // Verify in database
    console.log('\nVerifying in database...');
    const npcCheck = await db.getNpcById(result.npc.id!);
    if (npcCheck) {
      console.log(`Confirmed: NPC "${(npcCheck as any).name}" (ID: ${result.npc.id}) exists in npc_types table`);
    }

    console.log('\n=== Test Complete ===');
    console.log(`\nTo see this NPC in-game:`);
    console.log(`1. #zone ${zone}`);
    console.log(`2. #goto ${x} ${y} ${z}`);
    console.log(`3. Or #repop to reload spawns`);

  } catch (error) {
    console.error('\nError during spawn:', error);
  }

  await db.close();
}

main().catch(console.error);
