// EQ Zone 3D Viewer - Three.js powered zone geometry with spawn overlay
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import * as zlib from 'zlib';

interface Vertex { x: number; y: number; z: number; }
interface Face { v1: Vertex; v2: Vertex; v3: Vertex; }
interface MapData {
  faceCount: number;
  faces: Face[];
  bounds: {
    minX: number; maxX: number;
    minY: number; maxY: number;
    minZ: number; maxZ: number;
  };
}

function parseMapFile(filePath: string): MapData | null {
  try {
    const data = fs.readFileSync(filePath);
    const compressedSize = data.readUInt32LE(4);
    const uncompressedSize = data.readUInt32LE(8);
    console.log(`Map: ${path.basename(filePath)} - ${compressedSize}b compressed → ${uncompressedSize}b`);

    const compressed = data.slice(12);
    const decompressed = zlib.inflateSync(compressed);
    const faceCount = decompressed.readUInt32LE(0);
    console.log(`Geometry: ${faceCount} triangles`);

    const faces: Face[] = [];
    let offset = 40;
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

      const allCoords = [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z];
      // Filter out garbage triangles - valid EQ coords are typically -5000 to 5000
      // Also filter out denormalized floats (very tiny values near zero that aren't exactly zero)
      const isValid = allCoords.every(c =>
        !isNaN(c) && isFinite(c) &&
        c > -5000 && c < 5000 &&
        (c === 0 || Math.abs(c) > 0.001)  // Filter denormalized garbage
      );

      if (isValid) {
        [v1, v2, v3].forEach(v => {
          minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
          minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
          minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
        });
        faces.push({ v1, v2, v3 });
      }
      offset += 36;
    }

    console.log(`Valid triangles: ${faces.length}`);
    return { faceCount: faces.length, faces, bounds: { minX, maxX, minY, maxY, minZ, maxZ } };
  } catch (err) {
    console.error('Error parsing map:', err);
    return null;
  }
}

