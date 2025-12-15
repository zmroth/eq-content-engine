// Zone Debug Test - Watch all packets from zone server
import { EQClient } from './client/eq-client';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  loginHost: process.env.EQ_LOGIN_HOST || '127.0.0.1',
  loginPort: parseInt(process.env.EQ_LOGIN_PORT || '5998'),
  username: process.env.EQ_USERNAME || 'admin',
  password: process.env.EQ_PASSWORD || 'admin',
};

async function main() {
  console.log('Zone Debug Test');
  console.log('='.repeat(60));

  const client = new EQClient({
    loginHost: CONFIG.loginHost,
    loginPort: CONFIG.loginPort,
    username: CONFIG.username,
    password: CONFIG.password,
  });

  let zoneConnected = false;

  client.on('status', (msg: string) => {
    console.log(`[STATUS] ${msg}`);
    if (msg.includes('Connected to zone')) {
      zoneConnected = true;
    }
  });

  client.on('debug', (msg: string) => {
    // Show zone-related and session-level messages
    if (zoneConnected) {
      // Show ALL zone debug messages
      if (msg.includes('Received:') ||
          msg.includes('Zone') ||
          msg.includes('Fragment') ||
          msg.includes('opcode') ||
          msg.includes('ahead') ||
          msg.includes('Session')) {
        console.log(`[ZONE DBG] ${msg}`);
      }
    } else {
      // Before zone - only show key messages
      if (msg.includes('Zone server info') ||
          msg.includes('Fragment complete') ||
          msg.includes('EnterWorld')) {
        console.log(`[DBG] ${msg}`);
      }
    }
  });

  client.on('error', (msg: string) => {
    console.error(`[ERROR] ${msg}`);
  });

  client.on('serverList', (servers: any[]) => {
    console.log(`Got ${servers.length} servers`);
    client.selectServer(1);
  });

  client.on('characterList', (chars: any[]) => {
    console.log(`Got ${chars.length} characters`);
    setTimeout(() => {
      console.log('\n>>> ENTERING WORLD with Alexandros...');
      client.enterWorld('Alexandros');
    }, 500);
  });

  client.on('zoneServerInfo', (info: { ip: string; port: number }) => {
    console.log('\n!!! ZONE SERVER INFO !!!');
    console.log(`  IP: ${info.ip}, Port: ${info.port}`);
  });

  client.on('zoneEnter', (zone: any) => {
    console.log('\n!!! ENTERED ZONE !!!');
    console.log(`  Zone: ${zone.longName || zone.shortName}`);
  });

  client.on('spawn', (entity: any) => {
    console.log(`[SPAWN] ${entity.name}`);
  });

  try {
    await client.connect();
    console.log('Connected, waiting for zone entry...\n');

    // Wait 45 seconds to see zone response
    await new Promise(resolve => setTimeout(resolve, 45000));

    console.log('\nDone.');
    client.disconnect();

  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
