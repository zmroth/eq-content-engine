// Analyze decompressed zone data structure
import zlib from 'zlib';

// Full 20-byte zone packet from test output
const packets = [
  '000d5a780163606418052333040003f50002851c',  // seq 256 in my previous test
  '000d5a780163606218052333040005ef000306b3',  // seq 512
  '000d5a780163606618052333040007e9000454ab',  // seq 768
];

for (const hex of packets) {
  console.log('='.repeat(60));
  const buf = Buffer.from(hex, 'hex');
  console.log('Raw:', hex);

  // Skip 000d (session), 5a (compress marker), decompress from 78...
  const compressed = buf.slice(3); // Skip 000d5a
  console.log('Compressed (starting with zlib header):', compressed.toString('hex'));

  try {
    const decompressed = zlib.inflateSync(compressed);
    console.log('Decompressed length:', decompressed.length);
    console.log('Decompressed hex:', decompressed.toString('hex').substring(0, 100));

    // Analyze the decompressed structure
    // It looks like: [seq_lo][seq_hi][opcode_lo][opcode_hi][data...]
    // or maybe: [seq_16bit][opcode_16bit][data...]

    if (decompressed.length >= 4) {
      console.log('\nParsing decompressed data:');
      console.log('  Bytes 0-1:', decompressed.slice(0, 2).toString('hex'));
      console.log('  Bytes 2-3:', decompressed.slice(2, 4).toString('hex'));
      console.log('  Bytes 4-5:', decompressed.slice(4, 6).toString('hex'));

      const seq16LE = decompressed.readUInt16LE(0);
      const seq16BE = decompressed.readUInt16BE(0);
      console.log('  Seq if LE at 0:', seq16LE);
      console.log('  Seq if BE at 0:', seq16BE);

      // Maybe sequence is a single byte?
      console.log('  Byte 0 alone:', decompressed[0]);
      console.log('  Byte 1 alone:', decompressed[1]);

      // App opcode at offset 2?
      const opcodeLE = decompressed.readUInt16LE(2);
      const opcodeBE = decompressed.readUInt16BE(2);
      console.log('  Opcode if LE at 2:', '0x' + opcodeLE.toString(16));
      console.log('  Opcode if BE at 2:', '0x' + opcodeBE.toString(16));
    }
  } catch (e) {
    console.log('Decompress failed:', (e as Error).message);
  }
}
