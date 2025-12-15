import dotenv from 'dotenv';
import { OpenRouterClient } from './api/openrouter';
import { SpireClient } from './api/spire';
import { DatabaseClient } from './api/database';
import { NpcGenerator } from './content/npc-generator';
import { MudServer } from './mud/websocket';

dotenv.config();

// Validate required environment variables
const requiredVars = ['OPENROUTER_API_KEY', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

async function main() {
  console.log('\n============================================');
  console.log('  EQ Content Engine - MUD Server');
  console.log('============================================\n');

  // Initialize clients
  console.log('Initializing clients...');

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

  // Test database connection
  console.log('Testing database connection...');
  try {
    const zones = await db.listZones();
    console.log(`Connected! Found ${zones.length} zones.\n`);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

  // Start MUD server
  const port = parseInt(process.env.WS_PORT || '8765');
  const server = new MudServer(port, db, npcGenerator);

  console.log(`\nMUD Server is ready!`);
  console.log(`Connect via WebSocket: ws://localhost:${port}`);
  console.log(`\nTo connect, you can use:`);
  console.log(`  - websocat ws://localhost:${port}`);
  console.log(`  - A WebSocket client in your browser`);
  console.log(`  - An LLM agent via WebSocket API\n`);

  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.close();
    db.close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
