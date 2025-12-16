// Debug character list data
import { EQClient } from './client/eq-client';

const config = {
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
};

async function main() {
  const client = new EQClient(config);

  client.on('debug', (msg: string) => {
    // Only show key debug messages
    if (msg.includes('Character list') || msg.includes('Fragment complete') ||
        msg.includes('World') || msg.includes('opcode')) {
      console.log('[DEBUG]', msg.substring(0, 150));
    }
  });

  client.on('error', (err: Error) => {
    console.error('[ERROR]', err.message);
  });

  client.on('status', (msg: string) => {
    console.log('[STATUS]', msg);
  });

  client.on('serverList', (servers: any[]) => {
    console.log('[SERVERS]', servers.length, 'servers');
    if (servers.length > 0) {
      client.selectServer(1);
    }
  });

  // Capture raw character list data
  client.on('rawCharacterList', (data: Buffer) => {
    console.log('\n=== RAW CHARACTER LIST DATA ===');
    console.log('Length:', data.length, 'bytes');

    // Search for any printable strings in the data
    console.log('\n--- Searching for strings ---');
    let currentString = '';
    let startOffset = -1;
    for (let i = 0; i < data.length; i++) {
      const b = data[i];
      if (b >= 32 && b <= 126) { // Printable ASCII
        if (currentString === '') startOffset = i;
        currentString += String.fromCharCode(b);
      } else if (currentString.length >= 3) {
        console.log(`Offset ${startOffset}: "${currentString}"`);
        currentString = '';
      } else {
        currentString = '';
      }
    }
    if (currentString.length >= 3) {
      console.log(`Offset ${startOffset}: "${currentString}"`);
    }

    // Look for "Alex" pattern
    for (let i = 0; i < data.length - 4; i++) {
      if (data[i] === 0x41 && data[i+1] === 0x6c && data[i+2] === 0x65 && data[i+3] === 0x78) {
        console.log(`Found "Alex" at offset ${i}: ${data.slice(i, i+20).toString('hex')}`);
      }
    }

    // Find non-zero regions
    console.log('\n--- Non-zero regions ---');
    let nonZeroStart = -1;
    for (let i = 0; i < data.length; i++) {
      if (data[i] !== 0) {
        if (nonZeroStart === -1) nonZeroStart = i;
      } else if (nonZeroStart !== -1) {
        if (i - nonZeroStart >= 1) {
          console.log(`Offset ${nonZeroStart}-${i-1}: ${data.slice(nonZeroStart, Math.min(i, nonZeroStart + 20)).toString('hex')}`);
        }
        nonZeroStart = -1;
      }
    }
    if (nonZeroStart !== -1) {
      console.log(`Offset ${nonZeroStart}-${data.length-1}: ${data.slice(nonZeroStart, Math.min(data.length, nonZeroStart + 20)).toString('hex')}`);
    }
  });

  try {
    console.log('Connecting...');
    await client.connect();

    // Wait for world to send character list
    for (let i = 0; i < 20 && client.getCharacters().length === 0; i++) {
      await new Promise(r => setTimeout(r, 500));
    }

    const chars = client.getCharacters();
    console.log('\n=== PARSED CHARACTERS ===');
    for (const c of chars) {
      console.log(`  Name: "${c.name}" Level: ${c.level} Class: ${c.class_} Race: ${c.race}`);
    }
  } catch (err) {
    console.error('Error:', err);
  }

  process.exit(0);
}

main();
