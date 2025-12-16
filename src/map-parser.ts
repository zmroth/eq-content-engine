// EQEmu .map file parser - Zone geometry for visualization
import * as fs from 'fs';
import * as zlib from 'zlib';

interface Vertex {
  x: number;
  y: number;
  z: number;
}

interface Face {
  v1: Vertex;
  v2: Vertex;
  v3: Vertex;
}

interface MapData {
  faceCount: number;
  nodeCount: number;
  faces: Face[];
  bounds: {
    minX: number; maxX: number;
    minY: number; maxY: number;
    minZ: number; maxZ: number;
  };
}

export function parseMapFile(filePath: string): MapData | null {
  try {
    const data = fs.readFileSync(filePath);

    // Header: 12 bytes (version, compressed size, uncompressed size)
    const version = data.readUInt32LE(0);
    const compressedSize = data.readUInt32LE(4);
    const uncompressedSize = data.readUInt32LE(8);

    console.log(`Map file: version=${version}, compressed=${compressedSize}, uncompressed=${uncompressedSize}`);

    // Decompress
    const compressed = data.slice(12);
    const decompressed = zlib.inflateSync(compressed);

    // Parse header
    const faceCount = decompressed.readUInt32LE(0);
    const nodeCount = decompressed.readUInt32LE(4);

    console.log(`Geometry: ${faceCount} faces, ${nodeCount} BSP nodes`);

    // Parse faces (36 bytes each: 3 vertices * 3 floats)
    const faces: Face[] = [];
    let offset = 40; // Skip header

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < faceCount; i++) {
      const v1: Vertex = {
        x: decompressed.readFloatLE(offset),
        y: decompressed.readFloatLE(offset + 4),
        z: decompressed.readFloatLE(offset + 8),
      };
      const v2: Vertex = {
        x: decompressed.readFloatLE(offset + 12),
        y: decompressed.readFloatLE(offset + 16),
        z: decompressed.readFloatLE(offset + 20),
      };
      const v3: Vertex = {
        x: decompressed.readFloatLE(offset + 24),
        y: decompressed.readFloatLE(offset + 28),
        z: decompressed.readFloatLE(offset + 32),
      };

      // Filter out invalid faces (garbage data at end of file)
      const allCoords = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z];
      const isValid = allCoords.every(c => c > -50000 && c < 50000 && !isNaN(c));

      if (isValid) {
        // Update bounds
        [v1, v2, v3].forEach(v => {
          minX = Math.min(minX, v.x);
          maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y);
          maxY = Math.max(maxY, v.y);
          minZ = Math.min(minZ, v.z);
          maxZ = Math.max(maxZ, v.z);
        });

        faces.push({ v1, v2, v3 });
      }

      offset += 36;
    }

    console.log(`Valid faces: ${faces.length} / ${faceCount}`);

    return {
      faceCount,
      nodeCount,
      faces,
      bounds: { minX, maxX, minY, maxY, minZ, maxZ },
    };
  } catch (err) {
    console.error('Error parsing map file:', err);
    return null;
  }
}

