'use client';

import { Layers3, Pause, Play, RotateCcw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';
import { asset } from '@/lib/asset';

interface ArchitectureSceneProps {
  labels: {
    description: string;
    pause: string;
    play: string;
    expand: string;
    collapse: string;
    reset: string;
  };
}

export function ArchitectureScene({ labels }: ArchitectureSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef({ paused: false, expanded: false, reducedMotion: false });
  const resetRef = useRef<(() => void) | null>(null);
  const drawRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    let cancelled = false;
    let dispose = () => {};

    async function initialize() {
      const [THREE, { OrbitControls }] = await Promise.all([
        import('three'),
        import('three/addons/controls/OrbitControls.js'),
        document.fonts.ready,
      ]);
      if (cancelled) return;

      const dark = resolvedTheme === 'dark';
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas!,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'low-power',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 0.1, 80);
      camera.position.set(9, 7.5, 12);
      camera.lookAt(0, 0.1, 0);

      const controls = new OrbitControls(camera, canvas!);
      controls.target.set(0, 0.1, 0);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minPolarAngle = 0.55;
      controls.maxPolarAngle = 1.18;
      controls.minAzimuthAngle = -0.15;
      controls.maxAzimuthAngle = 1.25;
      controls.update();
      controls.saveState();
      resetRef.current = () => controls.reset();

      scene.add(new THREE.HemisphereLight(0xffffff, dark ? 0x294860 : 0xb6c6d7, 2.5));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      keyLight.position.set(-4, 9, 7);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -8;
      keyLight.shadow.camera.right = 8;
      keyLight.shadow.camera.top = 8;
      keyLight.shadow.camera.bottom = -8;
      keyLight.shadow.normalBias = 0.035;
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0x9ed8ff, 1.1);
      fillLight.position.set(6, 3, -5);
      scene.add(fillLight);

      const root = new THREE.Group();
      root.rotation.y = -0.12;
      scene.add(root);
      const textures: InstanceType<typeof THREE.Texture>[] = [];
      const family = getComputedStyle(host!).getPropertyValue('--font-titillium-web').trim();

      function labelTexture(
        title: string,
        subtitle: string,
        color: string,
        width: number,
        height: number,
      ) {
        const bitmap = document.createElement('canvas');
        bitmap.height = 256;
        bitmap.width = Math.round((width / height) * bitmap.height);
        const context = bitmap.getContext('2d')!;
        context.fillStyle = color;
        context.fillRect(0, 0, bitmap.width, bitmap.height);
        context.fillStyle = color === '#082b52' || color === '#206bc4' ? '#ffffff' : '#082b52';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        let fontSize = subtitle ? 95 : 83;
        context.font = `700 ${fontSize}px ${family}`;
        if (context.measureText(title).width > bitmap.width - 70) {
          fontSize *= (bitmap.width - 70) / context.measureText(title).width;
          context.font = `700 ${fontSize}px ${family}`;
        }
        context.fillText(title, bitmap.width / 2, subtitle ? 100 : 128);
        if (subtitle) {
          context.font = `400 43px ${family}`;
          context.fillText(subtitle, bitmap.width / 2, 194);
        }
        const texture = new THREE.CanvasTexture(bitmap);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        textures.push(texture);
        return texture;
      }

      function block(
        title: string,
        subtitle: string,
        color: string,
        width: number,
        height: number,
        depth: number,
      ) {
        const group = new THREE.Group();
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.38,
          metalness: 0.12,
        });
        const body = new THREE.Mesh(geometry, material);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({
            color: dark ? '#b3d7ed' : '#244c6f',
            transparent: true,
            opacity: 0.5,
          }),
        );
        group.add(edges);
        if (title) {
          const label = new THREE.Mesh(
            new THREE.PlaneGeometry(width * 0.94, height * 0.9),
            new THREE.MeshBasicMaterial({
              map: labelTexture(title, subtitle, color, width, height),
            }),
          );
          label.position.z = depth / 2 + 0.008;
          group.add(label);
        }
        root.add(group);
        return group;
      }

      const platform = block('', '', dark ? '#172b40' : '#e8edf2', 6.4, 0.16, 5.5);
      platform.position.set(0, -1.89, 0.7);

      const layerDefinitions = [
        {
          title: 'GRANIAN',
          subtitle: 'Rust engine / ASGI + RSGI',
          color: '#082b52',
          height: 0.56,
          base: -1.48,
        },
        {
          title: 'ORIONIS',
          subtitle: 'Async-first HTTP kernel',
          color: '#206bc4',
          height: 0.76,
          base: -0.65,
        },
        {
          title: 'SERVICE CONTAINER',
          subtitle: 'Providers / Scoped DI',
          color: '#66d5f4',
          height: 0.58,
          base: 0.2,
        },
      ];
      const layers = layerDefinitions.map((definition, index) => {
        const group = block(
          definition.title,
          definition.subtitle,
          definition.color,
          5.15,
          definition.height,
          2.85,
        );
        group.position.y = definition.base;
        return { group, base: definition.base, separation: index * 0.38 };
      });

      const moduleDefinitions = [
        { title: 'HTTP', color: '#eef4fa', position: -1.75 },
        { title: 'REALTIME', color: '#a4e8ef', position: 0 },
        { title: 'MCP', color: '#f5ca37', position: 1.75 },
      ];
      moduleDefinitions.forEach((definition) => {
        const group = block(definition.title, '', definition.color, 1.65, 0.96, 2.85);
        group.position.set(definition.position, 1.15, 0);
        layers.push({ group, base: 1.15, separation: 1.18 });
      });

      const logoTexture = new THREE.TextureLoader().load(asset('/favicon.svg'), () => {
        if (!cancelled) drawRef.current?.();
      });
      logoTexture.colorSpace = THREE.SRGBColorSpace;
      textures.push(logoTexture);
      const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(1.05, 1.05),
        new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true, depthWrite: false }),
      );
      logo.rotation.x = -Math.PI / 2;
      logo.position.set(0, 0.486, 0);
      layers[4].group.add(logo);

      const satellites = ['ORM', 'CACHE', 'QUEUES'];
      const packets = satellites.map((title, index) => {
        const position = (index - 1) * 2.15;
        const group = block(title, '', dark ? '#c3dcec' : '#f5f8fc', 1.72, 0.35, 0.86);
        group.position.set(position, -1.55, 2.65);
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(position * 0.78, -1.65, 1.45),
          new THREE.Vector3(position, -1.65, 1.85),
          new THREE.Vector3(position, -1.65, 2.23),
        ]);
        const color = index === 1 ? '#dba900' : '#206bc4';
        root.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(curve, 24, 0.019, 6, false),
            new THREE.MeshBasicMaterial({ color }),
          ),
        );
        const packet = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.065, 0.1),
          new THREE.MeshBasicMaterial({ color: index === 1 ? '#f5ca37' : '#66d5f4' }),
        );
        root.add(packet);
        return { curve, packet, phase: index / 3 };
      });

      const grid = new THREE.GridHelper(
        30,
        44,
        dark ? '#36526c' : '#cddbe8',
        dark ? '#36526c' : '#dce6ef',
      );
      grid.position.y = -2;
      grid.material.transparent = true;
      grid.material.opacity = dark ? 0.2 : 0.42;
      scene.add(grid);
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(35, 35),
        new THREE.ShadowMaterial({ opacity: dark ? 0.2 : 0.09 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -1.99;
      ground.receiveShadow = true;
      scene.add(ground);

      function resize() {
        const width = host!.clientWidth;
        const height = host!.clientHeight;
        if (!width || !height) return;
        const mobile = width < 760;
        const viewHeight = mobile ? 8.5 : 8.7;
        const aspect = width / height;
        camera.left = (-viewHeight * aspect) / 2;
        camera.right = (viewHeight * aspect) / 2;
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        camera.setViewOffset(width, height, mobile ? 0 : -width * 0.23, 0, width, height);
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        renderer.render(scene, camera);
      }
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host!);
      resize();

      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      function updateMotionPreference() {
        settingsRef.current.reducedMotion = motionQuery.matches;
        if (motionQuery.matches) {
          settingsRef.current.paused = true;
          setPaused(true);
        }
      }
      updateMotionPreference();
      motionQuery.addEventListener('change', updateMotionPreference);
      let elapsed = 0;
      let previousTime = 0;
      let visible = true;
      let interacting = false;
      const startInteraction = () => {
        interacting = true;
      };
      const endInteraction = () => {
        interacting = false;
      };
      const drawControlChange = () => renderer.render(scene, camera);
      controls.addEventListener('start', startInteraction);
      controls.addEventListener('end', endInteraction);
      controls.addEventListener('change', drawControlChange);

      function render(time: number) {
        const settings = settingsRef.current;
        const delta = previousTime
          ? THREE.MathUtils.clamp((time - previousTime) / 1000, 0, 0.05)
          : 0;
        previousTime = time;
        if (!settings.paused && !settings.reducedMotion && !interacting) {
          elapsed += delta;
          root.rotation.y = -0.12 + Math.sin(elapsed * 0.26) * 0.055;
        }
        layers.forEach(({ group, base, separation }) => {
          const target = base + (settings.expanded ? separation : 0);
          group.position.y =
            settings.reducedMotion || document.visibilityState === 'hidden'
              ? target
              : THREE.MathUtils.lerp(group.position.y, target, 0.09);
        });
        packets.forEach(({ curve, packet, phase }) =>
          packet.position.copy(curve.getPoint((elapsed * 0.35 + phase) % 1)),
        );
        controls.update();
        renderer.render(scene, camera);
      }
      drawRef.current = () => render(performance.now());

      function updateVisibility() {
        previousTime = 0;
        renderer.setAnimationLoop(visible && document.visibilityState !== 'hidden' ? render : null);
      }
      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          updateVisibility();
        },
        { rootMargin: '80px' },
      );
      intersectionObserver.observe(host!);
      document.addEventListener('visibilitychange', updateVisibility);
      render(0);
      updateVisibility();
      setStatus('ready');

      dispose = () => {
        renderer.setAnimationLoop(null);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        motionQuery.removeEventListener('change', updateMotionPreference);
        document.removeEventListener('visibilitychange', updateVisibility);
        controls.dispose();
        resetRef.current = null;
        drawRef.current = null;
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => material.dispose());
          }
        });
        textures.forEach((texture) => texture.dispose());
        renderer.dispose();
      };
    }

    initialize().catch(() => {
      if (!cancelled) setStatus('fallback');
    });

    return () => {
      cancelled = true;
      dispose();
    };
  }, [resolvedTheme]);

  function togglePause() {
    settingsRef.current.paused = !paused;
    setPaused(!paused);
    drawRef.current?.();
  }

  function toggleExpanded() {
    settingsRef.current.expanded = !expanded;
    setExpanded(!expanded);
    drawRef.current?.();
  }

  return (
    <div ref={hostRef} className="architecture-scene" data-state={status}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={labels.description}
        aria-hidden={status !== 'ready'}
      />
      {status !== 'ready' && (
        <div className="architecture-poster" role="img" aria-label={labels.description}>
          <div className="poster-modules">
            <span>HTTP</span>
            <span>Realtime</span>
            <span>MCP</span>
          </div>
          <div className="poster-container">Service container</div>
          <div className="poster-kernel">Orionis</div>
          <div className="poster-engine">Granian / ASGI + RSGI</div>
          <div className="poster-services">
            <span>ORM</span>
            <span>Cache</span>
            <span>Queues</span>
          </div>
        </div>
      )}
      <div className="scene-controls">
        <button
          type="button"
          className="icon-button"
          onClick={togglePause}
          disabled={status !== 'ready'}
          aria-pressed={paused}
          aria-label={paused ? labels.play : labels.pause}
          title={paused ? labels.play : labels.pause}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={toggleExpanded}
          disabled={status !== 'ready'}
          aria-pressed={expanded}
          aria-label={expanded ? labels.collapse : labels.expand}
          title={expanded ? labels.collapse : labels.expand}
        >
          <Layers3 size={17} />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => resetRef.current?.()}
          disabled={status !== 'ready'}
          aria-label={labels.reset}
          title={labels.reset}
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
