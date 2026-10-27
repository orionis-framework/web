import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createReactorCore } from './reactor-core';
import { createReactorNetwork } from './reactor-network';
import { lifecycleSequence, phaseDuration } from './lifecycle';
import {
  clampSceneZoom,
  fitSceneDistance,
  MAX_SCENE_ZOOM,
  MIN_SCENE_ZOOM,
  stepSceneZoom,
} from './scene-camera';

export interface ReactorSettings {
  paused: boolean;
  expanded: boolean;
  reducedMotion: boolean;
  phase: number;
  zoom: number;
}

interface ReactorSceneOptions {
  canvas: HTMLCanvasElement;
  host: HTMLDivElement;
  dark: boolean;
  settings: ReactorSettings;
  timeline: { current: number };
  onPhase: (phase: number) => void;
  onReducedMotion: () => void;
  onContextLost: () => void;
  onZoom: (zoom: number) => void;
  onReady: () => void;
}

export function createReactorScene({
  canvas,
  host,
  dark,
  settings,
  timeline,
  onPhase,
  onReducedMotion,
  onContextLost,
  onZoom,
  onReady,
}: ReactorSceneOptions) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  const scene = new THREE.Scene();
  const cleanups: (() => void)[] = [];
  let disposed = false;
  let frameId = 0;

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frameId);
    cleanups.forEach((cleanup) => cleanup());
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    scene.traverse((object) => {
      if (
        object instanceof THREE.Mesh ||
        object instanceof THREE.Line ||
        object instanceof THREE.Points
      ) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material]) {
          materials.add(material);
          for (const value of Object.values(material))
            if (value instanceof THREE.Texture) textures.add(value);
        }
        if (object instanceof THREE.InstancedMesh) object.dispose();
      }
      if (object instanceof THREE.Light && 'shadow' in object) {
        (object as THREE.DirectionalLight).shadow?.dispose();
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    renderer.dispose();
  }

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, host.clientWidth < 500 ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // Studio reflections give metal and ceramic surfaces depth without remote textures.
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    cleanups.push(
      () => room.dispose(),
      () => pmrem.dispose(),
    );
    const environment = pmrem.fromScene(room, 0.035, 0.1, 100, { size: 128 });
    cleanups.push(() => environment.dispose());
    scene.environment = environment.texture;
    scene.environmentIntensity = dark ? 0.7 : 0.85;

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const viewDirection = new THREE.Vector3(6.5, 6.5, 14).normalize();
    const controls = new OrbitControls(camera, canvas);
    cleanups.push(() => controls.dispose());
    controls.target.set(0, -0.15, 0);
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.zoomSpeed = 0.7;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controls.enableDamping = false;
    controls.rotateSpeed = 0.55;
    controls.minPolarAngle = 0.4;
    controls.maxPolarAngle = 1.22;
    controls.minAzimuthAngle = -0.65;
    controls.maxAzimuthAngle = 1.35;

    scene.add(new THREE.HemisphereLight(0xcbeaff, dark ? 0x10233b : 0x8b9eaf, 1.45));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(-5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(keyLight.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
    keyLight.shadow.normalBias = 0.035;
    scene.add(keyLight);
    const rim = new THREE.DirectionalLight(0xb1e9ff, 1.8);
    rim.position.set(5, 5, -6);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xd1e8ff, 1.3);
    fill.position.set(5, 2, 8);
    scene.add(fill);

    const root = new THREE.Group();
    scene.add(root);
    const fontFamily = getComputedStyle(host).getPropertyValue('--font-titillium-web').trim();
    const core = createReactorCore(THREE, { dark, fontFamily });
    core.group.scale.set(1.1, 1.08, 1.1);
    root.add(core.group);
    const network = createReactorNetwork(THREE, { dark, fontFamily });
    root.add(network.group);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: dark ? 0.23 : 0.12 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    // A sparse constellation traces the volume around the suspended processor.
    const particlePositions = new Float32Array(54 * 3);
    for (let index = 0; index < 54; index++) {
      const angle = index * 2.399963;
      const radius = 2.1 + ((index * 17) % 19) / 13;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = -0.75 + ((index * 7) % 23) / 7;
      particlePositions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    const particles = new THREE.Points(
      new THREE.BufferGeometry().setAttribute(
        'position',
        new THREE.BufferAttribute(particlePositions, 3),
      ),
      new THREE.PointsMaterial({
        color: dark ? '#74dfff' : '#448bb0',
        size: 0.027,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    );
    root.add(particles);

    let elapsed = 0;
    let previousTime = 0;
    let lastPaint = 0;
    let visible = true;
    let interacting = false;
    let expansion = settings.expanded ? 1 : 0;
    let settleFrames = 0;
    let firstFrameRendered = false;

    function requestDraw(settle = false) {
      if (disposed) return;
      if (settle) settleFrames = settings.reducedMotion ? 0 : 40;
      if (!frameId && visible && document.visibilityState !== 'hidden')
        frameId = requestAnimationFrame(render);
    }

    function render(time: number) {
      frameId = 0;
      if (disposed || !visible || document.visibilityState === 'hidden') {
        previousTime = 0;
        return;
      }
      const playing = !settings.paused && !settings.reducedMotion && !interacting;
      if (host.clientWidth < 500 && playing && time - lastPaint < 30) {
        frameId = requestAnimationFrame(render);
        return;
      }
      const delta = previousTime ? THREE.MathUtils.clamp((time - previousTime) / 1000, 0, 0.08) : 0;
      previousTime = time;
      lastPaint = time;
      if (playing) {
        elapsed += delta;
        timeline.current += delta;
        const phase =
          lifecycleSequence[
            Math.floor(timeline.current / phaseDuration) % lifecycleSequence.length
          ];
        if (phase !== settings.phase) {
          settings.phase = phase;
          onPhase(phase);
        }
      }
      expansion = settings.reducedMotion
        ? Number(settings.expanded)
        : THREE.MathUtils.lerp(expansion, Number(settings.expanded), 0.13);
      root.rotation.y = Math.sin(elapsed * 0.13) * 0.045;
      core.update(elapsed, settings.phase, expansion, settings.reducedMotion);
      network.update(elapsed, settings.phase, expansion, settings.reducedMotion);
      particles.rotation.y = elapsed * 0.025;
      particles.visible = settings.phase !== 4;
      renderer.render(scene, camera);
      if (!firstFrameRendered) {
        firstFrameRendered = true;
        onReady();
      }
      if (playing || settleFrames-- > 0) frameId = requestAnimationFrame(render);
      else previousTime = 0;
    }

    let initializedCamera = false;
    let fitDistance = 15;
    function resize() {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      camera.aspect = aspect;
      const distance = fitSceneDistance(aspect, camera.fov);
      fitDistance = distance;
      const direction = initializedCamera
        ? camera.position.clone().sub(controls.target).normalize()
        : viewDirection;
      camera.position.copy(controls.target).addScaledVector(direction, distance / settings.zoom);
      controls.minDistance = fitDistance / MAX_SCENE_ZOOM;
      controls.maxDistance = fitDistance / MIN_SCENE_ZOOM;
      camera.updateProjectionMatrix();
      controls.update();
      initializedCamera = true;
      renderer.setSize(width, height, false);
      requestDraw();
    }
    const resizeObserver = new ResizeObserver(resize);
    cleanups.push(() => resizeObserver.disconnect());
    resizeObserver.observe(host);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    function updateMotion() {
      settings.reducedMotion = motionQuery.matches;
      if (motionQuery.matches) {
        settings.paused = true;
        onReducedMotion();
      }
      requestDraw();
    }
    const visibilityChanged = () => {
      previousTime = 0;
      requestDraw();
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visibilityChanged();
    });
    cleanups.push(() => intersectionObserver.disconnect());
    intersectionObserver.observe(host);
    const contextLost = (event: Event) => {
      event.preventDefault();
      dispose();
      onContextLost();
    };
    canvas.addEventListener('webglcontextlost', contextLost);
    document.addEventListener('visibilitychange', visibilityChanged);
    motionQuery.addEventListener('change', updateMotion);
    cleanups.push(() => {
      canvas.removeEventListener('webglcontextlost', contextLost);
      document.removeEventListener('visibilitychange', visibilityChanged);
      motionQuery.removeEventListener('change', updateMotion);
    });
    controls.addEventListener('start', () => {
      interacting = true;
    });
    controls.addEventListener('end', () => {
      interacting = false;
      previousTime = 0;
      requestDraw();
    });
    controls.addEventListener('change', () => {
      const nextZoom = clampSceneZoom(fitDistance / camera.position.distanceTo(controls.target));
      if (Math.abs(nextZoom - settings.zoom) > 0.0001) {
        settings.zoom = nextZoom;
        onZoom(nextZoom);
      }
      requestDraw();
    });
    function zoomTo(value: number) {
      const nextZoom = clampSceneZoom(value);
      settings.zoom = nextZoom;
      const direction = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(direction, fitDistance / nextZoom);
      controls.update();
      onZoom(nextZoom);
      requestDraw();
    }
    updateMotion();
    resize();
    return {
      draw: () => requestDraw(true),
      reset: () => {
        settings.zoom = 1;
        controls.target.set(0, -0.15, 0);
        camera.position.copy(controls.target).addScaledVector(viewDirection, fitDistance);
        controls.update();
        onZoom(1);
        requestDraw();
      },
      zoomTo,
      zoomBy: (direction: 1 | -1) => zoomTo(stepSceneZoom(settings.zoom, direction)),
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
