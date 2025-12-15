// Quick zone entry test - minimal debugging
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
  console.log('Quick Zone Entry Test');
  console.log('='.repeat(60));

  const client = new EQClient({
    loginHost: CONFIG.loginHost,
    loginPort: CONFIG.loginPort,
    username: CONFIG.username,
    password: CONFIG.password,
  });

  // Track important events
  client.on('status', (msg: string) => {
    console.log(`[STATUS] ${msg}`);
  });

  client.on('debug', (msg: string) => {
    // Only show key messages
    if (msg.includes('Fragment') ||
        msg.includes('opcode') ||
        msg.includes('EnterWorld') ||
        msg.includes('Zone') ||
        msg.includes('0x61b6') ||
        msg.includes('ahead of sequence')) {
      console.log(`[DBG] ${msg}`);
    }
  });

  client.on('error', (msg: string) => {
    console.error(`[ERROR] ${msg}`);
  });

  client.on('serverList', (servers: any[]) => {
    console.log(`Got ${servers.length} servers, selecting...`);
    client.selectServer(1);
  });

  client.on('characterList', (chars: any[]) => {
    console.log(`Got ${chars.length} characters`);
    chars.forEach((c, i) => {
      console.log(`  ${i+1}. ${c.name} - Level ${c.level}`);
    });

    // Enter world with Alexandros (hardcoded for this test)
    setTimeout(() => {
      console.log('\n>>> ENTERING WORLD with Alexandros...');
      client.enterWorld('Alexandros');
    }, 1000);
  });

  client.on('zoneServerInfo', (info: { ip: string; port: number }) => {
    console.log('\n!!! ZONE SERVER INFO !!!');
    console.log(`  IP: ${info.ip}`);
    console.log(`  Port: ${info.port}`);
  });

  client.on('zoneEnter', (zone: any) => {
    console.log('\n!!! ENTERED ZONE !!!');
    console.log(`  Zone: ${zone.longName || zone.shortName}`);
  });

  try {
    await client.connect();
    console.log('Connected, waiting...\n');

    // Wait 25 seconds
    await new Promise(resolve => setTimeout(resolve, 25000));

    console.log('\nDone, disconnecting...');
    client.disconnect();

  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