function generateHTML(mapData: MapData, zoneName: string): string {
  const { faces, bounds } = mapData;

  // Convert to flat arrays for Three.js BufferGeometry
  const vertices: number[] = [];
  const indices: number[] = [];
  const colors: number[] = [];

  faces.forEach((face, i) => {
    const baseIdx = i * 3;

    // Add vertices
    vertices.push(face.v1.x, face.v1.z, -face.v1.y); // Swap Y/Z for Three.js coordinate system
    vertices.push(face.v2.x, face.v2.z, -face.v2.y);
    vertices.push(face.v3.x, face.v3.z, -face.v3.y);

    indices.push(baseIdx, baseIdx + 1, baseIdx + 2);

    // Color by height - cyan to purple gradient
    const avgZ = (face.v1.z + face.v2.z + face.v3.z) / 3;
    const t = (avgZ - bounds.minZ) / (bounds.maxZ - bounds.minZ || 1);
    const r = 0.1 + t * 0.4;
    const g = 0.3 + (1 - t) * 0.4;
    const b = 0.6 + t * 0.3;

    colors.push(r, g, b, r, g, b, r, g, b);
  });

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  const size = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, bounds.maxZ - bounds.minZ);

  return `<!DOCTYPE html>
<html>
<head>
  <title>🗺️ ${zoneName} - 3D Zone Viewer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, sans-serif;
      background: #000;
      color: #e0e0e0;
      overflow: hidden;
    }
    #container { display: flex; height: 100vh; }
    #canvas-container { flex: 1; position: relative; }
    canvas { display: block; }

    #sidebar {
      width: 320px;
      background: linear-gradient(180deg, rgba(10,15,30,0.95) 0%, rgba(5,10,20,0.98) 100%);
      padding: 20px;
      border-left: 1px solid rgba(0,200,255,0.2);
      overflow-y: auto;
      backdrop-filter: blur(10px);
    }

    h1 {
      font-size: 1.5rem;
      background: linear-gradient(90deg, #00d4ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 5px;
    }
    .subtitle { color: #666; font-size: 0.85rem; margin-bottom: 20px; }

    h2 {
      font-size: 0.9rem;
      color: #ffd700;
      margin: 20px 0 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat-group {
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
      padding: 12px;
      margin: 10px 0;
    }
    .stat {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .stat:last-child { border: none; }
    .stat-label { color: #888; font-size: 0.85rem; }
    .stat-value { color: #00d4ff; font-weight: 600; font-family: monospace; }

    .btn-group {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin: 10px 0;
    }
    button {
      padding: 10px 12px;
      background: linear-gradient(180deg, rgba(0,200,255,0.2) 0%, rgba(0,150,200,0.1) 100%);
      border: 1px solid rgba(0,200,255,0.3);
      border-radius: 6px;
      color: #00d4ff;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    button:hover {
      background: linear-gradient(180deg, rgba(0,200,255,0.3) 0%, rgba(0,150,200,0.2) 100%);
      border-color: rgba(0,200,255,0.5);
      transform: translateY(-1px);
    }
    button.active {
      background: rgba(0,200,255,0.4);
      border-color: #00d4ff;
    }

    .slider-container { margin: 15px 0; }
    .slider-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      color: #888;
      font-size: 0.8rem;
    }
    input[type="range"] {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: rgba(255,255,255,0.1);
      -webkit-appearance: none;
      outline: none;
    }
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #00d4ff;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0,200,255,0.5);
    }

    #coords {
      background: rgba(0,0,0,0.5);
      padding: 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .legend { margin-top: 20px; }
    .legend-item {
      display: flex;
      align-items: center;
      margin: 5px 0;
      font-size: 0.85rem;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      margin-right: 10px;
    }

    #loading {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      z-index: 1000;
    }
    .spinner {
      width: 60px;
      height: 60px;
      border: 3px solid rgba(0,200,255,0.2);
      border-top-color: #00d4ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    #loading-text { margin-top: 20px; color: #00d4ff; }

    .view-mode {
      display: flex;
      gap: 5px;
      margin: 10px 0;
    }
    .view-btn {
      flex: 1;
      padding: 8px;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <div id="loading">
    <div class="spinner"></div>
    <div id="loading-text">Loading zone geometry...</div>
  </div>

  <div id="container">
    <div id="canvas-container"></div>
    <div id="sidebar">
      <h1>🗺️ ${zoneName}</h1>
      <div class="subtitle">3D Zone Geometry Viewer</div>

      <h2>📊 Zone Statistics</h2>
      <div class="stat-group">
        <div class="stat"><span class="stat-label">Triangles</span><span class="stat-value">${mapData.faceCount.toLocaleString()}</span></div>
        <div class="stat"><span class="stat-label">Vertices</span><span class="stat-value">${(mapData.faceCount * 3).toLocaleString()}</span></div>
      </div>
      <div class="stat-group">
        <div class="stat"><span class="stat-label">X Range</span><span class="stat-value">${bounds.minX.toFixed(0)} → ${bounds.maxX.toFixed(0)}</span></div>
        <div class="stat"><span class="stat-label">Y Range</span><span class="stat-value">${bounds.minY.toFixed(0)} → ${bounds.maxY.toFixed(0)}</span></div>
        <div class="stat"><span class="stat-label">Z (Height)</span><span class="stat-value">${bounds.minZ.toFixed(0)} → ${bounds.maxZ.toFixed(0)}</span></div>
      </div>

      <h2>🎥 Camera View</h2>
      <div class="view-mode">
        <button class="view-btn" onclick="setView('iso')">Isometric</button>
        <button class="view-btn" onclick="setView('top')">Top Down</button>
        <button class="view-btn" onclick="setView('front')">Front</button>
        <button class="view-btn" onclick="setView('free')">Free</button>
      </div>

      <h2>🎮 Render Options</h2>
      <div class="btn-group">
        <button id="btn-wireframe" onclick="toggleWireframe()">Wireframe</button>
        <button id="btn-solid" onclick="toggleSolid()">Solid Fill</button>
        <button id="btn-floors" onclick="toggleFloors()">Floors Only</button>
        <button id="btn-walls" onclick="toggleWalls()">Walls Only</button>
      </div>

      <div class="slider-container">
        <div class="slider-label"><span>Height Cutoff</span><span id="z-val">${bounds.maxZ.toFixed(0)}</span></div>
        <input type="range" id="z-slider" min="${bounds.minZ.toFixed(0)}" max="${bounds.maxZ.toFixed(0)}" value="${bounds.maxZ.toFixed(0)}" oninput="updateZCutoff(this.value)">
      </div>

      <div class="slider-container">
        <div class="slider-label"><span>Opacity</span><span id="opacity-val">80%</span></div>
        <input type="range" id="opacity-slider" min="10" max="100" value="80" oninput="updateOpacity(this.value)">
      </div>

      <h2>📍 Coordinates</h2>
      <div id="coords">
        <div>Camera: <span id="cam-pos">-</span></div>
        <div>Target: <span id="target-pos">-</span></div>
      </div>

      <div class="legend">
        <h2>🎨 Height Legend</h2>
        <div class="legend-item">
          <div class="legend-color" style="background: linear-gradient(180deg, #6a4c93, #2d4b73);"></div>
          <span>High → Low elevation</span>
        </div>
      </div>
    </div>
  </div>

  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
    }
  }
  </script>

  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    // Geometry data
    const vertices = new Float32Array(${JSON.stringify(vertices)});
    const indices = new Uint32Array(${JSON.stringify(indices)});
    const colors = new Float32Array(${JSON.stringify(colors)});
    const bounds = ${JSON.stringify(bounds)};
    const center = { x: ${centerX}, y: ${centerY}, z: ${centerZ} };
    const zoneSize = ${size};

    // Three.js setup
    let scene, camera, renderer, controls;
    let zoneMesh, wireframeMesh;
    let showWireframe = false;
    let showSolid = true;
    let showFloors = false;
    let showWalls = false;
    let zCutoff = bounds.maxZ;
    let opacity = 0.8;

    function init() {
      // Scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050810);
      scene.fog = new THREE.Fog(0x050810, zoneSize * 0.5, zoneSize * 2);

      // Camera
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, zoneSize * 5);
      const camDist = zoneSize * 0.8;
      camera.position.set(center.x + camDist, center.z + camDist * 0.5, -center.y - camDist);

      // Renderer
      const container = document.getElementById('canvas-container');
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      // Controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(center.x, center.z, -center.y);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxDistance = zoneSize * 3;
      controls.minDistance = 10;

      // Lighting
      const ambient = new THREE.AmbientLight(0x404060, 0.5);
      scene.add(ambient);

      const directional = new THREE.DirectionalLight(0xffffff, 0.8);
      directional.position.set(center.x, center.z + zoneSize, -center.y);
      directional.castShadow = true;
      scene.add(directional);

      const hemi = new THREE.HemisphereLight(0x00d4ff, 0x2d1b4e, 0.4);
      scene.add(hemi);

      // Create zone geometry
      createZoneMesh();

      // Grid helper
      const gridSize = Math.ceil(zoneSize / 100) * 100;
      const grid = new THREE.GridHelper(gridSize, gridSize / 100, 0x1a1a2e, 0x0a0a15);
      grid.position.set(center.x, bounds.minZ - 10, -center.y);
      scene.add(grid);

      // Origin marker
      const originGeo = new THREE.SphereGeometry(10, 16, 16);
      const originMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const origin = new THREE.Mesh(originGeo, originMat);
      origin.position.set(0, 0, 0);
      scene.add(origin);

      // Hide loading
      document.getElementById('loading').style.display = 'none';

      // Start render loop
      animate();
    }

    function createZoneMesh() {
      if (zoneMesh) scene.remove(zoneMesh);
      if (wireframeMesh) scene.remove(wireframeMesh);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      geometry.computeVertexNormals();

      // Solid mesh
      const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacity,
        shininess: 30,
      });
      zoneMesh = new THREE.Mesh(geometry, material);
      zoneMesh.visible = showSolid;
      scene.add(zoneMesh);

      // Wireframe overlay
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x00d4ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      wireframeMesh = new THREE.Mesh(geometry.clone(), wireMat);
      wireframeMesh.visible = showWireframe;
      scene.add(wireframeMesh);
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();

      // Update coordinate display
      const cp = camera.position;
      const ct = controls.target;
      document.getElementById('cam-pos').textContent =
        cp.x.toFixed(0) + ', ' + cp.y.toFixed(0) + ', ' + (-cp.z).toFixed(0);
      document.getElementById('target-pos').textContent =
        ct.x.toFixed(0) + ', ' + ct.y.toFixed(0) + ', ' + (-ct.z).toFixed(0);

      renderer.render(scene, camera);
    }

    // View presets
    function setView(mode) {
      const dist = zoneSize * 0.8;
      switch(mode) {
        case 'iso':
          camera.position.set(center.x + dist, center.z + dist * 0.6, -center.y - dist);
          break;
        case 'top':
          camera.position.set(center.x, center.z + dist * 1.5, -center.y);
          break;
        case 'front':
          camera.position.set(center.x, center.z, -center.y - dist * 1.2);
          break;
        case 'free':
          // Keep current, just reset target
          break;
      }
      controls.target.set(center.x, center.z, -center.y);
    }

    function toggleWireframe() {
      showWireframe = !showWireframe;
      wireframeMesh.visible = showWireframe;
      document.getElementById('btn-wireframe').classList.toggle('active', showWireframe);
    }

    function toggleSolid() {
      showSolid = !showSolid;
      zoneMesh.visible = showSolid;
      document.getElementById('btn-solid').classList.toggle('active', !showSolid);
    }

    function toggleFloors() {
      showFloors = !showFloors;
      document.getElementById('btn-floors').classList.toggle('active', showFloors);
      // Would filter geometry - simplified for now
    }

    function toggleWalls() {
      showWalls = !showWalls;
      document.getElementById('btn-walls').classList.toggle('active', showWalls);
    }

    function updateZCutoff(val) {
      zCutoff = parseFloat(val);
      document.getElementById('z-val').textContent = val;
      // Would clip geometry - simplified for now
    }

    function updateOpacity(val) {
      opacity = val / 100;
      document.getElementById('opacity-val').textContent = val + '%';
      if (zoneMesh) zoneMesh.material.opacity = opacity;
    }

    // Resize handler
    window.addEventListener('resize', () => {
      const container = document.getElementById('canvas-container');
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Initialize
    init();
  </script>
</body>
</html>`;
}

