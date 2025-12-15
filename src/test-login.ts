// Test Login Connection
// Simple test to verify we can connect to the EQEmu login server

import { EQClient } from './client/eq-client';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  loginHost: process.env.EQ_LOGIN_HOST || '127.0.0.1',
  loginPort: parseInt(process.env.EQ_LOGIN_PORT || '5998'),
  username: process.env.EQ_USERNAME || 'admin',
  password: process.env.EQ_PASSWORD || 'admin',
};

// Class names for display
const CLASS_NAMES: { [key: number]: string } = {
  1: 'Warrior', 2: 'Cleric', 3: 'Paladin', 4: 'Ranger',
  5: 'Shadow Knight', 6: 'Druid', 7: 'Monk', 8: 'Bard',
  9: 'Rogue', 10: 'Shaman', 11: 'Necromancer', 12: 'Wizard',
  13: 'Magician', 14: 'Enchanter', 15: 'Beastlord', 16: 'Berserker',
};

// Race names for display
const RACE_NAMES: { [key: number]: string } = {
  1: 'Human', 2: 'Barbarian', 3: 'Erudite', 4: 'Wood Elf',
  5: 'High Elf', 6: 'Dark Elf', 7: 'Half Elf', 8: 'Dwarf',
  9: 'Troll', 10: 'Ogre', 11: 'Halfling', 12: 'Gnome',
  13: 'Iksar', 14: 'Vah Shir', 15: 'Froglok', 16: 'Drakkin',
};

async function main() {
  console.log('='.repeat(60));
  console.log('EQ Headless Client - Login Test');
  console.log('='.repeat(60));
  console.log(`Login Server: ${CONFIG.loginHost}:${CONFIG.loginPort}`);
  console.log(`Username: ${CONFIG.username}`);
  console.log('');

  const client = new EQClient({
    loginHost: CONFIG.loginHost,
    loginPort: CONFIG.loginPort,
    username: CONFIG.username,
    password: CONFIG.password,
  });

  // Event handlers
  client.on('status', (msg: string) => {
    console.log(`[STATUS] ${msg}`);
  });

  client.on('debug', (msg: string) => {
    console.log(`[DEBUG] ${msg}`);
  });

  client.on('error', (msg: string) => {
    console.error(`[ERROR] ${msg}`);
  });

  client.on('serverList', (servers: any[]) => {
    console.log('\n=== SERVER LIST ===');
    servers.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (${s.players} players) - ${s.ip || 'local'}`);
    });
    console.log('');

    // Automatically select first server for testing
    if (servers.length > 0) {
      console.log('Selecting first server...');
      client.selectServer(1);
    }
  });

  client.on('worldServerReady', (info: any) => {
    console.log('\n=== WORLD SERVER INFO ===');
    console.log(`Server Number: ${info.serverNumber}`);
    console.log(`World Host: ${info.worldHost}:${info.worldPort}`);
  });

  client.on('motd', (motd: string) => {
    console.log('\n=== MESSAGE OF THE DAY ===');
    console.log(motd || '(none)');
  });

  client.on('characterList', (characters: any[]) => {
    console.log('\n=== CHARACTER LIST ===');
    if (characters.length === 0) {
      console.log('  (no characters - create one in the EQ client)');
    } else {
      characters.forEach((c, i) => {
        const className = CLASS_NAMES[c.class_] || `Class ${c.class_}`;
        const raceName = RACE_NAMES[c.race] || `Race ${c.race}`;
        console.log(`  ${i + 1}. ${c.name} - Level ${c.level} ${raceName} ${className}`);
        console.log(`     Zone: ${c.zone || 'Unknown'}`);
      });
    }
    console.log('');
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connection established, waiting for packets...\n');

    // Keep alive for 60 seconds to receive packets
    await new Promise(resolve => setTimeout(resolve, 60000));

    console.log('\nTest complete, disconnecting...');
    client.disconnect();

  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
