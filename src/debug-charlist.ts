// Debug Character List Packet Structure
// Run this to capture and analyze raw packet data

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
  console.log('Debug Character List Packet');
  console.log('='.repeat(60));

  const client = new EQClient({
    loginHost: CONFIG.loginHost,
    loginPort: CONFIG.loginPort,
    username: CONFIG.username,
    password: CONFIG.password,
  });

  // Intercept raw packet for analysis
  client.on('rawCharacterList', (data: Buffer) => {
    console.log('\n=== RAW CHARACTER LIST PACKET ===');
    console.log(`Total length: ${data.length} bytes`);

    // Known struct offsets for Titanium CharacterSelect_Struct
    const OFFSETS = {
      RACE: 0,        // uint32[10] - 40 bytes
      DEITY: 832,     // uint32[10] - 40 bytes
      ZONE: 964,      // uint32[10] - 40 bytes
      CLASS: 1004,    // uint8[10] - 10 bytes
      FACE: 1014,     // uint8[10] - 10 bytes
      NAME: 1024,     // char[10][64] - 640 bytes
      GENDER: 1664,   // uint8[10] - 10 bytes
      EYECOLOR1: 1674, // uint8[10] - 10 bytes
      EYECOLOR2: 1684, // uint8[10] - 10 bytes
      LEVEL: 1694,    // uint8[10] - 10 bytes
    };

    console.log('\n=== SLOT 0 DATA (Should be Alexandros) ===');

    // Read all fields for slot 0
    const slot = 0;
    const nameOffset = OFFSETS.NAME + (slot * 64);
    const name = data.slice(nameOffset, nameOffset + 64).toString('utf8').replace(/\0/g, '').trim();
    console.log(`Name:   "${name}"`);
    console.log(`Race:   ${data.readUInt32LE(OFFSETS.RACE + slot * 4)}`);
    console.log(`Class:  ${data.readUInt8(OFFSETS.CLASS + slot)}`);
    console.log(`Level:  ${data.readUInt8(OFFSETS.LEVEL + slot)}`);
    console.log(`Gender: ${data.readUInt8(OFFSETS.GENDER + slot)}`);
    console.log(`Deity:  ${data.readUInt32LE(OFFSETS.DEITY + slot * 4)}`);
    console.log(`Zone:   ${data.readUInt32LE(OFFSETS.ZONE + slot * 4)}`);
    console.log(`Face:   ${data.readUInt8(OFFSETS.FACE + slot)}`);

    // Dump raw bytes around Level array
    console.log('\n=== LEVEL ARRAY (offset 1694, 10 bytes) ===');
    const levelBytes = data.slice(OFFSETS.LEVEL, OFFSETS.LEVEL + 10);
    console.log(`Bytes: ${Array.from(levelBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
    console.log(`Values: ${Array.from(levelBytes).join(', ')}`);

    // Dump raw bytes around Class array
    console.log('\n=== CLASS ARRAY (offset 1004, 10 bytes) ===');
    const classBytes = data.slice(OFFSETS.CLASS, OFFSETS.CLASS + 10);
    console.log(`Bytes: ${Array.from(classBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
    console.log(`Values: ${Array.from(classBytes).join(', ')}`);

    // Dump raw bytes around Race array
    console.log('\n=== RACE ARRAY (offset 0, 40 bytes) ===');
    const raceBytes = data.slice(OFFSETS.RACE, OFFSETS.RACE + 40);
    for (let i = 0; i < 10; i++) {
      const val = data.readUInt32LE(OFFSETS.RACE + i * 4);
      if (val > 0) console.log(`  Race[${i}] = ${val}`);
    }

    // Find where Alexandros really is
    console.log('\n=== SEARCHING FOR "Alexandros" ===');
    const nameToFind = 'Alexandros';
    for (let i = 0; i < data.length - nameToFind.length; i++) {
      const slice = data.slice(i, i + nameToFind.length).toString('utf8');
      if (slice === nameToFind) {
        console.log(`Found at offset ${i} (0x${i.toString(16)})`);

        // Calculate which name slot this is
        if (i >= OFFSETS.NAME && i < OFFSETS.NAME + 640) {
          const slotOffset = i - OFFSETS.NAME;
          const slot = Math.floor(slotOffset / 64);
          const byteInSlot = slotOffset % 64;
          console.log(`  -> Name slot ${slot}, byte ${byteInSlot} within name field`);
        }
      }
    }

    // Show last 20 bytes (should contain Level array)
    console.log('\n=== LAST 20 BYTES OF PACKET ===');
    const last20 = data.slice(data.length - 20);
    const hex = Array.from(last20).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log(`Offset ${data.length - 20}: ${hex}`);

    console.log('\n>>> Packet analysis complete, disconnecting...');
    setTimeout(() => process.exit(0), 500);
  });

  client.on('status', (msg: string) => {
    if (!msg.includes('debug')) console.log(`[STATUS] ${msg}`);
  });

  client.on('serverList', (servers: any[]) => {
    console.log(`Found ${servers.length} servers, selecting first...`);
    client.selectServer(1);
  });

  try {
    await client.connect();
    await new Promise(resolve => setTimeout(resolve, 30000));
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