// Generate HTML visualization
export function generateMapVisualization(mapData: MapData, outputPath: string): void {
  const { faces, bounds } = mapData;

  // Convert faces to JSON for the visualization
  const facesJson = JSON.stringify(faces.map(f => [
    [f.v1.x, f.v1.y, f.v1.z],
    [f.v2.x, f.v2.y, f.v2.z],
    [f.v3.x, f.v3.y, f.v3.z],
  ]));

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>EQ Zone Geometry Viewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #0a0a15;
      color: #e0e0e0;
      overflow: hidden;
    }
    #container { display: flex; height: 100vh; }
    #canvas-container { flex: 1; position: relative; }
    canvas { position: absolute; cursor: grab; }
    canvas:active { cursor: grabbing; }
    #sidebar {
      width: 280px;
      background: rgba(0,0,0,0.7);
      padding: 15px;
      border-left: 1px solid #333;
    }
    h1 { font-size: 1.4rem; color: #00d4ff; margin-bottom: 10px; }
    h2 { font-size: 1rem; color: #ffd700; margin: 10px 0 5px; }
    .stat { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #222; }
    .stat-label { color: #888; }
    .stat-value { color: #fff; }
    .controls { margin: 10px 0; }
    button {
      padding: 8px 12px;
      background: #00d4ff;
      border: none;
      border-radius: 4px;
      color: #000;
      cursor: pointer;
      margin: 2px;
      font-weight: bold;
    }
    button:hover { background: #00b8e6; }
    input[type="range"] { width: 100%; margin: 5px 0; }
    label { display: block; margin-top: 10px; color: #888; }
  </style>
</head>
<body>
  <div id="container">
    <div id="canvas-container">
      <canvas id="canvas"></canvas>
    </div>
    <div id="sidebar">
      <h1>🏔️ Zone Geometry</h1>

      <h2>📊 Statistics</h2>
      <div class="stat"><span class="stat-label">Triangles</span><span class="stat-value">${mapData.faceCount}</span></div>
      <div class="stat"><span class="stat-label">BSP Nodes</span><span class="stat-value">${mapData.nodeCount}</span></div>
      <div class="stat"><span class="stat-label">X Range</span><span class="stat-value">${bounds.minX.toFixed(0)} to ${bounds.maxX.toFixed(0)}</span></div>
      <div class="stat"><span class="stat-label">Y Range</span><span class="stat-value">${bounds.minY.toFixed(0)} to ${bounds.maxY.toFixed(0)}</span></div>
      <div class="stat"><span class="stat-label">Z Range</span><span class="stat-value">${bounds.minZ.toFixed(0)} to ${bounds.maxZ.toFixed(0)}</span></div>

      <h2>🎮 Controls</h2>
      <div class="controls">
        <button onclick="resetView()">Reset View</button>
        <button onclick="toggleWireframe()">Toggle Fill</button>
        <button onclick="toggleFloor()">Floor Only</button>
      </div>

      <label>Z Level Filter</label>
      <input type="range" id="z-slider" min="${bounds.minZ.toFixed(0)}" max="${bounds.maxZ.toFixed(0)}" value="${bounds.maxZ.toFixed(0)}" oninput="updateZFilter(this.value)">
      <div id="z-value">Z ≤ ${bounds.maxZ.toFixed(0)}</div>

      <label>Opacity</label>
      <input type="range" id="opacity" min="0" max="100" value="80" oninput="updateOpacity(this.value)">

      <h2>📍 Mouse Position</h2>
      <div id="mouse-pos">-</div>
    </div>
  </div>

  <script>
    const faces = ${facesJson};
    const bounds = ${JSON.stringify(bounds)};

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let scale = 0.15;
    let offsetX = (bounds.minX + bounds.maxX) / 2;
    let offsetY = (bounds.minY + bounds.maxY) / 2;
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let wireframe = false;
    let floorOnly = false;
    let zFilter = bounds.maxZ;
    let opacity = 0.8;

    function resize() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      draw();
    }

    function worldToScreen(x, y) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      return {
        x: cx + (x - offsetX) * scale,
        y: cy - (y - offsetY) * scale
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
      ctx.strokeStyle = 'rgba(50,50,70,0.3)';
      ctx.lineWidth = 1;
      const gridSize = 100;
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

      // Draw faces
      faces.forEach(face => {
        const [v1, v2, v3] = face;
        const avgZ = (v1[2] + v2[2] + v3[2]) / 3;

        // Z filter
        if (avgZ > zFilter) return;

        // Floor filter (horizontal faces)
        if (floorOnly) {
          const dz1 = Math.abs(v1[2] - v2[2]);
          const dz2 = Math.abs(v2[2] - v3[2]);
          const dz3 = Math.abs(v3[2] - v1[2]);
          if (dz1 > 5 || dz2 > 5 || dz3 > 5) return;
        }

        const p1 = worldToScreen(v1[0], v1[1]);
        const p2 = worldToScreen(v2[0], v2[1]);
        const p3 = worldToScreen(v3[0], v3[1]);

        // Color by height
        const normalizedZ = (avgZ - bounds.minZ) / (bounds.maxZ - bounds.minZ);
        const hue = 200 + normalizedZ * 60;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        if (!wireframe) {
          ctx.fillStyle = 'hsla(' + hue + ', 60%, 40%, ' + opacity + ')';
          ctx.fill();
        }
        ctx.strokeStyle = 'hsla(' + hue + ', 70%, 60%, ' + (opacity * 0.7) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Origin marker
      const origin = worldToScreen(0, 0);
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    function resetView() {
      scale = 0.15;
      offsetX = (bounds.minX + bounds.maxX) / 2;
      offsetY = (bounds.minY + bounds.maxY) / 2;
      draw();
    }

    function toggleWireframe() {
      wireframe = !wireframe;
      draw();
    }

    function toggleFloor() {
      floorOnly = !floorOnly;
      draw();
    }

    function updateZFilter(val) {
      zFilter = parseFloat(val);
      document.getElementById('z-value').textContent = 'Z ≤ ' + val;
      draw();
    }

    function updateOpacity(val) {
      opacity = val / 100;
      draw();
    }

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      scale *= factor;
      scale = Math.max(0.01, Math.min(2, scale));
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

      const rect = canvas.getBoundingClientRect();
      const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      document.getElementById('mouse-pos').textContent =
        'X: ' + world.x.toFixed(1) + ', Y: ' + world.y.toFixed(1);
    });

    canvas.addEventListener('mouseup', () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    });

    window.addEventListener('resize', resize);
    resize();
  </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
  console.log(`\nVisualization saved to: ${outputPath}`);
}

// CLI
if (require.main === module) {
  const mapPath = process.argv[2] || '/home/zachroth/akk-stack/server/maps/legacy/base/arena.map';
  const outputPath = process.argv[3] || '/home/zachroth/eq-content-engine/zone-geometry.html';

  console.log('\n=== EQ Map File Parser ===\n');
  console.log(`Input: ${mapPath}`);

  const mapData = parseMapFile(mapPath);
  if (mapData) {
    console.log(`\nBounds:`);
    console.log(`  X: ${mapData.bounds.minX.toFixed(1)} to ${mapData.bounds.maxX.toFixed(1)}`);
    console.log(`  Y: ${mapData.bounds.minY.toFixed(1)} to ${mapData.bounds.maxY.toFixed(1)}`);
    console.log(`  Z: ${mapData.bounds.minZ.toFixed(1)} to ${mapData.bounds.maxZ.toFixed(1)}`);

    generateMapVisualization(mapData, outputPath);
  }
}
