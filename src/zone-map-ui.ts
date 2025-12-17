// EQ Zone Map UI - Clean 2D minimap with live player/NPC tracking
import * as fs from 'fs';
import * as http from 'http';
import * as zlib from 'zlib';
import { WebSocketServer, WebSocket } from 'ws';

interface Vertex { x: number; y: number; z: number; }
interface Face { v1: Vertex; v2: Vertex; v3: Vertex; }
interface Bounds { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number; }

// Parse .map file to get floor outlines
function parseMapFloors(mapPath: string): { edges: number[][], bounds: Bounds } | null {
  try {
    const data = fs.readFileSync(mapPath);
    const decompressed = zlib.inflateSync(data.slice(12));
    const faceCount = decompressed.readUInt32LE(0);

    const edges: number[][] = [];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < faceCount; i++) {
      const offset = 40 + (i * 36);
      const v1 = { x: decompressed.readFloatLE(offset), y: decompressed.readFloatLE(offset+4), z: decompressed.readFloatLE(offset+8) };
      const v2 = { x: decompressed.readFloatLE(offset+12), y: decompressed.readFloatLE(offset+16), z: decompressed.readFloatLE(offset+20) };
      const v3 = { x: decompressed.readFloatLE(offset+24), y: decompressed.readFloatLE(offset+28), z: decompressed.readFloatLE(offset+32) };

      const coords = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z];
      const isValid = coords.every(c => !isNaN(c) && isFinite(c) && c > -5000 && c < 5000 && (c === 0 || Math.abs(c) > 0.001));
      if (!isValid) continue;

      // Calculate face normal
      const ax = v2.x - v1.x, ay = v2.y - v1.y, az = v2.z - v1.z;
      const bx = v3.x - v1.x, by = v3.y - v1.y, bz = v3.z - v1.z;
      const nz = ax * by - ay * bx;
      const len = Math.sqrt((ay*bz-az*by)**2 + (az*bx-ax*bz)**2 + nz**2) || 1;

      // Only keep horizontal faces (floors) - normal pointing up/down
      if (Math.abs(nz / len) > 0.7) {
        // Add edges of this floor triangle
        edges.push([v1.x, v1.y, v2.x, v2.y]);
        edges.push([v2.x, v2.y, v3.x, v3.y]);
        edges.push([v3.x, v3.y, v1.x, v1.y]);

        [v1, v2, v3].forEach(v => {
          minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
          minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
        });
      }
    }

    console.log(`Parsed ${edges.length / 3} floor faces from map`);
    return { edges, bounds: { minX, maxX, minY, maxY, minZ, maxZ } };
  } catch (err) {
    console.error('Error parsing map:', err);
    return null;
  }
}

