import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const DURATION = 24;
const SEED = 20261102;
const TAU = Math.PI * 2;

function mulberry32(seed) {
  return function rand() {
    let a = (seed + 0x6d2b79f5) | 0;
    seed = a;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function initScene(mount) {
  if (!mount) return null;

  const rand = mulberry32(SEED);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SKY = new THREE.Color(0x0b1415);
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  } catch {
    mount.classList.add('scene-unavailable');
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(SKY, 1);
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', '交互式三维知识星图。拖拽旋转，或使用方向键微调；下方按钮可切换研究、开发与实践主题。');
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 13, 48);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  camera.position.set(0, 2.1, 8.8);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, -0.15, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.75;
  controls.maxPolarAngle = 1.9;
  controls.update();

  scene.add(new THREE.HemisphereLight(0xc9f4e3, 0x101c22, 1.35));
  const keyLight = new THREE.DirectionalLight(0xffedd2, 2.6);
  keyLight.position.set(5, 9, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -5;
  keyLight.shadow.camera.right = 5;
  keyLight.shadow.camera.top = 5;
  keyLight.shadow.camera.bottom = -5;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 24;
  keyLight.shadow.normalBias = 0.025;
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x8abed8, 0.95);
  fillLight.position.set(-6, 3, -4);
  scene.add(fillLight);
  const bounceLight = new THREE.DirectionalLight(0x73b99e, 0.28);
  bounceLight.position.set(0, -4, 2);
  scene.add(bounceLight);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(100, 64).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x0d191a, roughness: 1, metalness: 0 }),
  );
  ground.position.y = -2.64;
  ground.receiveShadow = true;
  scene.add(ground);

  const root = new THREE.Group();
  scene.add(root);

  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(2.8, 3.02, 0.18, 64),
    new THREE.MeshStandardMaterial({ color: 0x122725, roughness: 0.68, metalness: 0.35 }),
  );
  platform.position.y = -2.46;
  platform.castShadow = true;
  platform.receiveShadow = true;
  root.add(platform);

  const platformRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.66, 0.012, 6, 128).rotateX(Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x82d8b5, transparent: true, opacity: 0.38 }),
  );
  platformRing.position.y = -2.355;
  root.add(platformRing);

  const coreGroup = new THREE.Group();
  root.add(coreGroup);
  const coreGeometry = new THREE.IcosahedronGeometry(1.08, 2);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e4c40,
    emissive: 0x0b3027,
    emissiveIntensity: 0.62,
    roughness: 0.3,
    metalness: 0.5,
    flatShading: true,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.castShadow = true;
  core.receiveShadow = true;
  coreGroup.add(core);

  const coreEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(coreGeometry, 16),
    new THREE.LineBasicMaterial({ color: 0xa4f3cf, transparent: true, opacity: 0.5 }),
  );
  coreEdges.scale.setScalar(1.008);
  coreGroup.add(coreEdges);

  const innerCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.62, 1),
    new THREE.MeshStandardMaterial({ color: 0x8ce8bf, emissive: 0x4caf89, emissiveIntensity: 1.15, roughness: 0.22, metalness: 0.2 }),
  );
  coreGroup.add(innerCore);

  const outerShell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.46, 1),
    new THREE.MeshBasicMaterial({ color: 0x8ce8bf, wireframe: true, transparent: true, opacity: 0.13 }),
  );
  coreGroup.add(outerShell);

  const orbitDefinitions = [
    { radius: 2.0, count: 9, color: 0x9df0c8, rotation: [0.88, 0.18, 0.12] },
    { radius: 2.42, count: 10, color: 0x94c9dc, rotation: [1.64, 0.42, -0.46] },
    { radius: 2.82, count: 11, color: 0xe3c999, rotation: [0.24, -0.62, 1.08] },
  ];
  const dummy = new THREE.Object3D();
  const orbitGroups = orbitDefinitions.map((definition, orbitIndex) => {
    const group = new THREE.Group();
    group.rotation.set(...definition.rotation);
    group.userData.baseRotation = [...definition.rotation];

    const ringMaterial = new THREE.MeshBasicMaterial({ color: definition.color, transparent: true, opacity: orbitIndex === 0 ? 0.48 : 0.17 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(definition.radius, 0.009, 5, 160), ringMaterial);
    group.add(ring);

    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: definition.color,
      emissive: definition.color,
      emissiveIntensity: orbitIndex === 0 ? 0.8 : 0.2,
      roughness: 0.32,
      metalness: 0.15,
      transparent: true,
      opacity: orbitIndex === 0 ? 1 : 0.55,
    });
    const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.065, 10, 10), nodeMaterial, definition.count);
    const connectionPositions = [];
    for (let i = 0; i < definition.count; i += 1) {
      const angle = (i / definition.count) * TAU + orbitIndex * 0.21;
      const size = 0.78 + rand() * 0.72;
      const x = Math.cos(angle) * definition.radius;
      const y = Math.sin(angle) * definition.radius;
      dummy.position.set(x, y, 0);
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
      if (i % 3 === 0) connectionPositions.push(0, 0, 0, x, y, 0);
    }
    nodes.instanceMatrix.needsUpdate = true;
    group.add(nodes);

    const connectionGeometry = new THREE.BufferGeometry();
    connectionGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));
    const connections = new THREE.LineSegments(
      connectionGeometry,
      new THREE.LineBasicMaterial({ color: definition.color, transparent: true, opacity: 0.12 }),
    );
    group.add(connections);
    root.add(group);
    return { group, ringMaterial, nodeMaterial, connections };
  });

  const dustCount = 150;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustPhases = new Float32Array(dustCount);
  const dustSizes = new Float32Array(dustCount);
  for (let i = 0; i < dustCount; i += 1) {
    const angle = rand() * TAU;
    const radius = 3.2 + rand() * 4.8;
    dustPositions[i * 3] = Math.cos(angle) * radius;
    dustPositions[i * 3 + 1] = (rand() - 0.5) * 6.8;
    dustPositions[i * 3 + 2] = Math.sin(angle) * radius;
    dustPhases[i] = rand() * TAU;
    dustSizes[i] = 1.2 + rand() * 2.8;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute('aPhase', new THREE.BufferAttribute(dustPhases, 1));
  dustGeometry.setAttribute('aSize', new THREE.BufferAttribute(dustSizes, 1));
  const dustMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x9df0c8) } },
    vertexShader: `
      uniform float uTime;
      attribute float aPhase;
      attribute float aSize;
      varying float vAlpha;
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float pulse = 0.5 + 0.5 * sin(uTime * 0.2617993878 + aPhase);
        vAlpha = 0.18 + pulse * 0.55;
        gl_PointSize = aSize * (42.0 / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        float alpha = smoothstep(0.5, 0.08, d) * vAlpha;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  const starCount = 260;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i += 1) {
    const angle = rand() * TAU;
    const radius = 14 + rand() * 27;
    starPositions[i * 3] = Math.cos(angle) * radius;
    starPositions[i * 3 + 1] = (rand() - 0.35) * 23;
    starPositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0x719a91, size: 0.045, transparent: true, opacity: 0.48, depthWrite: false }));
  scene.add(stars);

  let activeMode = 0;
  let scrollProgress = 0;
  let manualRotation = 0;
  let tiltOffset = 0;
  let simT = 0;
  let paused = reducedMotion;

  function applyMode() {
    orbitGroups.forEach((orbit, index) => {
      const active = index === activeMode;
      orbit.ringMaterial.opacity = active ? 0.5 : 0.15;
      orbit.nodeMaterial.opacity = active ? 1 : 0.48;
      orbit.nodeMaterial.emissiveIntensity = active ? 0.82 : 0.16;
      orbit.connections.material.opacity = active ? 0.18 : 0.06;
      orbit.group.scale.setScalar(active ? 1.025 : 1);
    });
  }

  function sample(t) {
    const loopT = ((t % DURATION) + DURATION) % DURATION;
    const phase = (loopT / DURATION) * TAU;
    root.rotation.y = phase + manualRotation + scrollProgress * 0.24;
    root.rotation.x = tiltOffset + scrollProgress * 0.075;
    coreGroup.position.y = (1 - Math.cos(phase)) * 0.09;
    coreGroup.rotation.y = -phase * 0.5;
    innerCore.rotation.x = phase * 2;
    innerCore.rotation.z = phase;
    outerShell.rotation.y = -phase;
    outerShell.rotation.x = phase * 0.5;
    coreMaterial.emissiveIntensity = 0.58 + (1 - Math.cos(phase)) * 0.055;
    orbitGroups.forEach((orbit, index) => {
      const base = orbit.group.userData.baseRotation;
      orbit.group.rotation.z = base[2] + phase * (index % 2 === 0 ? 1 : -1);
    });
    dustMaterial.uniforms.uTime.value = loopT;
    dust.rotation.y = -phase;
    stars.rotation.y = phase * 0.25;
  }

  function draw() {
    controls.update();
    renderer.render(scene, camera);
    window.__PERF__ = {
      drawCalls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      points: dustCount + starCount,
      pixelRatio: renderer.getPixelRatio(),
      frameMs: Number(frameEMA.toFixed(2)),
    };
  }

  renderer.domElement.addEventListener('keydown', (event) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') manualRotation -= 0.09;
    if (event.key === 'ArrowRight') manualRotation += 0.09;
    if (event.key === 'ArrowUp') tiltOffset = Math.max(-0.35, tiltOffset - 0.045);
    if (event.key === 'ArrowDown') tiltOffset = Math.min(0.35, tiltOffset + 0.045);
    sample(simT);
    draw();
  });

  function resize() {
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    const aspect = width / height;
    renderer.setSize(width, height, false);
    camera.aspect = aspect;
    camera.position.z = aspect < 0.85 ? 11.2 : aspect < 1.2 ? 9.8 : 8.8;
    camera.updateProjectionMatrix();
    sample(simT);
    draw();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);

  let previousTime = performance.now();
  let frameEMA = 16.67;
  let frameCount = 0;
  let degraded = false;
  renderer.setAnimationLoop((now) => {
    if (document.hidden) {
      previousTime = now;
      return;
    }
    const deltaMs = Math.min(100, Math.max(0, now - previousTime));
    previousTime = now;
    frameEMA = frameEMA * 0.96 + deltaMs * 0.04;
    if (!paused) simT = (simT + deltaMs / 1000) % DURATION;
    sample(simT);
    draw();
    frameCount += 1;
    if (!degraded && frameCount > 180 && frameEMA > 31 && renderer.getPixelRatio() > 1) {
      renderer.setPixelRatio(1);
      resize();
      degraded = true;
    }
  });

  window.__seek = (time) => {
    const value = Number(time);
    paused = true;
    simT = Number.isFinite(value) && value > 0 ? value : 0;
    sample(simT);
    draw();
  };
  window.__play = () => {
    paused = false;
    previousTime = performance.now();
  };

  applyMode();
  resize();
  sample(0);
  draw();
  window.__SCENE_READY__ = true;

  const timeParam = new URLSearchParams(window.location.search).get('t');
  if (timeParam !== null) window.__seek(timeParam);

  return {
    setMode(mode) {
      activeMode = Math.max(0, Math.min(2, Number(mode) || 0));
      applyMode();
      sample(simT);
      draw();
    },
    setScroll(progress) {
      scrollProgress = Math.max(0, Math.min(1, Number(progress) || 0));
      camera.position.y = 2.1 + scrollProgress * 0.35;
      controls.target.y = -0.15 + scrollProgress * 0.08;
    },
  };
}
