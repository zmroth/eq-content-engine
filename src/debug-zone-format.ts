// Debug script to understand zone compressed packet format
import zlib from 'zlib';

// Sample zone packets from the test output
const samplePackets = [
  // First zone packet (135 bytes)
  '000d5a780163606060f0e9ba5f1a1515fc00c864608162103b258581612f',
  // Short packets (20 bytes each)
  '000d5a780163606418052333040003f50002cb03',
  '000d5a780163606218052333040005ef000348ac',
  '000d5a780163606618052333040007e900041ab4',
  // Packet that shows Zone packet: 0xffff
  '000d5a78016360fd3f0a46660800004ae7f71c471b',
];

console.log('Zone Compressed Packet Format Analysis');
console.log('='.repeat(70));

for (let i = 0; i < samplePackets.length; i++) {
  const hex = samplePackets[i];
  const buf = Buffer.from(hex, 'hex');

  console.log(`\n--- Packet ${i + 1} ---`);
  console.log(`Raw hex: ${hex}`);
  console.log(`Raw length: ${buf.length} bytes`);

  // Parse session layer
  const sessionOpcode = buf.readUInt16BE(0);
  console.log(`Session opcode: 0x${sessionOpcode.toString(16)} (${sessionOpcode === 0x000d ? 'OP_Fragment' : 'other'})`);
  console.log(`Byte 2: 0x${buf[2].toString(16)} (${buf[2] === 0x5a ? 'Z=compressed' : 'other'})`);
  console.log(`Byte 3: 0x${buf[3].toString(16)} (${buf[3] === 0x78 ? 'zlib header' : 'other'})`);

  // Decompress starting from byte 3 (skip 000d5a)
  try {
    const compressed = buf.slice(3);
    console.log(`Compressed data (${compressed.length} bytes): ${compressed.slice(0, 20).toString('hex')}...`);

    const decompressed = zlib.inflateSync(compressed);
    console.log(`\nDecompressed length: ${decompressed.length} bytes`);
    console.log(`Decompressed hex: ${decompressed.toString('hex')}`);

    // Analyze structure
    console.log('\n--- Structure Analysis ---');

    // Option A: First 2 bytes = sequence (BE)
    const seqBE = decompressed.readUInt16BE(0);
    const seqLE = decompressed.readUInt16LE(0);
    console.log(`Bytes 0-1: BE=${seqBE}, LE=${seqLE}, hex=${decompressed.slice(0,2).toString('hex')}`);

    // Option B: First 2 bytes = opcode (LE)
    console.log(`If bytes 0-1 are opcode (LE): 0x${seqLE.toString(16)}`);

    // What's at bytes 2-3?
    if (decompressed.length >= 4) {
      const b23LE = decompressed.readUInt16LE(2);
      const b23BE = decompressed.readUInt16BE(2);
      console.log(`Bytes 2-3: LE=0x${b23LE.toString(16)}, BE=0x${b23BE.toString(16)}, hex=${decompressed.slice(2,4).toString('hex')}`);
    }

    // What's at bytes 4-7?
    if (decompressed.length >= 8) {
      const b47LE = decompressed.readUInt32LE(4);
      const b47BE = decompressed.readUInt32BE(4);
      console.log(`Bytes 4-7: LE=${b47LE}, BE=${b47BE}, hex=${decompressed.slice(4,8).toString('hex')}`);
    }

    // Check for ASCII content
    const hasAscii = Array.from(decompressed.slice(0, 20)).some(b => b >= 32 && b <= 126);
    if (hasAscii) {
      const ascii = decompressed.slice(0, 40).toString('utf8').replace(/[^\x20-\x7E]/g, '.');
      console.log(`ASCII (first 40): "${ascii}"`);
    }

    // Count non-zero bytes
    let nonZeroCount = 0;
    let lastNonZeroOffset = -1;
    for (let j = 0; j < decompressed.length; j++) {
      if (decompressed[j] !== 0) {
        nonZeroCount++;
        lastNonZeroOffset = j;
      }
    }
    console.log(`Non-zero bytes: ${nonZeroCount} / ${decompressed.length}`);
    console.log(`Last non-zero at offset: ${lastNonZeroOffset}`);

  } catch (e) {
    console.log(`Decompress failed: ${(e as Error).message}`);
  }
}

// Also analyze OP_Combined compressed packet
console.log('\n' + '='.repeat(70));
console.log('OP_Combined Compressed Packet Analysis');
console.log('='.repeat(70));

const combinedPacket = '00035a7801e363e06468681065b2e6e69cc2cfc06006e4365a863100c17f';
const combinedBuf = Buffer.from(combinedPacket, 'hex');

console.log(`Raw hex: ${combinedPacket}`);
console.log(`Session opcode: 0x${combinedBuf.readUInt16BE(0).toString(16)}`);
console.log(`Byte 2: 0x${combinedBuf[2].toString(16)}`);

try {
  const compressed = combinedBuf.slice(3);
  const decompressed = zlib.inflateSync(compressed);
  console.log(`Decompressed length: ${decompressed.length} bytes`);
  console.log(`Decompressed hex: ${decompressed.toString('hex')}`);

  // OP_Combined format: [length][sub-packet][length][sub-packet]...
  let offset = 0;
  let subPacketNum = 0;
  while (offset < decompressed.length) {
    const len = decompressed.readUInt8(offset);
    if (len === 0 || offset + 1 + len > decompressed.length) break;

    subPacketNum++;
    const subPacket = decompressed.slice(offset + 1, offset + 1 + len);
    console.log(`\nSub-packet ${subPacketNum}: length=${len}`);
    console.log(`  Hex: ${subPacket.toString('hex')}`);

    if (subPacket.length >= 2) {
      // Sub-packets should have format: [00][opcode][data...]
      if (subPacket[0] === 0x00) {
        const sessionOp = subPacket[1];
        console.log(`  Session opcode: 0x${sessionOp.toString(16)}`);
        if (sessionOp === 0x09 && subPacket.length >= 6) {
          // OP_Packet: [00][09][seq_BE][app_opcode_LE][data...]
          const seq = subPacket.readUInt16BE(2);
          const appOpcode = subPacket.readUInt16LE(4);
          console.log(`  Sequence: ${seq}, App opcode: 0x${appOpcode.toString(16)}`);
        }
      } else {
        // No 0x00 prefix - might be raw app data
        const opcode = subPacket.readUInt16LE(0);
        console.log(`  Direct app opcode: 0x${opcode.toString(16)}`);
      }
    }

    offset += 1 + len;
  }
} catch (e) {
  console.log(`Decompress failed: ${(e as Error).message}`);
}