function generateHTML(zoneName: string, mapData: { edges: number[][], bounds: Bounds } | null): string {
  const edges = mapData?.edges || [];
  const bounds = mapData?.bounds || { minX: -500, maxX: 500, minY: -500, maxY: 500, minZ: 0, maxZ: 100 };

  return `<!DOCTYPE html>
<html>
<head>
  <title>${zoneName} - EQ Zone Map</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, sans-serif;
      background: #0a0a12;
      color: #e0e0e0;
      overflow: hidden;
    }
    #app { display: flex; height: 100vh; }

    #map-container {
      flex: 1;
      position: relative;
      background: radial-gradient(ellipse at center, #0d1a2d 0%, #070d15 100%);
    }
    #map {
      width: 100%;
      height: 100%;
      cursor: crosshair;
    }

    #sidebar {
      width: 300px;
      background: rgba(0,0,0,0.8);
      border-left: 1px solid #1a3a5c;
      display: flex;
      flex-direction: column;
    }

    #header {
      padding: 15px;
      background: linear-gradient(180deg, #0d2240 0%, #091428 100%);
      border-bottom: 1px solid #1a3a5c;
    }
    #zone-name {
      font-size: 1.4rem;
      color: #00d4ff;
      font-weight: bold;
    }
    #status {
      font-size: 0.8rem;
      color: #666;
      margin-top: 5px;
    }
    #status.connected { color: #0f0; }

    #player-info {
      padding: 15px;
      border-bottom: 1px solid #1a3a5c;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 0.85rem;
    }
    .info-label { color: #888; }
    .info-value { color: #fff; font-family: monospace; }

    #target-info {
      padding: 15px;
      border-bottom: 1px solid #1a3a5c;
      min-height: 80px;
    }
    #target-name { color: #ff0; font-weight: bold; }
    #target-details { color: #aaa; font-size: 0.85rem; margin-top: 5px; }

    #npc-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    #npc-list h3 {
      color: #00d4ff;
      font-size: 0.9rem;
      margin-bottom: 10px;
    }
    .npc-item {
      padding: 8px 10px;
      margin: 4px 0;
      background: rgba(0,100,150,0.2);
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      display: flex;
      justify-content: space-between;
    }
    .npc-item:hover { background: rgba(0,150,200,0.3); }
    .npc-item.targeted { background: rgba(255,200,0,0.3); border: 1px solid #ff0; }
    .npc-name { color: #0ff; }
    .npc-dist { color: #888; font-family: monospace; }

    #controls {
      padding: 15px;
      border-top: 1px solid #1a3a5c;
    }
    button {
      width: 100%;
      padding: 10px;
      margin: 4px 0;
      background: linear-gradient(180deg, #1a4a7a 0%, #0d2a4a 100%);
      border: 1px solid #2a5a8a;
      border-radius: 4px;
      color: #0ff;
      cursor: pointer;
      font-size: 0.9rem;
    }
    button:hover { background: linear-gradient(180deg, #2a5a8a 0%, #1a3a5a 100%); }

    /* Map elements */
    .player-marker {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #0f0;
      border: 2px solid #fff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 10px #0f0;
      z-index: 100;
    }
    .player-direction {
      position: absolute;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 15px solid #0f0;
      transform-origin: center bottom;
      z-index: 99;
    }

    .tooltip {
      position: absolute;
      background: rgba(0,0,0,0.9);
      color: #fff;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      pointer-events: none;
      z-index: 1000;
      border: 1px solid #0ff;
    }
  </style>
</head>
<body>
  <div id="app">
    <div id="map-container">
      <canvas id="map"></canvas>
      <div id="tooltip" class="tooltip" style="display:none;"></div>
    </div>
    <div id="sidebar">
      <div id="header">
        <div id="zone-name">${zoneName}</div>
        <div id="status">Connecting...</div>
      </div>

      <div id="player-info">
        <div class="info-row">
          <span class="info-label">Location</span>
          <span class="info-value" id="player-loc">-</span>
        </div>
        <div class="info-row">
          <span class="info-label">Heading</span>
          <span class="info-value" id="player-heading">-</span>
        </div>
      </div>

      <div id="target-info">
        <div id="target-name">No Target</div>
        <div id="target-details"></div>
      </div>

      <div id="npc-list">
        <h3>Nearby NPCs</h3>
        <div id="npcs"></div>
      </div>

      <div id="controls">
        <button onclick="centerOnPlayer()">Center on Player</button>
        <button onclick="fitZone()">Fit Zone</button>
      </div>
    </div>
  </div>

  <script>
    // Map data
    const edges = ${JSON.stringify(edges)};
    const bounds = ${JSON.stringify(bounds)};

    // State
    let player = { x: 0, y: 0, z: 0, heading: 0 };
    let spawns = new Map();
    let targetId = null;
    let scale = 1;
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let ws = null;

    // Canvas setup
    const canvas = document.getElementById('map');
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      fitZone();
    }

    function worldToScreen(x, y) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      return {
        x: cx + (x - offsetX) * scale,
        y: cy - (y - offsetY) * scale  // Flip Y
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

    function fitZone() {
      const padding = 50;
      const w = bounds.maxX - bounds.minX;
      const h = bounds.maxY - bounds.minY;
      const scaleX = (canvas.width - padding * 2) / w;
      const scaleY = (canvas.height - padding * 2) / h;
      scale = Math.min(scaleX, scaleY, 2);
      offsetX = (bounds.minX + bounds.maxX) / 2;
      offsetY = (bounds.minY + bounds.maxY) / 2;
      draw();
    }

    function centerOnPlayer() {
      offsetX = player.x;
      offsetY = player.y;
      draw();
    }

    function draw() {
      ctx.fillStyle = '#070d15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0,100,150,0.15)';
      ctx.lineWidth = 1;
      const gridSize = 100;
      for (let x = Math.floor(bounds.minX / gridSize) * gridSize; x <= bounds.maxX; x += gridSize) {
        const p = worldToScreen(x, 0);
        ctx.beginPath();
        ctx.moveTo(p.x, 0);
        ctx.lineTo(p.x, canvas.height);
        ctx.stroke();
      }
      for (let y = Math.floor(bounds.minY / gridSize) * gridSize; y <= bounds.maxY; y += gridSize) {
        const p = worldToScreen(0, y);
        ctx.beginPath();
        ctx.moveTo(0, p.y);
        ctx.lineTo(canvas.width, p.y);
        ctx.stroke();
      }

      // Draw floor edges
      ctx.strokeStyle = 'rgba(0,180,220,0.4)';
      ctx.lineWidth = 1;
      edges.forEach(e => {
        const p1 = worldToScreen(e[0], e[1]);
        const p2 = worldToScreen(e[2], e[3]);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Draw spawns
      spawns.forEach((spawn, id) => {
        const p = worldToScreen(spawn.x, spawn.y);
        const isTarget = id === targetId;
        const isNpc = spawn.isNpc;

        // NPC dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, isTarget ? 8 : 5, 0, Math.PI * 2);

        if (isTarget) {
          ctx.fillStyle = '#ff0';
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
        } else if (isNpc) {
          ctx.fillStyle = '#f00';
          ctx.strokeStyle = 'rgba(255,0,0,0.5)';
          ctx.lineWidth = 1;
        } else {
          ctx.fillStyle = '#0af';
          ctx.strokeStyle = 'rgba(0,150,255,0.5)';
          ctx.lineWidth = 1;
        }

        ctx.fill();
        ctx.stroke();

        // Name label for nearby or targeted
        const dist = Math.sqrt((spawn.x - player.x)**2 + (spawn.y - player.y)**2);
        if (isTarget || dist < 150) {
          ctx.fillStyle = isTarget ? '#ff0' : '#fff';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(spawn.name.substring(0, 15), p.x, p.y - 10);
        }
      });

      // Draw player
      const pp = worldToScreen(player.x, player.y);

      // Direction indicator
      const headingRad = (player.heading / 512) * Math.PI * 2;  // EQ heading is 0-512
      ctx.save();
      ctx.translate(pp.x, pp.y);
      ctx.rotate(-headingRad + Math.PI);
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,255,0,0.5)';
      ctx.fill();
      ctx.restore();

      // Player dot
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#0f0';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Player glow
      ctx.beginPath();
      ctx.arc(pp.x, pp.y, 15, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,0,0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    function updateNpcList() {
      const list = document.getElementById('npcs');
      const npcs = Array.from(spawns.values())
        .filter(s => s.isNpc)
        .map(s => ({
          ...s,
          dist: Math.sqrt((s.x - player.x)**2 + (s.y - player.y)**2)
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 20);

      list.innerHTML = npcs.map(n =>
        '<div class="npc-item' + (n.id === targetId ? ' targeted' : '') + '" onclick="selectTarget(' + n.id + ')">' +
        '<span class="npc-name">' + n.name.substring(0, 20) + '</span>' +
        '<span class="npc-dist">' + n.dist.toFixed(0) + '</span>' +
        '</div>'
      ).join('');
    }

    function selectTarget(id) {
      targetId = id;
      const spawn = spawns.get(id);
      if (spawn) {
        document.getElementById('target-name').textContent = spawn.name;
        document.getElementById('target-details').textContent =
          'Level ' + (spawn.level || '?') + ' | Distance: ' +
          Math.sqrt((spawn.x - player.x)**2 + (spawn.y - player.y)**2).toFixed(0);
      }
      updateNpcList();
      draw();
    }

    // WebSocket connection to MUD client
    function connect() {
      ws = new WebSocket('ws://localhost:8769');

      ws.onopen = () => {
        document.getElementById('status').textContent = 'Connected';
        document.getElementById('status').className = 'connected';
      };

      ws.onclose = () => {
        document.getElementById('status').textContent = 'Disconnected - Reconnecting...';
        document.getElementById('status').className = '';
        setTimeout(connect, 3000);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);

          if (msg.type === 'position') {
            player = msg.data;
            document.getElementById('player-loc').textContent =
              player.x.toFixed(0) + ', ' + player.y.toFixed(0) + ', ' + player.z.toFixed(0);
            document.getElementById('player-heading').textContent = player.heading;
            draw();
          }

          if (msg.type === 'spawns') {
            spawns.clear();
            msg.data.forEach(s => spawns.set(s.id, s));
            updateNpcList();
            draw();
          }

          if (msg.type === 'spawn') {
            spawns.set(msg.data.id, msg.data);
            updateNpcList();
            draw();
          }

          if (msg.type === 'despawn') {
            spawns.delete(msg.data.id);
            updateNpcList();
            draw();
          }

          if (msg.type === 'zone') {
            document.getElementById('zone-name').textContent = msg.data.name || 'Unknown Zone';
          }
        } catch (err) {
          console.error('Message parse error:', err);
        }
      };
    }

    // Mouse controls
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      scale *= factor;
      scale = Math.max(0.1, Math.min(5, scale));
      draw();
    });

    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', e => {
      if (isDragging) {
        offsetX -= (e.clientX - dragStart.x) / scale;
        offsetY += (e.clientY - dragStart.y) / scale;
        dragStart = { x: e.clientX, y: e.clientY };
        draw();
      }

      // Tooltip on hover
      const rect = canvas.getBoundingClientRect();
      const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      let nearest = null;
      let nearestDist = 20 / scale;  // 20 pixel radius

      spawns.forEach((spawn, id) => {
        const d = Math.sqrt((spawn.x - world.x)**2 + (spawn.y - world.y)**2);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = spawn;
        }
      });

      const tooltip = document.getElementById('tooltip');
      if (nearest) {
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 10) + 'px';
        tooltip.style.top = (e.clientY + 10) + 'px';
        tooltip.textContent = nearest.name + ' (Lv ' + (nearest.level || '?') + ')';
      } else {
        tooltip.style.display = 'none';
      }
    });

    canvas.addEventListener('mouseup', () => {
      isDragging = false;
      canvas.style.cursor = 'crosshair';
    });

    canvas.addEventListener('click', e => {
      if (isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);

      let nearest = null;
      let nearestDist = 30 / scale;

      spawns.forEach((spawn, id) => {
        const d = Math.sqrt((spawn.x - world.x)**2 + (spawn.y - world.y)**2);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = { id, spawn };
        }
      });

      if (nearest) {
        selectTarget(nearest.id);
      }
    });

    window.addEventListener('resize', resize);
    resize();
    connect();
  </script>
</body>
</html>`;
}

// Start server
function startServer(zoneName: string, mapPath?: string, port: number = 8080) {
  const mapData = mapPath ? parseMapFloors(mapPath) : null;
  const html = generateHTML(zoneName, mapData);

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });

  server.listen(port, () => {
    console.log(`\n🗺️  Zone Map UI: http://localhost:${port}`);
    console.log(`   Zone: ${zoneName}`);
    console.log(`   Connects to MUD client on ws://localhost:8769`);
    console.log('\n   Open in browser and run the MUD client to see live updates!\n');
  });
}

// CLI
if (require.main === module) {
  const zoneName = process.argv[2] || 'bazaar';
  const mapPath = process.argv[3] || `/home/zachroth/akk-stack/server/maps/legacy/base/${zoneName}.map`;

  console.log('\n🗺️  EQ Zone Map UI\n');
  startServer(zoneName, mapPath, 8080);
}

export { startServer, generateHTML, parseMapFloors };