// Web server to serve the viewer
function startServer(mapData: MapData, zoneName: string, port: number = 3333) {
  const html = generateHTML(mapData, zoneName);

  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else if (req.url === '/api/geometry') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mapData));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(port, () => {
    console.log(`\n🗺️  3D Zone Viewer running at: http://localhost:${port}`);
    console.log(`   Zone: ${zoneName}`);
    console.log(`   Triangles: ${mapData.faceCount.toLocaleString()}`);
    console.log('\n   Controls:');
    console.log('   - Left click + drag: Rotate');
    console.log('   - Right click + drag: Pan');
    console.log('   - Scroll: Zoom');
    console.log('\n   Press Ctrl+C to stop\n');
  });
}

// Also save as static HTML file
function saveStaticHTML(mapData: MapData, zoneName: string, outputPath: string) {
  const html = generateHTML(mapData, zoneName);
  fs.writeFileSync(outputPath, html);
  console.log(`\n📄 Static HTML saved to: ${outputPath}`);
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const mapPath = args[0] || '/home/zachroth/akk-stack/server/maps/legacy/base/bazaar.map';
  const zoneName = path.basename(mapPath, '.map');

  console.log('\n🏔️  EQ Zone 3D Viewer\n');
  console.log(`📂 Loading: ${mapPath}`);

  const mapData = parseMapFile(mapPath);
  if (!mapData) {
    console.error('Failed to parse map file');
    process.exit(1);
  }

  // Start web server
  startServer(mapData, zoneName, 3333);

  // Also save static file
  const outputPath = `/home/zachroth/eq-content-engine/${zoneName}-3d.html`;
  saveStaticHTML(mapData, zoneName, outputPath);
}

export { parseMapFile, generateHTML, startServer, saveStaticHTML };
