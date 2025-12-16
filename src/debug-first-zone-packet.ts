// Capture and analyze the FIRST zone packet
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
  let zonePacketsCaptured = 0;

  client.on('debug', (msg: string) => {
    // Capture zone packet data from debug
    if (msg.includes('[ZONE]') && msg.includes('Received:')) {
      const hexMatch = msg.match(/hex=([a-f0-9]+)/);
      if (hexMatch) {
        const hex = hexMatch[1];
        const buf = Buffer.from(hex, 'hex');

        // Check if compressed (5a78)
        if (buf.length >= 4 && buf[2] === 0x5a && buf[3] === 0x78) {
          zonePacketsCaptured++;
          if (zonePacketsCaptured <= 5) {
            console.log(`\n=== Zone Packet ${zonePacketsCaptured} ===`);
            console.log(`Raw length: ${buf.length} bytes`);
            console.log(`Raw hex (all): ${buf.toString('hex')}`);

            try {
              const compressed = buf.slice(3);
              const decompressed = zlib.inflateSync(compressed);
              console.log(`\nDecompressed: ${decompressed.length} bytes`);
              console.log(`First 50 hex: ${decompressed.slice(0, 50).toString('hex')}`);

              // Analyze structure
              const seqBE = decompressed.readUInt16BE(0);
              console.log(`\nSequence (BE): ${seqBE}`);

              // For seq=0, check if there's a total_size
              if (seqBE === 0) {
                if (decompressed.length >= 6) {
                  const sizeBE = decompressed.readUInt32BE(2);
                  const sizeLE = decompressed.readUInt32LE(2);
                  console.log(`Potential total_size at offset 2:`);
                  console.log(`  BE: ${sizeBE}`);
                  console.log(`  LE: ${sizeLE}`);

                  // Opcode at offset 6
                  if (decompressed.length >= 8) {
                    const opBE = decompressed.readUInt16BE(6);
                    const opLE = decompressed.readUInt16LE(6);
                    console.log(`Potential opcode at offset 6:`);
                    console.log(`  BE: 0x${opBE.toString(16)}`);
                    console.log(`  LE: 0x${opLE.toString(16)}`);
                  }
                }
              }

              // Check for non-zero content
              let nonZeroCount = 0;
              let firstNonZero = -1;
              for (let i = 0; i < decompressed.length; i++) {
                if (decompressed[i] !== 0) {
                  nonZeroCount++;
                  if (firstNonZero === -1) firstNonZero = i;
                }
              }
              console.log(`Non-zero bytes: ${nonZeroCount}, first at offset ${firstNonZero}`);

            } catch (e) {
              console.log(`Decompress failed: ${(e as Error).message}`);
            }
          }
        }
      }
    }

    // Show zone status
    if (msg.includes('Zone') && !msg.includes('hex=')) {
      console.log('[DBG]', msg.substring(0, 100));
    }
  });

  client.on('status', (msg: string) => {
    console.log('[STATUS]', msg);
  });

  client.on('serverList', (servers: any[]) => {
    if (servers.length > 0) client.selectServer(1);
  });

  try {
    console.log('Connecting and entering zone...');
    await client.connect();

    // Wait and check characters
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 500));
      const chars = client.getCharacters();
      if (chars.length > 0) {
        console.log(`Found character: ${chars[0].name}`);
        await client.enterWorld(chars[0].name);
        break;
      }
    }

    // Wait for zone packets
    console.log('Waiting for zone packets...');
    await new Promise(r => setTimeout(r, 5000));

    console.log(`\nTotal zone packets captured: ${zonePacketsCaptured}`);
  } catch (err) {
    console.error('Error:', err);
  }

  process.exit(0);
}

main();
