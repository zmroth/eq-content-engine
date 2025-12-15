// Test Zone Entry - Focus on what happens after EnterWorld
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
  console.log('Zone Entry Debug Test');
  console.log('='.repeat(60));

  const client = new EQClient({
    loginHost: CONFIG.loginHost,
    loginPort: CONFIG.loginPort,
    username: CONFIG.username,
    password: CONFIG.password,
  });

  let charListReceived = false;
  let enterWorldSent = false;

  client.on('status', (msg: string) => {
    console.log(`[STATUS] ${msg}`);
  });

  client.on('debug', (msg: string) => {
    // After character list, show all world packets
    if (charListReceived && msg.includes('[WORLD]')) {
      // Skip fragment spam, but show everything else
      if (!msg.includes('Fragment') && !msg.includes('000d')) {
        console.log(`[DEBUG] ${msg}`);
      }
    }
    // Always show zone-related
    if (msg.toLowerCase().includes('zone') || msg.includes('61b6')) {
      console.log(`[ZONE DEBUG] ${msg}`);
    }
  });

  client.on('error', (msg: string) => {
    console.error(`[ERROR] ${msg}`);
  });

  client.on('serverList', (servers: any[]) => {
    console.log(`Found ${servers.length} servers, selecting first...`);
    client.selectServer(1);
  });

  client.on('characterList', (characters: any[]) => {
    charListReceived = true;
    console.log('\n=== CHARACTER LIST RECEIVED ===');
    characters.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} - Level ${c.level}`);
    });

    if (characters.length > 0) {
      const charName = 'Alexandros';
      console.log(`\n>>> Will enter world with: ${charName}`);

      // Wait a moment then enter world
      setTimeout(async () => {
        console.log('>>> Sending EnterWorld now...');
        enterWorldSent = true;
        try {
          await client.enterWorld(charName);
          console.log('>>> EnterWorld packet sent successfully');
        } catch (e) {
          console.error('>>> EnterWorld failed:', e);
        }
      }, 2000);
    }
  });

  client.on('zoneServerInfo', (info: { ip: string; port: number }) => {
    console.log('\n!!! ZONE SERVER INFO RECEIVED !!!');
    console.log(`  IP: ${info.ip}`);
    console.log(`  Port: ${info.port}`);
  });

  client.on('zoneEnter', (zone: any) => {
    console.log('\n!!! ENTERED ZONE !!!');
    console.log(`  Zone: ${zone.longName || zone.shortName}`);
  });

  try {
    await client.connect();
    console.log('Connected, waiting for events...\n');

    // Wait for 30 seconds
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log('\nTest complete, disconnecting...');
    client.disconnect();

  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
