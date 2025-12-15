// Analyze zone packet structure
import zlib from 'zlib';

// Sample zone packets (full hex from test output)
const packets = [
  '000d5a780163606060f0e9ba5fea9a362d10c864608162103b258581612f',  // 135 bytes (truncated in log)
  '000d5a780163606418052333040003f50002851c',  // 20 bytes
  '000d5a780163606218052333040005ef000306b3',  // 20 bytes
  '000d5a780163606618052333040007e9000454ab',  // 20 bytes
];

for (const hex of packets) {
  console.log('='.repeat(60));
  const buf = Buffer.from(hex, 'hex');
  console.log('Packet length:', buf.length, 'bytes');
  console.log('Hex:', hex);

  // Parse session layer
  console.log('Session opcode:', '0x' + buf.readUInt16BE(0).toString(16));
  console.log('Bytes 2-3 (potential sequence BE):', '0x' + buf.readUInt16BE(2).toString(16), '=', buf.readUInt16BE(2));

  // Look at data starting at byte 4
  const data = buf.slice(4);
  console.log('Data at offset 4:', data.toString('hex'));

  // Try to interpret as app packet
  if (data.length >= 2) {
    const opcodeLE = data.readUInt16LE(0);
    const opcodeBE = data.readUInt16BE(0);
    console.log('Opcode if LE at offset 4:', '0x' + opcodeLE.toString(16));
    console.log('Opcode if BE at offset 4:', '0x' + opcodeBE.toString(16));
  }

  // Check for zlib signature at different offsets
  for (let i = 2; i < Math.min(buf.length - 1, 8); i++) {
    if (buf[i] === 0x78) {
      console.log(`Found 0x78 (zlib header) at offset ${i}`);
      try {
        const decompressed = zlib.inflateSync(buf.slice(i));
        console.log(`  Decompressed from offset ${i}:`, decompressed.length, 'bytes');
        console.log('  First bytes:', decompressed.slice(0, 20).toString('hex'));
      } catch (e) {
        console.log(`  Decompress from offset ${i} failed:`, (e as Error).message.split('\n')[0]);
      }
    }
  }

  // The last 4 bytes often look like counters/CRCs
  if (buf.length >= 8) {
    const last4 = buf.slice(-4);
    console.log('Last 4 bytes:', last4.toString('hex'), '=', last4.readUInt32BE(0), '(BE)');
  }
}

// Looking at the pattern: all packets have 0163 after the sequence
// Let's see if 0163 is part of some encoding
console.log('\n='.repeat(60));
console.log('Pattern analysis: 0x0163 appears in all packets after sequence');
console.log('0x63 = 99 decimal, 0x01 0x63 could be a length or type marker');

// Maybe bytes 4-5 are a sub-header?
const subHeaders = packets.map(hex => {
  const buf = Buffer.from(hex, 'hex');
  return buf.slice(4, 6).toString('hex');
});
console.log('Sub-headers (bytes 4-5):', subHeaders);
