import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    const stage = document.querySelector('#hero-ghost-stage');
    if (!stage) throw new Error('3D ghost stage is missing');
    const scene = new THREE.Scene();
    scene.background = null;

    // Measure the actual hero stage before creating the renderer. The previous
    // build referenced width/height before they existed, aborting this module
    // before the model could ever be drawn.
    const getStageSize = () => ({
      width: Math.max(1, stage.clientWidth || stage.getBoundingClientRect().width),
      height: Math.max(1, stage.clientHeight || stage.getBoundingClientRect().height)
    });
    const { width: initialWidth, height: initialHeight } = getStageSize();
    const camera = new THREE.PerspectiveCamera(38, initialWidth / initialHeight, 0.1, 100);
    // Aim at the geometric midpoint of the shell so it sits in the centre
    // of the existing signal-map rings at desktop and mobile breakpoints.
    const initialCamera = new THREE.Vector3(0, 1.68, 6.65);
    const initialTarget = new THREE.Vector3(0, 0.90, 0);
    camera.position.copy(initialCamera);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (error) {
      stage.dataset.renderState = 'unavailable';
      stage.setAttribute('aria-label', '3D robot unavailable because WebGL could not be initialized');
      console.error('Portfolio robot: WebGL initialization failed.', error);
      throw error;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(initialWidth, initialHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'Interactive red 3D robot. Drag to rotate and use the mouse wheel or pinch gesture to zoom within safe limits.');
    renderer.domElement.tabIndex = 0;
    stage.dataset.renderState = 'ready';
    stage.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(initialTarget);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.rotateSpeed = 0.62;
    controls.zoomSpeed = 0.42;
    // Keep the whole shell inside the orbit panel. OrbitControls enforces these
    // camera-distance bounds even when the user keeps scrolling over the canvas.
    const getZoomLimits = width => width < 340
      ? { min: 6.35, max: 8.8 }
      : width < 390
        ? { min: 6.2, max: 9.0 }
        : width < 460
          ? { min: 6.05, max: 9.2 }
          : { min: 5.85, max: 9.5 };
    const initialZoomLimits = getZoomLimits(initialWidth);
    controls.minDistance = initialZoomLimits.min;
    controls.maxDistance = initialZoomLimits.max;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI - 0.12;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.15;
    controls.update();

    // Warm studio illumination: a broad soft key, a low fill, and a rear rim.
    scene.add(new THREE.HemisphereLight(0xffead6, 0x76513b, 1.45));
    const key = new THREE.DirectionalLight(0xffe3d1, 3.0);
    key.position.set(-3.8, 6.2, 4.6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -4.5;
    key.shadow.camera.right = 4.5;
    key.shadow.camera.top = 5;
    key.shadow.camera.bottom = -4.5;
    key.shadow.bias = -0.00025;
    key.shadow.normalBias = 0.025;
    key.shadow.radius = 7;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffc7a5, 1.0);
    fill.position.set(4.5, 2.0, 4.5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffd6bf, 1.9);
    rim.position.set(-3.0, 4.0, -4.5);
    scene.add(rim);

    const ghost = new THREE.Group();
    scene.add(ghost);

    // (t, y, radius) samples define the domed crown and the soft flared lower skirt.
    const profile = [
      [0.000,  2.34, 0.010],
      [0.025, 2.33, 0.205],
      [0.070, 2.27, 0.405],
      [0.140, 2.13, 0.610],
      [0.230, 1.93, 0.770],
      [0.340, 1.66, 0.875],
      [0.480, 1.22, 0.945],
      [0.620, 0.71, 0.990],
      [0.750, 0.10, 1.065],
      [0.850,-0.39, 1.155],
      [0.930,-0.70, 1.215],
      [1.000,-0.91, 1.205]
    ];

    function catmull(p0, p1, p2, p3, t) {
      const t2 = t * t, t3 = t2 * t;
      return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2*p0 - 5*p1 + 4*p2 - p3) * t2 + (-p0 + 3*p1 - 3*p2 + p3) * t3);
    }

    function sampleProfile(t) {
      t = THREE.MathUtils.clamp(t, 0, 1);
      let i = 0;
      while (i < profile.length - 2 && t > profile[i + 1][0]) i++;
      const a = profile[i], b = profile[i + 1];
      const p0 = profile[Math.max(0, i - 1)];
      const p3 = profile[Math.min(profile.length - 1, i + 2)];
      const local = (t - a[0]) / (b[0] - a[0]);
      return {
        y: catmull(p0[1], a[1], b[1], p3[1], local),
        r: Math.max(0.001, catmull(p0[2], a[2], b[2], p3[2], local))
      };
    }

    function smoothstep(a, b, x) {
      const q = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
      return q * q * (3 - 2 * q);
    }

    function makeGhostSurface() {
      const around = 240;
      const heightSegments = 150;
      const positions = [];
      const uvs = [];
      const indices = [];

      for (let j = 0; j <= heightSegments; j++) {
        const t = j / heightSegments;
        const p = sampleProfile(t);
        const hem = smoothstep(0.70, 1.0, t);
        for (let i = 0; i <= around; i++) {
          const theta = (i / around) * Math.PI * 2;
          const scallop = Math.cos(5 * theta + 0.06);
          const r = p.r * (1 + 0.038 * hem * (0.5 + 0.5 * Math.cos(5 * theta - 0.25)));
          const y = p.y - 0.125 * hem * scallop;
          positions.push(r * Math.sin(theta), y, r * Math.cos(theta));
          uvs.push(i / around, 1 - t);
        }
      }

      for (let j = 0; j < heightSegments; j++) {
        for (let i = 0; i < around; i++) {
          const a = j * (around + 1) + i;
          const b = a + 1;
          const c = a + around + 1;
          const d = c + 1;
          // Winding is outward-facing for the y-down profile and z-forward front.
          indices.push(a, c, b, b, c, d);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return geometry;
    }

    function makeInnerLining() {
      // A second, inset shell makes the ghost genuinely hollow rather than a one-sided sheet.
      // Its normals face the cavity, so it remains visible when the camera is underneath.
      const around = 240;
      const heightSegments = 150;
      const positions = [];
      const indices = [];

      for (let j = 0; j <= heightSegments; j++) {
        const t = j / heightSegments;
        const p = sampleProfile(t);
        const hem = smoothstep(0.70, 1.0, t);
        const inset = 0.052 * smoothstep(0.015, 0.34, t);

        for (let i = 0; i <= around; i++) {
          const theta = (i / around) * Math.PI * 2;
          const scallop = Math.cos(5 * theta + 0.06);
          const wave = 0.5 + 0.5 * Math.cos(5 * theta - 0.25);
          const outerR = p.r * (1 + 0.038 * hem * wave);
          const innerR = Math.max(0.002, outerR - inset);
          const outerY = p.y - 0.125 * hem * scallop;
          const innerY = outerY + 0.018 * hem;
          positions.push(innerR * Math.sin(theta), innerY, innerR * Math.cos(theta));
        }
      }

      for (let j = 0; j < heightSegments; j++) {
        for (let i = 0; i < around; i++) {
          const a = j * (around + 1) + i;
          const b = a + 1;
          const c = a + around + 1;
          const d = c + 1;
          // Reverse the outer winding: these normals point into the hollow interior.
          indices.push(a, b, c, b, d, c);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return geometry;
    }

    function makeHemBand() {
      // Connect the outer skin to the inset lining, leaving a visible, rounded fabric edge.
      const around = 240;
      const across = 5;
      const positions = [];
      const indices = [];
      const edge = sampleProfile(1);

      for (let j = 0; j <= across; j++) {
        const s = j / across;
        for (let i = 0; i <= around; i++) {
          const theta = (i / around) * Math.PI * 2;
          const scallop = Math.cos(5 * theta + 0.06);
          const wave = 0.5 + 0.5 * Math.cos(5 * theta - 0.25);
          const outerR = edge.r * (1 + 0.038 * wave);
          const outerY = edge.y - 0.125 * scallop;
          const innerR = outerR - 0.052;
          const innerY = outerY + 0.018;
          const r = THREE.MathUtils.lerp(outerR, innerR, s);
          const y = THREE.MathUtils.lerp(outerY, innerY, s);
          positions.push(r * Math.sin(theta), y, r * Math.cos(theta));
        }
      }

      for (let j = 0; j < across; j++) {
        for (let i = 0; i < around; i++) {
          const a = j * (around + 1) + i;
          const b = a + 1;
          const c = a + around + 1;
          const d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      return geometry;
    }

    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: '#f13b24',
      side: THREE.DoubleSide,
      roughness: 0.34,
      metalness: 0.0,
      clearcoat: 0.24,
      clearcoatRoughness: 0.34,
      sheen: 0.12,
      sheenRoughness: 0.78,
      sheenColor: new THREE.Color('#ff7655')
    });
    const body = new THREE.Mesh(makeGhostSurface(), bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    ghost.add(body);

    const liningMaterial = new THREE.MeshPhysicalMaterial({
      color: '#c83220',
      side: THREE.DoubleSide,
      roughness: 0.52,
      metalness: 0.0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.48,
      sheen: 0.18,
      sheenRoughness: 0.82,
      sheenColor: new THREE.Color('#f36a49'),
      side: THREE.FrontSide
    });
    const lining = new THREE.Mesh(makeInnerLining(), liningMaterial);
    lining.castShadow = true;
    lining.receiveShadow = true;
    ghost.add(lining);

    const hemMaterial = new THREE.MeshStandardMaterial({
      color: '#b92a1d',
      roughness: 0.48,
      side: THREE.DoubleSide
    });
    const hem = new THREE.Mesh(makeHemBand(), hemMaterial);
    hem.castShadow = true;
    hem.receiveShadow = true;
    ghost.add(hem);

    // Gentle light inside the cavity keeps the lining legible from a fully inverted view.
    const interiorFill = new THREE.PointLight(0xff9977, 0.62, 5.5, 2);
    interiorFill.position.set(0, 0.52, 0);
    ghost.add(interiorFill);

    function ovalGeometry(rx, ry, depth, bevel) {
      const shape = new THREE.Shape();
      shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        steps: 1,
        curveSegments: 64,
        bevelEnabled: true,
        bevelSegments: 5,
        bevelThickness: bevel,
        bevelSize: bevel * 0.78
      });
      geo.translate(0, 0, -depth * 0.5);
      return geo;
    }

    function radiusAtY(targetY) {
      let lo = 0, hi = 1;
      for (let k = 0; k < 40; k++) {
        const mid = (lo + hi) * 0.5;
        if (sampleProfile(mid).y > targetY) lo = mid;
        else hi = mid;
      }
      return sampleProfile((lo + hi) * 0.5).r;
    }

    function addEye(x, y) {
      const r = radiusAtY(y);
      const theta = Math.asin(THREE.MathUtils.clamp(x / r, -0.95, 0.95));
      const z = r * Math.cos(theta);
      const dy = 0.012;
      const rAbove = radiusAtY(y + dy);
      const rBelow = radiusAtY(y - dy);
      const drdy = (rAbove - rBelow) / (2 * dy);
      const normal = new THREE.Vector3(Math.sin(theta), -drdy * 0.28, Math.cos(theta)).normalize();

      const eye = new THREE.Group();
      eye.position.set(x, y, z + 0.008);
      eye.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      ghost.add(eye);

      const socketMaterial = new THREE.MeshStandardMaterial({ color: '#8f2116', roughness: 0.72, metalness: 0.0 });
      const rimMaterial = new THREE.MeshPhysicalMaterial({ color: '#f64a2e', roughness: 0.42, clearcoat: 0.16, clearcoatRoughness: 0.4 });
      const innerMaterial = new THREE.MeshStandardMaterial({ color: '#080808', roughness: 0.88, metalness: 0.0 });

      const socket = new THREE.Mesh(ovalGeometry(0.177, 0.242, 0.027, 0.014), socketMaterial);
      socket.position.z = -0.004;
      eye.add(socket);

      const rimRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.043, 12, 72), rimMaterial);
      rimRing.scale.set(0.161, 0.224, 1);
      rimRing.position.z = 0.014;
      eye.add(rimRing);

      const black = new THREE.Mesh(ovalGeometry(0.145, 0.211, 0.026, 0.010), innerMaterial);
      black.position.z = 0.020;
      eye.add(black);
    }

    addEye(-0.355, 1.285);
    addEye( 0.355, 1.285);

    // Slightly elevated, hovering pose; only a tiny vertical idle motion is animated.
    const baseY = 0.12;
    ghost.scale.setScalar(1.08);
    ghost.position.y = baseY;

    // The model is the only visual control: drag to rotate, scroll to zoom.

    let previous = performance.now();
    function animate(now) {
      requestAnimationFrame(animate);
      const elapsed = (now - previous) * 0.001;
      previous = now;
      ghost.position.y = baseY + Math.sin(now * 0.00085) * 0.025;
      controls.update();
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);

    const resizeRenderer = () => {
      const { width, height } = getStageSize();
      camera.aspect = width / height;
      const zoomLimits = getZoomLimits(width);
      controls.minDistance = zoomLimits.min;
      controls.maxDistance = zoomLimits.max;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      // Re-apply the responsive limits immediately after a viewport change.
      controls.update();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    };
    window.addEventListener('resize', resizeRenderer, { passive: true });
    if ('ResizeObserver' in window) {
      const stageObserver = new ResizeObserver(resizeRenderer);
      stageObserver.observe(stage);
    }
