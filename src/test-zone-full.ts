// Full zone test - capture compressed zone packets
import { EQClient } from './client/eq-client';
import zlib from 'zlib';

const config = {
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
};

async function main() {
  const client = new EQClient(config);
  const zonePackets: Buffer[] = [];
  let inZone = false;

  client.on('debug', (msg: string) => {
    // Filter for zone-related messages
    if (msg.includes('[ZONE]')) {
      console.log('[ZONE]', msg.substring(7, 150));

      // Capture zone packet hex
      const hexMatch = msg.match(/hex=([a-f0-9]+)/);
      if (hexMatch && hexMatch[1].startsWith('000d5a78')) {
        const buf = Buffer.from(hexMatch[1], 'hex');
        zonePackets.push(buf);
      }
    }

    // Show fragment/zone related debug
    if (msg.includes('fragment') || msg.includes('Fragment') ||
        msg.includes('Compressed') || msg.includes('Zone') ||
        msg.includes('zone')) {
      console.log('[DBG]', msg.substring(0, 150));
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

  client.on('zoneServerInfo', (info: any) => {
    console.log('[ZONE-INFO]', info);
    inZone = true;
  });

  try {
    console.log('Starting full zone test...');
    await client.connect();

    // Wait for world to send character list
    console.log('Waiting for characters...');
    for (let i = 0; i < 20 && client.getCharacters().length === 0; i++) {
      await new Promise(r => setTimeout(r, 500));
    }

    const chars = client.getCharacters();
    console.log('\n=== CHARACTERS ===');
    for (const c of chars) {
      console.log(`  ${c.name} (level ${c.level})`);
    }

    if (chars.length > 0) {
      console.log('\n=== ENTERING WORLD ===');
      await client.enterWorld(chars[0].name);

      // Wait for zone to fully load
      console.log('Waiting for zone data...');
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 500));
        if (i % 5 === 0) {
          console.log(`  ... ${i/2}s, zone packets: ${zonePackets.length}`);
        }
      }

      // Analyze captured zone packets
      console.log('\n' + '='.repeat(80));
      console.log(`ZONE PACKET ANALYSIS (captured ${zonePackets.length} compressed packets)`);
      console.log('='.repeat(80));

      for (let i = 0; i < Math.min(zonePackets.length, 10); i++) {
        const buf = zonePackets[i];
        console.log(`\n--- Packet ${i + 1} ---`);
        console.log(`Raw length: ${buf.length}`);

        try {
          const compressed = buf.slice(3); // Skip 000d5a
          const decompressed = zlib.inflateSync(compressed);
          console.log(`Decompressed: ${decompressed.length} bytes`);
          console.log(`First 40 bytes: ${decompressed.slice(0, 40).toString('hex')}`);

          // Parse structure
          const seqBE = decompressed.readUInt16BE(0);
          const seqLE = decompressed.readUInt16LE(0);
          console.log(`Sequence: BE=${seqBE}, LE=${seqLE}`);

          if (decompressed.length >= 6) {
            const size4BE = decompressed.readUInt32BE(2);
            const size4LE = decompressed.readUInt32LE(2);
            console.log(`Offset 2-5: BE=${size4BE}, LE=${size4LE}`);
          }

          // Count non-zero bytes
          let nonZero = 0;
          for (let j = 2; j < decompressed.length; j++) {
            if (decompressed[j] !== 0) nonZero++;
          }
          console.log(`Non-zero payload bytes: ${nonZero} / ${decompressed.length - 2}`);
        } catch (e) {
          console.log(`Decompress failed: ${(e as Error).message}`);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }

  process.exit(0);
}

main();
