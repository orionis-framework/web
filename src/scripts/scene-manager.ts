import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// Drag-to-rotate replaces OrbitControls so the model pivots around its own center

export interface SceneConfig {
  container: HTMLElement;
  modelPath: string;
  cameraDistance?: number;
  autoRotateSpeed?: number;
  modelScale?: number;
  enableScroll?: boolean;
  enableFloat?: boolean;
  floatAmplitude?: number;
  floatSpeed?: number;
  showStars?: boolean;
  starsCount?: number;
  /** Camera field-of-view in degrees */
  fov?: number;
  /** Explicit camera offset from center [x, y, z] */
  cameraOffset?: [number, number, number];
  /** Model position offset after centering [x, y, z] */
  modelOffset?: [number, number, number];
  /** Initial rotation [x, y, z] in radians */
  initialRotation?: [number, number, number];
  /** Mouse parallax strength 0..1 */
  parallaxStrength?: number;
  /** Rim light color */
  rimColor?: string;
  /** Main key light color */
  keyLightColor?: string;
  /** Fill light color */
  fillLightColor?: string;
  /** Environment intensity for PBR materials */
  envIntensity?: number;
  /** Exposure for tone mapping */
  exposure?: number;
  /** Enable OrbitControls (drag to rotate, scroll to zoom) */
  enableOrbitControls?: boolean;
}

export class SpaceSceneManager {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private model: THREE.Object3D | null = null;
  private animationId: number = 0;
  private readonly container: HTMLElement;
  private readonly config: Required<
    Pick<SceneConfig, 'autoRotateSpeed' | 'enableScroll' | 'enableFloat' |
    'floatAmplitude' | 'floatSpeed' | 'parallaxStrength' | 'showStars'>
  > & SceneConfig;
  private scrollFactor: number = 0;
  private readonly mouse = { x: 0, y: 0 };
  private readonly smoothMouse = { x: 0, y: 0 };
  private stars: THREE.Points | null = null;
  private readonly startTime: number = 0;
  private modelBaseY: number = 0;
  private baseRotationY: number = 0;
  private isDragging = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private dragRotationY = 0;
  private dragRotationX = 0;
  private disposed = false;

  constructor(config: SceneConfig) {
    this.container = config.container;
    this.startTime = performance.now();
    this.config = {
      autoRotateSpeed: 0.002,
      enableScroll: true,
      enableFloat: true,
      floatAmplitude: 0.15,
      floatSpeed: 0.8,
      parallaxStrength: 0.15,
      showStars: true,
      starsCount: 1200,
      fov: 40,
      exposure: 1.4,
      envIntensity: 1,
      ...config,
    };

    // --- Scene ---
    this.scene = new THREE.Scene();

    // --- Camera ---
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const fov = this.config.fov ?? 40;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.01, 2000);
    const camDist = config.cameraDistance ?? 5;
    const camOff = config.cameraOffset ?? [0, 0, camDist];
    this.camera.position.set(camOff[0], camOff[1], camOff[2]);
    this.camera.lookAt(0, 0, 0);

    // --- Renderer ---
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.config.exposure ?? 1.4;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    // --- Lighting Rig (3-point + rim for NASA look) ---
    this.setupLighting();

    // --- Procedural environment cubemap for PBR reflections ---
    this.setupEnvironment();

    // --- Stars ---
    if (this.config.showStars) {
      this.createStarField(this.config.starsCount ?? 1200);
    }

    // --- Load Model ---
    this.loadModel(config.modelPath, config.modelScale ?? 1);

    // --- Events ---
    this.setupEvents();

    // --- Drag-to-Rotate (rotates model around its own center) ---
    if (this.config.enableOrbitControls) {
      this.setupDragRotate();
    }

