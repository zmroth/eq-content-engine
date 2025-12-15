// Test Enter World - Connect to world and enter with a character
// This test builds on test-login.ts by actually entering the game

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
  console.log('EQ Headless Client - Enter World Test');
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

  let characterToPlay: string | null = null;

  // Event handlers
  client.on('status', (msg: string) => {
    console.log(`[STATUS] ${msg}`);
  });

  let enterWorldSent = false;
  client.on('debug', (msg: string) => {
    // After EnterWorld is sent, show ALL debug messages
    if (enterWorldSent || msg.includes('EnterWorld')) {
      if (msg.includes('EnterWorld')) enterWorldSent = true;
      console.log(`[DEBUG] ${msg}`);
    } else if (msg.includes('Zone') || msg.includes('Enter') || msg.includes('error') ||
               msg.includes('Error') || msg.includes('World packet') || msg.includes('opcode') ||
               msg.includes('Received:') || msg.includes('disconnect') || msg.includes('Disconnect')) {
      console.log(`[DEBUG] ${msg}`);
    }
  });

  client.on('error', (msg: string) => {
    console.error(`[ERROR] ${msg}`);
  });

  client.on('serverList', (servers: any[]) => {
    console.log('\n=== SERVER LIST ===');
    servers.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (${s.players} players)`);
    });
    console.log('');

    // Automatically select first server
    if (servers.length > 0) {
      console.log('Selecting first server...');
      client.selectServer(1);
    }
  });

  client.on('characterList', (characters: any[]) => {
    console.log('\n=== CHARACTER LIST ===');
    if (characters.length === 0) {
      console.log('  (no characters - create one in the EQ client first)');
      console.log('\nCannot continue without a character. Exiting...');
      process.exit(1);
    } else {
      characters.forEach((c, i) => {
        const className = CLASS_NAMES[c.class_] || `Class ${c.class_}`;
        const raceName = RACE_NAMES[c.race] || `Race ${c.race}`;
        console.log(`  ${i + 1}. ${c.name} - Level ${c.level} ${raceName} ${className}`);
        console.log(`     Zone: ${c.zone || 'Unknown'}`);
      });

      // Select first character to play
      characterToPlay = characters[0].name;
      console.log(`\n>>> Entering world with: ${characterToPlay}`);

      // Wait a moment for world server to settle, then enter world
      setTimeout(() => {
        if (characterToPlay) {
          client.enterWorld(characterToPlay);
        }
      }, 2000);
    }
  });

  client.on('zoneServerInfo', (info: { ip: string; port: number }) => {
    console.log('\n=== ZONE SERVER INFO ===');
    console.log(`  IP: ${info.ip}`);
    console.log(`  Port: ${info.port}`);
    console.log('  Connecting to zone server...');
  });

  client.on('zoneEnter', (zone: any) => {
    console.log('\n=== ENTERED ZONE ===');
    console.log(`  Zone: ${zone.longName} (${zone.shortName})`);
    console.log(`  Safe Point: ${zone.safeX}, ${zone.safeY}, ${zone.safeZ}`);
    console.log('\n>>> SUCCESS! Character is in the game world!');
  });

  client.on('spawn', (entity: any) => {
    console.log(`[SPAWN] ${entity.name} - Level ${entity.level} (ID: ${entity.id})`);
  });

  client.on('chat', (msg: any) => {
    console.log(`[CHAT] ${msg.sender}: ${msg.message}`);
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connection established, waiting for character list...\n');

    // Keep alive for 120 seconds to complete the zone entry
    await new Promise(resolve => setTimeout(resolve, 120000));

    console.log('\nTest complete, disconnecting...');
    client.disconnect();

  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
