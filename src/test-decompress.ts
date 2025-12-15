// Test decompressing zone fragment data
import zlib from 'zlib';

// Sample zone fragment (skip first 2 bytes - session opcode)
// 000d5a780163606060f0e9ba5f7a6fe3ee74209381058a41ec94140686bd...
const hexData = '5a780163606060f0e9ba5f7a6fe3ee74209381058a41ec94140686bd';
const buffer = Buffer.from(hexData, 'hex');

console.log('Raw data:', buffer.toString('hex'));
console.log('First bytes:', buffer[0].toString(16), buffer[1].toString(16), buffer[2].toString(16));

// Skip 0x5a marker
const zlibData = buffer.slice(1);
console.log('Zlib data:', zlibData.toString('hex'));

try {
  const decompressed = zlib.inflateSync(zlibData);
  console.log('\nDecompressed length:', decompressed.length);
  console.log('Decompressed hex:', decompressed.toString('hex'));
  console.log('As string (if printable):', decompressed.toString('utf8').replace(/[^\x20-\x7E]/g, '.'));

  // Check first few bytes for opcode
  if (decompressed.length >= 2) {
    const opcode = decompressed.readUInt16LE(0);
    console.log('Potential opcode (LE):', '0x' + opcode.toString(16));
  }
} catch (e) {
  console.error('Decompression failed:', e);
}
