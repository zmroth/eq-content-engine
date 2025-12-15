// Analyze the first large zone packet
import zlib from 'zlib';

// First zone packet - 135 bytes (might be the one with actual content)
// Let's capture a real first packet and analyze it
// From earlier test: 000d5a780163606060f0e9ba5f7a6fe3ee74209381058a41ec94140686bd (30 bytes truncated)

// Let's use the quick zone test to capture more of the actual first packet
// For now, let's analyze the structure we know:

console.log('Zone Packet Format Analysis:');
console.log('='.repeat(60));
console.log('Session layer:');
console.log('  000d = Fragment opcode');
console.log('  5a = Compression marker (Z)');
console.log('  78... = Zlib compressed data');
console.log('');
console.log('Decompressed content (505 bytes each):');
console.log('  bytes 0-1: Sequence (BE)');
console.log('  bytes 2+: ???');
console.log('');
console.log('The decompressed data is mostly zeros - this might be:');
console.log('  1. PlayerProfile struct (very large with many empty fields)');
console.log('  2. Spawn data');
console.log('  3. Zone info');
console.log('');

// The issue is: each 505-byte block is being processed separately
// But they should probably be:
//   - Individual packets if opcode at offset 2 is valid
//   - OR fragments that need assembly based on seq

// Let's check: if zone sends PlayerProfile (~5KB),
// it would be about 10-11 x 505 byte packets

console.log('If these are standalone app packets:');
console.log('  - Each 505 bytes should have [opcode LE 2 bytes][data...]');
console.log('  - Opcode 0x0000 is not valid');
console.log('');
console.log('If these are fragment pieces:');
console.log('  - Seq 0 or 1 should contain total_size');
console.log('  - But we see total_size = 0');
console.log('');
console.log('HYPOTHESIS: Maybe the format is different...');
console.log('  - No total_size prefix');
console.log('  - Just sequence-ordered data chunks');
console.log('  - Need to buffer until we get OP_ReqClientSpawn or similar "done" signal');
