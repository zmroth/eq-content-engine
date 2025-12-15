// Test decompressing zone fragment - full packet
import zlib from 'zlib';

// Full 135-byte zone fragment from test output (after stripping 000d session opcode)
// Original: 000d5a780163606060f0e9ba5f7a6fe3ee74209381058a41ec94140686bd
// But that's truncated. Let's look at what format this really is.

// Looking at the pattern: all packets start 000d5a78
// If 5a78 is NOT a compression marker but rather the sequence number...
// Then sequence = 0x5A78 = 23160

// Let's analyze the data structure more carefully
// 000d = Fragment opcode
// 5a78 = Could be: (a) sequence, (b) compression marker
// Next bytes: 0163606060...

// Try treating it as a normal fragment with high starting sequence
const sequence = 0x5a78;
console.log('Sequence interpretation:', sequence);

// The bytes after session opcode: 5a 78 01 63 60 60 60 f0 e9 ba 5f...
// If byte 2 (5a) is part of sequence, and data starts at byte 4:
// Data would be: 01 63 60 60 60 f0...

// For a FIRST fragment, bytes 4-7 would be total_size
// Total size = 0x01636060 = 23,232,608 - way too big

// So this isn't a normal fragment format. Let's try different decompression approaches.

// Option 1: Maybe bytes 2-3 are sequence, 4+ is compressed data
// Option 2: Maybe there's no sequence, just 5a as marker, 78+ is zlib

// Looking at zlib headers:
// 78 01 = zlib, low compression
// 78 9c = zlib, default compression
// 78 da = zlib, best compression

// Our data after 5a: 78 01 63 60...
// 78 01 is a valid zlib header!

// But wait - "78 01" followed by "63 60..." might not be valid zlib.
// Let me check what 63 60 60 means in zlib context.

// In deflate format, 63 is a literal block header
// Let's try inflating raw deflate instead of zlib

const testData = Buffer.from('0163606060f0e9ba5f7a6fe3ee74', 'hex');
console.log('Test data:', testData.toString('hex'));

// Try as raw deflate (without zlib header)
try {
  const result = zlib.inflateRawSync(testData);
  console.log('Raw inflate result:', result.toString('hex'));
} catch (e) {
  console.log('Raw inflate failed:', (e as Error).message);
}

// Try including 78 01 as zlib header
const withHeader = Buffer.from('780163606060f0e9ba5f7a6fe3ee74', 'hex');
try {
  const result = zlib.inflateSync(withHeader);
  console.log('Zlib inflate result:', result.toString('hex'));
} catch (e) {
  console.log('Zlib inflate failed:', (e as Error).message);
}

// Maybe the packets are just raw session data, not compressed at all
// The format could be:
// 000d = Fragment
// 5a78 = Sequence (high starting value is fine for zone)
// 0163606060... = Fragment data (uncompressed)

console.log('\nMaybe treating as normal fragment with high sequence...');
const fragmentData = Buffer.from('0163606060f0e9ba5f7a6fe3ee74', 'hex');
console.log('Fragment data length:', fragmentData.length);
console.log('First 4 bytes as total_size (BE):', fragmentData.readUInt32BE(0));
console.log('First 4 bytes as total_size (LE):', fragmentData.readUInt32LE(0));
