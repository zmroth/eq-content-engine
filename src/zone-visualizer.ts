// Zone Visualizer - Creates an interactive HTML map of the zone
import * as fs from 'fs';
import { EQClient } from './client/eq-client';

const client = new EQClient({
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
});

console.log('\n=== EQ Zone Visualizer ===\n');

client.on('status', (m: string) => console.log('[STATUS]', m));
client.on('serverList', (servers: any[]) => {
  if (servers.length > 0) client.selectServer(1);
});

async function main() {
  try {
    await client.connect();
    console.log('[INFO] Waiting for character list...');

    // Wait for character list with polling
    let chars: any[] = [];
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500));
      chars = client.getCharacters();
      if (chars.length > 0) break;
    }

    if (chars.length === 0) {
      console.log('[ERROR] No characters found after 15 seconds');
      process.exit(1);
    }

    console.log(`[INFO] Found ${chars.length} character(s)`);
    console.log(`[INFO] Entering world as ${chars[0].name}...`);
    await client.enterWorld(chars[0].name);

    console.log('[INFO] Waiting for zone data (20 seconds)...');
    await new Promise(r => setTimeout(r, 20000));

    // Collect spawn data
    const entities = client.getEntities();
    const pos = client.getPosition();

    console.log(`[INFO] Collected ${entities.length} entities`);

    // Generate HTML visualization
    const html = generateVisualization(entities, pos);

    // Save to file
    const outputPath = '/home/zachroth/eq-content-engine/zone-map.html';
    fs.writeFileSync(outputPath, html);
    console.log(`\n[SUCCESS] Zone map saved to: ${outputPath}`);
    console.log('[INFO] Open this file in a browser to view the interactive map!');

    process.exit(0);
  } catch (e) {
    console.log('[ERROR]', (e as Error).message);
    process.exit(1);
  }
}

