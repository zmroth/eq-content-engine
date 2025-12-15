import dotenv from 'dotenv';
import { DatabaseClient } from './api/database';
import { AsciiMudServer } from './mud/ascii-mud';

dotenv.config();

const PORT = 8767;

async function main() {
  const db = new DatabaseClient({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  });

  // Test DB
  const zones = await db.listZones();
  console.log(`Database connected. ${zones.length} zones available.`);

  const server = new AsciiMudServer(PORT, db);

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.close();
    db.close();
    process.exit(0);
  });
}

main().catch(console.error);
