import dotenv from 'dotenv';
import { OpenRouterClient } from '../src/api/openrouter';
import { SpireClient } from '../src/api/spire';
import { DatabaseClient } from '../src/api/database';
import { NpcGenerator } from '../src/content/npc-generator';

dotenv.config();

async function main() {
  console.log('\n=== EQ Content Engine - NPC Generation Test ===\n');

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

  console.log('1. Testing database connection...');
  const zones = await db.listZones();
  console.log(`   Found ${zones.length} zones\n`);

  console.log('2. Testing OpenRouter API with NPC generation...');
  console.log('   Description: "A grizzled dwarven blacksmith who sells weapons and tells tales of ancient battles"\n');

  try {
    const npc = await npcGenerator.generateNpc(
      'A grizzled dwarven blacksmith who sells weapons and tells tales of ancient battles'
    );

    console.log('   Generated NPC:');
    console.log(`   - Name: ${npc.name}`);
    console.log(`   - Level: ${npc.level}`);
    console.log(`   - Race ID: ${npc.race}`);
    console.log(`   - Class ID: ${npc.class}`);
    console.log(`   - HP: ${npc.hp}`);
    console.log(`   - Mana: ${npc.mana}`);
    console.log(`   - Is Merchant: ${npc.isMerchant}`);
    console.log(`   - Is Quest Giver: ${npc.isQuestGiver}`);
    console.log(`   - Description: ${npc.description}`);

    if (npc.dialogue) {
      console.log(`\n   Dialogue:`);
      console.log(`   - Greeting: "${npc.dialogue.greeting}"`);
      console.log(`   - Keywords: ${Object.keys(npc.dialogue.keywords).join(', ')}`);
      for (const [keyword, response] of Object.entries(npc.dialogue.keywords)) {
        console.log(`     * "${keyword}": "${response}"`);
      }
    }

    console.log('\n3. Generating Lua script...');
    const script = npcGenerator.generateLuaScript(npc, 900001);
    if (script) {
      console.log('   Script generated successfully:\n');
      console.log(script);
    } else {
      console.log('   No dialogue, no script generated.');
    }

    console.log('\n=== Test Complete ===\n');
  } catch (error) {
    console.error('\n   Error during NPC generation:', error);
  }

  await db.close();
}

main().catch(console.error);