function generateVisualization(entities: any[], playerPos: any): string {
  // Filter entities with valid coordinates
  const spawns = entities.filter(e => e.x !== 0 || e.y !== 0 || e.z !== 0);

  // Calculate bounds
  const xs = spawns.map(e => e.x);
  const ys = spawns.map(e => e.y);
  const zs = spawns.map(e => e.z);

  const minX = Math.min(...xs, playerPos.x) - 100;
  const maxX = Math.max(...xs, playerPos.x) + 100;
  const minY = Math.min(...ys, playerPos.y) - 100;
  const maxY = Math.max(...ys, playerPos.y) + 100;
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);

  // Generate spawn data as JSON
  const spawnData = spawns.map(e => ({
    name: e.name,
    x: e.x,
    y: e.y,
    z: e.z,
    level: e.level,
    isNpc: e.isNpc,
    class_: e.class_,
    race: e.race,
  }));

  return `<!DOCTYPE html>
<html>
<head>
  <title>EverQuest Zone Map</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e0e0e0;
      min-height: 100vh;
      overflow: hidden;
    }
    #container {
      display: flex;
      height: 100vh;
    }
    #map-container {
      flex: 1;
      position: relative;
      overflow: hidden;
    }
    #canvas {
      position: absolute;
      cursor: grab;
    }
    #canvas:active { cursor: grabbing; }
    #sidebar {
      width: 320px;
      background: rgba(0,0,0,0.5);
      padding: 20px;
      overflow-y: auto;
      border-left: 1px solid #333;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: #00d4ff;
      text-shadow: 0 0 10px rgba(0,212,255,0.5);
    }
    h2 {
      font-size: 1rem;
      margin: 15px 0 10px;
      color: #ffd700;
    }
    .stat {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid #333;
    }
    .stat-label { color: #888; }
    .stat-value { color: #fff; font-weight: bold; }
    #spawn-list {
      max-height: 300px;
      overflow-y: auto;
    }
    .spawn-item {
      padding: 8px;
      margin: 4px 0;
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .spawn-item:hover {
      background: rgba(0,212,255,0.2);
      transform: translateX(5px);
    }
    .spawn-name { font-weight: bold; }
    .spawn-coords { font-size: 0.8rem; color: #888; }
    #tooltip {
      position: absolute;
      background: rgba(0,0,0,0.9);
      border: 1px solid #00d4ff;
      padding: 10px;
      border-radius: 5px;
      pointer-events: none;
      display: none;
      z-index: 1000;
      max-width: 200px;
    }
    #search {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      background: rgba(255,255,255,0.1);
      border: 1px solid #444;
      border-radius: 5px;
      color: #fff;
    }
    #search:focus {
      outline: none;
      border-color: #00d4ff;
    }
    .controls {
      margin: 15px 0;
      display: flex;
      gap: 10px;
    }
    button {
      padding: 8px 15px;
      background: #00d4ff;
      border: none;
      border-radius: 5px;
      color: #000;
      cursor: pointer;
      font-weight: bold;
    }
    button:hover { background: #00b8e6; }
    #minimap {
      position: absolute;
      bottom: 20px;
      right: 340px;
      width: 150px;
      height: 150px;
      background: rgba(0,0,0,0.7);
      border: 1px solid #00d4ff;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="map-container">
      <canvas id="canvas"></canvas>
      <canvas id="minimap"></canvas>
    </div>
    <div id="sidebar">
      <h1>🗺️ Zone Map</h1>

      <input type="text" id="search" placeholder="Search spawns...">

      <div class="controls">
        <button onclick="resetView()">Reset View</button>
        <button onclick="toggleLabels()">Toggle Labels</button>
      </div>

      <h2>📊 Statistics</h2>
      <div class="stat">
        <span class="stat-label">Total Spawns</span>
        <span class="stat-value" id="total-spawns">0</span>
      </div>
      <div class="stat">
        <span class="stat-label">NPCs</span>
        <span class="stat-value" id="npc-count">0</span>
      </div>
      <div class="stat">
        <span class="stat-label">Zone Bounds X</span>
        <span class="stat-value" id="bounds-x">-</span>
      </div>
      <div class="stat">
        <span class="stat-label">Zone Bounds Y</span>
        <span class="stat-value" id="bounds-y">-</span>
      </div>
      <div class="stat">
        <span class="stat-label">Zone Bounds Z</span>
        <span class="stat-value" id="bounds-z">-</span>
      </div>

      <h2>📍 Spawns</h2>
      <div id="spawn-list"></div>
    </div>
  </div>

  <div id="tooltip"></div>

  <script>
    const spawns = ${JSON.stringify(spawnData)};
    const playerPos = ${JSON.stringify(playerPos)};
    const bounds = {
      minX: ${minX}, maxX: ${maxX},
      minY: ${minY}, maxY: ${maxY},
      minZ: ${minZ}, maxZ: ${maxZ}
    };

    // Canvas setup
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const minimap = document.getElementById('minimap');
    const minimapCtx = minimap.getContext('2d');

    let scale = 0.1;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let showLabels = true;
    let hoveredSpawn = null;

    function resize() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      minimap.width = 150;
      minimap.height = 150;
      draw();
    }

    function worldToScreen(x, y) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      return {
        x: cx + (x - offsetX) * scale,
        y: cy - (y - offsetY) * scale  // Invert Y for screen coords
      };
    }

    function screenToWorld(sx, sy) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      return {
        x: (sx - cx) / scale + offsetX,
        y: -(sy - cy) / scale + offsetY
      };
    }

    function draw() {
      ctx.fillStyle = '#0a0a15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(100,100,100,0.2)';
      ctx.lineWidth = 1;
      const gridSize = 500;
      const startWorld = screenToWorld(0, canvas.height);
      const endWorld = screenToWorld(canvas.width, 0);

      for (let x = Math.floor(startWorld.x / gridSize) * gridSize; x < endWorld.x; x += gridSize) {
        const screen = worldToScreen(x, 0);
        ctx.beginPath();
        ctx.moveTo(screen.x, 0);
        ctx.lineTo(screen.x, canvas.height);
        ctx.stroke();
      }

      for (let y = Math.floor(startWorld.y / gridSize) * gridSize; y < endWorld.y; y += gridSize) {
        const screen = worldToScreen(0, y);
        ctx.beginPath();
        ctx.moveTo(0, screen.y);
        ctx.lineTo(canvas.width, screen.y);
        ctx.stroke();
      }

      // Draw spawns
      spawns.forEach(spawn => {
        const pos = worldToScreen(spawn.x, spawn.y);
        const radius = spawn === hoveredSpawn ? 8 : 5;

        // Color by type
        const color = spawn.isNpc ? '#ff6b6b' : '#4ecdc4';
        const glow = spawn === hoveredSpawn ? 15 : 0;

        if (glow > 0) {
          ctx.shadowColor = color;
          ctx.shadowBlur = glow;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Draw label
        if (showLabels && scale > 0.05) {
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.font = '10px sans-serif';
          ctx.fillText(spawn.name, pos.x + 8, pos.y + 3);
        }
      });

      // Draw player position
      const playerScreen = worldToScreen(playerPos.x, playerPos.y);
      ctx.fillStyle = '#00d4ff';
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(playerScreen.x, playerScreen.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Player label
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('YOU', playerScreen.x + 12, playerScreen.y + 4);

      // Draw minimap
      drawMinimap();
    }

    function drawMinimap() {
      minimapCtx.fillStyle = '#1a1a2e';
      minimapCtx.fillRect(0, 0, 150, 150);

      const scaleX = 140 / (bounds.maxX - bounds.minX);
      const scaleY = 140 / (bounds.maxY - bounds.minY);
      const mapScale = Math.min(scaleX, scaleY);

      spawns.forEach(spawn => {
        const mx = 5 + (spawn.x - bounds.minX) * mapScale;
        const my = 145 - (spawn.y - bounds.minY) * mapScale;
        minimapCtx.fillStyle = spawn.isNpc ? '#ff6b6b' : '#4ecdc4';
        minimapCtx.fillRect(mx - 1, my - 1, 2, 2);
      });

      // Player on minimap
      const px = 5 + (playerPos.x - bounds.minX) * mapScale;
      const py = 145 - (playerPos.y - bounds.minY) * mapScale;
      minimapCtx.fillStyle = '#00d4ff';
      minimapCtx.fillRect(px - 3, py - 3, 6, 6);
    }

    // Event handlers
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      scale *= factor;
      scale = Math.max(0.01, Math.min(1, scale));
      draw();
    });

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        offsetX -= (e.clientX - dragStart.x) / scale;
        offsetY += (e.clientY - dragStart.y) / scale;
        dragStart = { x: e.clientX, y: e.clientY };
        draw();
      }

      // Check hover
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const world = screenToWorld(mx, my);

      hoveredSpawn = null;
      for (const spawn of spawns) {
        const dist = Math.sqrt(Math.pow(spawn.x - world.x, 2) + Math.pow(spawn.y - world.y, 2));
        if (dist < 50 / scale) {
          hoveredSpawn = spawn;
          break;
        }
      }

      const tooltip = document.getElementById('tooltip');
      if (hoveredSpawn) {
        tooltip.innerHTML = \`
          <div style="font-weight:bold;color:#00d4ff">\${hoveredSpawn.name}</div>
          <div>Level: \${hoveredSpawn.level || '?'}</div>
          <div>Loc: (\${hoveredSpawn.x}, \${hoveredSpawn.y}, \${hoveredSpawn.z})</div>
          <div>Type: \${hoveredSpawn.isNpc ? 'NPC' : 'Player'}</div>
        \`;
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
      } else {
        tooltip.style.display = 'none';
      }

      draw();
    });

    canvas.addEventListener('mouseup', () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
      isDragging = false;
      document.getElementById('tooltip').style.display = 'none';
    });

    // Controls
    function resetView() {
      scale = 0.1;
      offsetX = 0;
      offsetY = 0;
      draw();
    }

    function toggleLabels() {
      showLabels = !showLabels;
      draw();
    }

    // Search
    document.getElementById('search').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      updateSpawnList(query);
    });

    function updateSpawnList(filter = '') {
      const list = document.getElementById('spawn-list');
      const filtered = spawns.filter(s =>
        s.name.toLowerCase().includes(filter)
      ).slice(0, 50);

      list.innerHTML = filtered.map(s => \`
        <div class="spawn-item" onclick="focusSpawn(\${s.x}, \${s.y})">
          <div class="spawn-name">\${s.name}</div>
          <div class="spawn-coords">(\${s.x}, \${s.y}, \${s.z})</div>
        </div>
      \`).join('');
    }

    function focusSpawn(x, y) {
      offsetX = x;
      offsetY = y;
      scale = 0.3;
      draw();
    }

    // Initialize
    window.addEventListener('resize', resize);
    resize();

    // Update stats
    document.getElementById('total-spawns').textContent = spawns.length;
    document.getElementById('npc-count').textContent = spawns.filter(s => s.isNpc).length;
    document.getElementById('bounds-x').textContent = \`\${bounds.minX.toFixed(0)} to \${bounds.maxX.toFixed(0)}\`;
    document.getElementById('bounds-y').textContent = \`\${bounds.minY.toFixed(0)} to \${bounds.maxY.toFixed(0)}\`;
    document.getElementById('bounds-z').textContent = \`\${bounds.minZ.toFixed(0)} to \${bounds.maxZ.toFixed(0)}\`;

    updateSpawnList();
  </script>
</body>
</html>`;
}

main();
