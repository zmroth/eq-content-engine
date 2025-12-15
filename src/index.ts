import dotenv from 'dotenv';
import { OpenRouterClient } from './api/openrouter';
import { SpireClient } from './api/spire';
import { DatabaseClient } from './api/database';
import { NpcGenerator } from './content/npc-generator';
import * as readline from 'readline';

dotenv.config();

// Validate required environment variables
const requiredVars = ['OPENROUTER_API_KEY', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

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

// CLI Interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function printHelp() {
  console.log(`
EQ Content Engine - LLM-Driven Content Generation for EQEmu
============================================================

Commands:
  generate <description>  - Generate an NPC from a natural language description
  spawn <description> <zone> <x> <y> <z> - Generate and spawn an NPC at location
  zones                   - List available zones
  npcs <zone>            - List NPCs in a zone
  test                    - Run a test NPC generation
  help                    - Show this help message
  quit                    - Exit the program

Examples:
  generate A wise old wizard who studies ancient magic
  spawn A gnoll scout who patrols the hills qeynos 100 200 10
  zones
  npcs qeynos
`);
}

async function handleCommand(input: string) {
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();

  try {
    switch (command) {
      case 'help':
        printHelp();
        break;

      case 'quit':
      case 'exit':
        console.log('Goodbye!');
        await db.close();
        process.exit(0);

      case 'zones':
        console.log('Fetching zones...');
        const zones = await db.listZones();
        console.log('\nAvailable Zones:');
        for (const zone of zones.slice(0, 50)) {
          console.log(`  ${(zone as any).short_name}: ${(zone as any).long_name}`);
        }
        if (zones.length > 50) {
          console.log(`  ... and ${zones.length - 50} more`);
        }
        break;

      case 'npcs':
        const zone = parts[1];
        if (!zone) {
          console.log('Usage: npcs <zone_short_name>');
          break;
        }
        console.log(`Fetching NPCs in ${zone}...`);
        const npcs = await db.getNpcsInZone(zone);
        console.log(`\nNPCs in ${zone}:`);
        for (const npc of npcs) {
          console.log(`  [${(npc as any).id}] ${(npc as any).name} (Level ${(npc as any).level}) at (${(npc as any).x}, ${(npc as any).y}, ${(npc as any).z})`);
        }
        break;

      case 'generate':
        const description = parts.slice(1).join(' ');
        if (!description) {
          console.log('Usage: generate <npc description>');
          break;
        }
        console.log(`\nGenerating NPC from: "${description}"`);
        console.log('Calling OpenRouter API...');
        const generated = await npcGenerator.generateNpc(description);
        console.log('\nGenerated NPC:');
        console.log(JSON.stringify(generated, null, 2));

        if (generated.dialogue) {
          console.log('\nDialogue Script:');
          console.log(npcGenerator.generateLuaScript(generated, 0));
        }
        break;

      case 'spawn':
        // spawn <description...> <zone> <x> <y> <z>
        if (parts.length < 6) {
          console.log('Usage: spawn <description> <zone> <x> <y> <z>');
          console.log('Example: spawn A friendly merchant qeynos 100 200 10');
          break;
        }

        // Parse from the end: z, y, x, zone, then rest is description
        const z = parseFloat(parts[parts.length - 1]);
        const y = parseFloat(parts[parts.length - 2]);
        const x = parseFloat(parts[parts.length - 3]);
        const spawnZone = parts[parts.length - 4];
        const spawnDesc = parts.slice(1, parts.length - 4).join(' ');

        if (isNaN(x) || isNaN(y) || isNaN(z)) {
          console.log('Invalid coordinates. x, y, z must be numbers.');
          break;
        }

        console.log(`\nGenerating and spawning NPC...`);
        console.log(`Description: "${spawnDesc}"`);
        console.log(`Location: ${spawnZone} (${x}, ${y}, ${z})`);

        const result = await npcGenerator.generateAndSpawn(spawnDesc, spawnZone, x, y, z);

        console.log('\n=== NPC Created Successfully ===');
        console.log(`NPC ID: ${result.npc.id}`);
        console.log(`Name: ${result.npc.name}`);
        console.log(`Level: ${result.npc.level}`);
        console.log(`Spawn Group ID: ${result.spawnGroup?.id}`);
        console.log(`Spawn2 ID: ${result.spawn2?.id}`);

        if (result.luaScript) {
          console.log('\nGenerated Lua Script:');
          console.log(result.luaScript);
          console.log(`\nSave this script as: quests/${spawnZone}/${result.npc.name.replace(/ /g, '_')}.lua`);
        }
        break;

      case 'test':
        console.log('\n=== Running Test NPC Generation ===\n');
        console.log('Testing OpenRouter API connection...');

        const testNpc = await npcGenerator.generateNpc(
          'A grizzled dwarven blacksmith who sells weapons and tells tales of ancient battles'
        );

        console.log('\nTest NPC Generated:');
        console.log(`  Name: ${testNpc.name}`);
        console.log(`  Level: ${testNpc.level}`);
        console.log(`  Race ID: ${testNpc.race}`);
        console.log(`  Class ID: ${testNpc.class}`);
        console.log(`  HP: ${testNpc.hp}`);
        console.log(`  Mana: ${testNpc.mana}`);
        console.log(`  Is Merchant: ${testNpc.isMerchant}`);
        console.log(`  Description: ${testNpc.description}`);

        if (testNpc.dialogue) {
          console.log(`  Greeting: "${testNpc.dialogue.greeting}"`);
          console.log(`  Keywords: ${Object.keys(testNpc.dialogue.keywords).join(', ')}`);
        }

        console.log('\n=== Test Complete ===');
        break;

      default:
        if (input.trim()) {
          console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
        }
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

async function main() {
  console.log('\n==============================================');
  console.log('  EQ Content Engine v1.0.0');
  console.log('  LLM-Driven Content Generation for EQEmu');
  console.log('==============================================\n');

  console.log('Testing database connection...');
  try {
    const zones = await db.listZones();
    console.log(`Connected! Found ${zones.length} zones in database.\n`);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.log('Make sure the EQEmu server is running and .env is configured correctly.');
    process.exit(1);
  }

  printHelp();

  const prompt = () => {
    rl.question('eq> ', async (input) => {
      await handleCommand(input);
      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
