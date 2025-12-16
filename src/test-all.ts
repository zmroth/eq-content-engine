#!/usr/bin/env npx ts-node
// Comprehensive test of all EQ client features
import { EQClient } from './client/eq-client';
import { parseMapFile, generateMapVisualization } from './map-parser';
import * as fs from 'fs';

const config = {
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
};

async function testMapParser(): Promise<boolean> {
  console.log('\n━━━ TEST 1: Map Parser ━━━');
  const mapPath = '/home/zachroth/akk-stack/server/maps/legacy/base/arena.map';

  if (!fs.existsSync(mapPath)) {
    console.log('⚠️  Map file not found - skipping');
    return true;
  }

  const mapData = parseMapFile(mapPath);
  if (!mapData || mapData.faces.length === 0) {
    console.log('❌ Map parsing failed');
    return false;
  }

  console.log(`✅ Parsed ${mapData.faces.length} triangles`);
  console.log(`   Bounds: X(${mapData.bounds.minX.toFixed(0)} to ${mapData.bounds.maxX.toFixed(0)})`);
  return true;
}

async function testClient(): Promise<boolean> {
  console.log('\n━━━ TEST 2: EQ Client Connection ━━━');
  const client = new EQClient(config);
  let passed = true;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('❌ Connection timeout');
      resolve(false);
    }, 30000);

    let stage = 0;

    client.on('status', (msg: string) => {
      if (msg.includes('Connected to login')) {
        console.log('✅ Login server connected');
        stage = 1;
      }
      if (msg.includes('Connected to world')) {
        console.log('✅ World server connected');
        stage = 2;
      }
      if (msg.includes('character list')) {
        console.log('✅ Character list received');
        stage = 3;
      }
      if (msg.includes('Connected to zone')) {
        console.log('✅ Zone server connected');
        stage = 4;
      }
      if (msg.includes('Zone entry complete')) {
        console.log('✅ Zone entry complete');
        stage = 5;
      }
    });

    client.on('error', (err: Error) => {
      console.log('❌ Error:', err.message);
      passed = false;
    });

    client.on('serverList', (servers: any[]) => {
      console.log(`✅ Server list: ${servers.length} servers`);
      if (servers.length > 0) client.selectServer(1);
    });

    client.on('playerProfile', (p: any) => {
      console.log(`✅ Player profile: ${p.name} Level ${p.level}`);
    });

    client.on('spawn', () => {
      // Count spawns silently
    });

    client.connect().then(async () => {
      // Wait for character list
      await new Promise(r => setTimeout(r, 8000));

      const chars = client.getCharacters();
      if (chars.length === 0) {
        console.log('❌ No characters found');
        clearTimeout(timeout);
        resolve(false);
        return;
      }

      console.log(`✅ Found ${chars.length} character(s): ${chars.map(c => c.name).join(', ')}`);

      // Enter world
      await client.enterWorld(chars[0].name);
      await new Promise(r => setTimeout(r, 15000));

      // Check results
      const entities = client.getEntities();
      const pos = client.getPosition();
      const withCoords = entities.filter(e => e.x !== 0 || e.y !== 0);

      console.log(`\n━━━ TEST 3: Zone Data ━━━`);
      console.log(`✅ Entities: ${entities.length} total`);
      console.log(`✅ With coordinates: ${withCoords.length}`);
      console.log(`✅ Player position: (${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}, ${pos.z.toFixed(0)})`);

      if (entities.length > 0) {
        const npcs = entities.filter(e => e.isNpc);
        console.log(`✅ NPCs: ${npcs.length}`);
        console.log(`   Sample: ${npcs.slice(0, 5).map(n => n.name).join(', ')}`);
      }

      clearTimeout(timeout);
      resolve(passed && entities.length > 0);
    }).catch((err) => {
      console.log('❌ Connection failed:', err.message);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   EQ Content Engine - Full Test Suite  ║');
  console.log('╚════════════════════════════════════════╝');

  const results: { name: string; passed: boolean }[] = [];

  // Test 1: Map Parser
  results.push({ name: 'Map Parser', passed: await testMapParser() });

  // Test 2 & 3: Client + Zone Data
  results.push({ name: 'Client Connection', passed: await testClient() });

  // Summary
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║            TEST RESULTS                ║');
  console.log('╠════════════════════════════════════════╣');
  results.forEach(r => {
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`║ ${status}  ${r.name.padEnd(27)} ║`);
  });
  console.log('╚════════════════════════════════════════╝');

  const allPassed = results.every(r => r.passed);
  console.log(allPassed ? '\n🎉 All tests passed!' : '\n⚠️  Some tests failed');

  process.exit(allPassed ? 0 : 1);
}

main();