    // --- Animation ---
    this.animate();
  }

  /* ───────── LIGHTING ───────── */
  private setupLighting() {
    const keyColor = this.config.keyLightColor
      ? new THREE.Color(this.config.keyLightColor) : new THREE.Color(0xffffff);
    const fillColor = this.config.fillLightColor
      ? new THREE.Color(this.config.fillLightColor) : new THREE.Color(0x4cc9f0);
    const rimColor = this.config.rimColor
      ? new THREE.Color(this.config.rimColor) : new THREE.Color(0x4cc9f0);

    // Ambient – low for deep-space vibe
    const ambient = new THREE.AmbientLight(0x1a2540, 0.6);
    this.scene.add(ambient);

    // Hemisphere light – subtle sky/ground gradient
    const hemi = new THREE.HemisphereLight(0x4cc9f0, 0x0a0e1a, 0.4);
    this.scene.add(hemi);

    // Key light – main directional (sun-like)
    const keyLight = new THREE.DirectionalLight(keyColor, 3);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = false;
    this.scene.add(keyLight);

    // Fill light – softer, opposite side
    const fillLight = new THREE.DirectionalLight(fillColor, 1.2);
    fillLight.position.set(-4, 2, 4);
    this.scene.add(fillLight);

    // Rim / back light – edge highlights
    const rimLight = new THREE.DirectionalLight(rimColor, 2);
    rimLight.position.set(0, -3, -6);
    this.scene.add(rimLight);

    // Accent point light from below (subtle gold kick)
    const accentLight = new THREE.PointLight(0xf4c430, 0.8, 50);
    accentLight.position.set(-3, -4, 2);
    this.scene.add(accentLight);

    // Top spot for panel highlights
    const topSpot = new THREE.SpotLight(0xffffff, 1.5, 60, Math.PI / 6, 0.5, 1);
    topSpot.position.set(0, 10, 0);
    topSpot.target.position.set(0, 0, 0);
    this.scene.add(topSpot);
    this.scene.add(topSpot.target);
  }

  /* ───────── ENVIRONMENT MAP ───────── */
  private setupEnvironment() {
    // Create a simple procedural cubemap for PBR reflections
    const envSize = 128;
    const cubeRT = new THREE.WebGLCubeRenderTarget(envSize);
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRT);

    // Temporary gradient scene for environment
    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(50, 32, 32);
    const envMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x0a1628),
      side: THREE.BackSide,
    });
    envScene.add(new THREE.Mesh(envGeo, envMat));

    // Small bright spots simulating star reflections
    const starGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x4cc9f0 });
    for (let i = 0; i < 20; i++) {
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
      );
      envScene.add(star);
    }

    cubeCamera.update(this.renderer, envScene);
    this.scene.environment = cubeRT.texture;

    // Clean up temporary scene
    envGeo.dispose();
    envMat.dispose();
    starGeo.dispose();
    starMat.dispose();
  }

  /* ───────── STAR FIELD ───────── */
  private createStarField(count: number) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const baseCyan = new THREE.Color(0x4cc9f0);
    const baseWhite = new THREE.Color(0xffffff);
    const baseGold = new THREE.Color(0xf4c430);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * 300;
      positions[i3 + 1] = (Math.random() - 0.5) * 300;
      positions[i3 + 2] = (Math.random() - 0.5) * 300;

      // Mix of colors for visual variety
      const r = Math.random();
      let c = baseGold;
      if (r < 0.6) c = baseWhite;
      else if (r < 0.85) c = baseCyan;
      colors[i3]     = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    });

    this.stars = new THREE.Points(geo, mat);
    this.scene.add(this.stars);
  }

  /* ───────── MODEL LOADING ───────── */
  private loadModel(path: string, scale: number) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      path,
      (gltf) => {
        if (this.disposed) return;

        this.model = gltf.scene;

        // --- Enhance materials for visibility ---
        this.model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mat = mesh.material;

            if (Array.isArray(mat)) {
              mat.forEach((m) => this.enhanceMaterial(m));
            } else {
              this.enhanceMaterial(mat);
            }
          }
        });

        // --- Compute bounding box and auto-frame ---
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Normalize scale: fit model into unit sphere of radius 1, then apply user scale
        const maxDim = Math.max(size.x, size.y, size.z);
        const normalizeScale = maxDim > 0 ? 1 / maxDim : 1;
        this.model.scale.setScalar(normalizeScale * scale);

        // Re-center after scaling
        box.setFromObject(this.model);
        box.getCenter(center);
        this.model.position.sub(center);

        // Apply model offset if provided
        if (this.config.modelOffset) {
          this.model.position.x += this.config.modelOffset[0];
          this.model.position.y += this.config.modelOffset[1];
          this.model.position.z += this.config.modelOffset[2];
        }
        this.modelBaseY = this.model.position.y;

        // Apply initial rotation if provided
        if (this.config.initialRotation) {
          this.model.rotation.set(
            this.config.initialRotation[0],
            this.config.initialRotation[1],
            this.config.initialRotation[2],
          );
          this.baseRotationY = this.config.initialRotation[1];
        }

        this.scene.add(this.model);
      },
      undefined,
      (error) => {
        console.warn('Model load skipped:', path, error);
      },
    );
  }

  /** Upgrade material for better visibility in space scene */
  private enhanceMaterial(mat: THREE.Material) {
    if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
      this.enhanceStandardMaterial(mat);
    } else if (mat instanceof THREE.MeshBasicMaterial) {
      this.brightenDarkBasicMaterial(mat);
    }
  }

  private enhanceStandardMaterial(mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial) {
    mat.envMapIntensity = this.config.envIntensity ?? 1;
    mat.needsUpdate = true;

    // If the model has no texture and is very dark, brighten it
    if (!mat.map && mat.color) {
      const lum = mat.color.r * 0.2126 + mat.color.g * 0.7152 + mat.color.b * 0.0722;
      if (lum < 0.05) {
        mat.color.set(0x8899aa);
        mat.metalness = 0.6;
        mat.roughness = 0.4;
      }
    }

    // Clamp metalness/roughness to reasonable values for good lighting
    if (mat.metalness !== undefined) {
      mat.metalness = Math.max(0.1, Math.min(mat.metalness, 0.95));
    }
    if (mat.roughness !== undefined) {
      mat.roughness = Math.max(0.15, Math.min(mat.roughness, 0.85));
    }
  }

  private brightenDarkBasicMaterial(mat: THREE.MeshBasicMaterial) {
    if (mat.color) {
      const lum = mat.color.r * 0.2126 + mat.color.g * 0.7152 + mat.color.b * 0.0722;
      if (lum < 0.05) {
        mat.color.set(0x8899aa);
      }
    }
  }

  /* ───────── DRAG-TO-ROTATE ───────── */
  private setupDragRotate() {
    const canvas = this.renderer.domElement;
    const sensitivity = 0.006;

    const onPointerDown = (e: PointerEvent) => {
      this.isDragging = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.dragRotationY += dx * sensitivity;
      this.dragRotationX += dy * sensitivity * 0.5;
      // Clamp vertical rotation to ±45°
      this.dragRotationX = Math.max(-0.78, Math.min(0.78, this.dragRotationX));
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      this.isDragging = false;
      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
  }

  /* ───────── EVENTS ───────── */
  private setupEvents() {
    const resizeHandler = () => this.onResize();
    globalThis.addEventListener('resize', resizeHandler);

    if (this.config.enableScroll) {
      globalThis.addEventListener('scroll', () => {
        const scrollY = globalThis.scrollY;
        const maxScroll = document.documentElement.scrollHeight - globalThis.innerHeight;
        this.scrollFactor = maxScroll > 0 ? scrollY / maxScroll : 0;
      }, { passive: true });
    }

    globalThis.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = this.container.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const rawY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.mouse.x = Math.max(-1, Math.min(1, rawX));
      this.mouse.y = Math.max(-1, Math.min(1, rawY));
    }, { passive: true });
  }

  private onResize() {
    if (this.disposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /* ───────── ANIMATION LOOP ───────── */
  private animate() {
    if (this.disposed) return;
    this.animationId = requestAnimationFrame(() => this.animate());

    const elapsed = (performance.now() - this.startTime) / 1000;

    // If drag-rotate mode is active
    if (this.config.enableOrbitControls) {
      if (this.model) {
        // Auto-rotate when not dragging
        if (!this.isDragging) {
          this.baseRotationY += this.config.autoRotateSpeed ?? 0.002;
        }
        this.model.rotation.y = this.baseRotationY + this.dragRotationY;
        this.model.rotation.x = (this.config.initialRotation?.[0] ?? 0) + this.dragRotationX;

        if (this.config.enableFloat) {
          const amp = this.config.floatAmplitude ?? 0.15;
          const spd = this.config.floatSpeed ?? 0.8;
          this.model.position.y = this.modelBaseY + Math.sin(elapsed * spd) * amp;
        }
      }
    } else {
      // Manual mouse-parallax mode (no orbit controls)
      const strength = this.config.parallaxStrength ?? 0.15;

      this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * 0.08;
      this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * 0.08;

      if (this.model) {
        this.baseRotationY += this.config.autoRotateSpeed ?? 0.002;

        const mouseRotY = this.smoothMouse.x * strength * 0.8;
        const mouseRotX = this.smoothMouse.y * strength * 0.5;

        this.model.rotation.y = this.baseRotationY + mouseRotY;
        this.model.rotation.x = (this.config.initialRotation?.[0] ?? 0) + mouseRotX;

        const basePosX = this.config.modelOffset?.[0] ?? 0;
        const basePosZ = this.config.modelOffset?.[2] ?? 0;
        this.model.position.x = basePosX + this.smoothMouse.x * strength * 0.3;
        this.model.position.z = basePosZ + this.smoothMouse.y * strength * 0.15;

        if (this.config.enableFloat) {
          const amp = this.config.floatAmplitude ?? 0.15;
          const spd = this.config.floatSpeed ?? 0.8;
          this.model.position.y = this.modelBaseY + Math.sin(elapsed * spd) * amp;
        }
      }
    }

    // Stars rotation
    if (this.stars) {
      this.stars.rotation.y += 0.00015;
      this.stars.rotation.x += 0.00008;
    }

    // Scroll parallax on camera
    if (this.config.enableScroll) {
      this.camera.position.y = (this.config.cameraOffset?.[1] ?? 0) - this.scrollFactor * 1.5;
      this.camera.lookAt(0, 0, 0);
    }

    this.renderer.render(this.scene, this.camera);
  }

  /* ───────── CLEANUP ───────── */
  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.remove();
    }
  }
}
