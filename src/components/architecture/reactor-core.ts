import type * as THREE from 'three';

interface ReactorCoreOptions {
  dark: boolean;
  fontFamily: string;
}

/** A machined, open-core instrument built entirely from geometry and canvas lettering. */
export function createReactorCore(three: typeof THREE, options: ReactorCoreOptions) {
  const { dark, fontFamily } = options;
  const group = new three.Group();
  const navy = new three.MeshStandardMaterial({
    color: '#082b52',
    metalness: 0.18,
    roughness: 0.42,
  });
  const primary = new three.MeshStandardMaterial({
    color: '#206bc4',
    metalness: 0.15,
    roughness: 0.42,
  });
  const container = new three.MeshStandardMaterial({
    color: '#66d5f4',
    metalness: 0.12,
    roughness: 0.4,
  });
  const metal = new three.MeshStandardMaterial({
    color: '#b9dfef',
    metalness: 0.25,
    roughness: 0.4,
  });
  const ceramic = new three.MeshPhysicalMaterial({
    color: '#f6f8fb',
    metalness: 0.12,
    roughness: 0.4,
    clearcoat: 0.3,
    clearcoatRoughness: 0.35,
  });
  const gold = new three.MeshStandardMaterial({
    color: '#f5ca37',
    metalness: 0.22,
    roughness: 0.4,
  });
  const recess = new three.MeshStandardMaterial({
    color: '#082b52',
    metalness: 0.12,
    roughness: 0.55,
  });
  const cyan = new three.MeshBasicMaterial({ color: '#66d5f4', toneMapped: false });
  const goldLight = new three.MeshBasicMaterial({ color: '#f5ca37', toneMapped: false });
  const traces = new three.LineBasicMaterial({
    color: '#206bc4',
    transparent: true,
    opacity: dark ? 0.5 : 0.65,
  });
  const dummy = new three.Object3D();

  function hexGeometry(radius: number, height: number, bevel = 0.035) {
    const shape = new three.Shape();
    for (let index = 0; index < 6; index++) {
      const angle = (index * Math.PI) / 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (index === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    const geometry = new three.ExtrudeGeometry(shape, {
      depth: height - bevel * 2,
      bevelEnabled: true,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 3,
      curveSegments: 1,
      steps: 1,
    });
    geometry.translate(0, 0, -(height - bevel * 2) / 2);
    geometry.rotateX(Math.PI / 2);
    return geometry;
  }

  function mesh(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Object3D,
    x = 0,
    y = 0,
    z = 0,
  ) {
    const object = new three.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  function hexOutline(radius: number, y: number, parent: THREE.Object3D) {
    const points = Array.from({ length: 6 }, (_, index) => {
      const angle = (index * Math.PI) / 3;
      return new three.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    });
    parent.add(new three.LineLoop(new three.BufferGeometry().setFromPoints(points), traces));
  }

  function arc(
    radius: number,
    tube: number,
    material: THREE.Material,
    parent: THREE.Object3D,
    start = 0,
    length = Math.PI * 2,
  ) {
    const object = mesh(new three.TorusGeometry(radius, tube, 6, 72, length), material, parent);
    object.rotation.x = Math.PI / 2;
    object.rotation.z = start;
    return object;
  }

  function plaque(
    title: string,
    parent: THREE.Object3D,
    depth: number,
    color: string,
    ink: string,
  ) {
    const bitmap = document.createElement('canvas');
    bitmap.width = 1536;
    bitmap.height = 256;
    const context = bitmap.getContext('2d')!;
    context.fillStyle = color;
    context.fillRect(0, 0, bitmap.width, bitmap.height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = ink;
    context.font = `700 190px ${fontFamily}`;
    context.fillText(title, 768, 139, 1420);
    const texture = new three.CanvasTexture(bitmap);
    texture.colorSpace = three.SRGBColorSpace;
    const label = mesh(
      new three.PlaneGeometry(1.8, 0.3),
      new three.MeshBasicMaterial({ map: texture, toneMapped: false }),
      parent,
      0,
      0,
      depth + 0.045,
    );
    label.castShadow = false;
  }

  const cartridges = [
    {
      title: 'GRANIAN',
      radius: 1.88,
      height: 0.3,
      y: -1.12,
      lift: 0,
      body: navy,
      color: '#082b52',
      ink: '#ffffff',
      active: [1, 4],
    },
    {
      title: 'ORIONIS',
      radius: 1.72,
      height: 0.36,
      y: -0.55,
      lift: 0.32,
      body: primary,
      color: '#206bc4',
      ink: '#ffffff',
      active: [1, 2, 3],
    },
    {
      title: 'CONTAINER',
      radius: 1.58,
      height: 0.23,
      y: -0.02,
      lift: 0.68,
      body: container,
      color: '#66d5f4',
      ink: '#082b52',
      active: [0, 1, 2],
    },
  ].map((definition, layerIndex) => {
    const cartridge = new three.Group();
    cartridge.name = definition.title;
    group.add(cartridge);
    cartridge.position.y = definition.y;
    mesh(hexGeometry(definition.radius, definition.height), definition.body, cartridge);
    mesh(
      hexGeometry(definition.radius - 0.07, 0.035, 0.012),
      definition.body,
      cartridge,
      0,
      definition.height / 2 + 0.015,
    );
    mesh(
      hexGeometry(definition.radius + 0.005, 0.04, 0.012),
      metal,
      cartridge,
      0,
      -definition.height / 2 + 0.015,
    );
    hexOutline(definition.radius - 0.12, definition.height / 2 + 0.036, cartridge);
    hexOutline(definition.radius - 0.24, definition.height / 2 + 0.037, cartridge);

    const seamMaterial = new three.MeshBasicMaterial({ color: '#66d5f4', toneMapped: false });
    const seams = new three.InstancedMesh(
      new three.BoxGeometry(0.7, 0.024, 0.014),
      seamMaterial,
      12,
    );
    for (let side = 0; side < 6; side++) {
      const angle = Math.PI / 6 + (side * Math.PI) / 3;
      for (let segment = 0; segment < 2; segment++) {
        const tangent = (segment - 0.5) * 0.79;
        const radius = definition.radius * Math.cos(Math.PI / 6) + 0.018;
        dummy.position.set(
          Math.cos(angle) * radius - Math.sin(angle) * tangent,
          -definition.height / 2 + 0.073,
          Math.sin(angle) * radius + Math.cos(angle) * tangent,
        );
        dummy.rotation.set(0, Math.PI / 2 - angle, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        seams.setMatrixAt(side * 2 + segment, dummy.matrix);
      }
    }
    cartridge.add(seams);

    const screws = new three.InstancedMesh(
      new three.CylinderGeometry(0.047, 0.047, 0.025, 10),
      metal,
      6,
    );
    const screwSlots = new three.InstancedMesh(
      new three.BoxGeometry(0.05, 0.003, 0.012),
      recess,
      6,
    );
    for (let corner = 0; corner < 6; corner++) {
      const angle = (corner * Math.PI) / 3;
      const radius = definition.radius - 0.15;
      dummy.position.set(
        Math.cos(angle) * radius,
        definition.height / 2 + 0.045,
        Math.sin(angle) * radius,
      );
      dummy.rotation.set(0, angle, 0);
      dummy.updateMatrix();
      screws.setMatrixAt(corner, dummy.matrix);
      dummy.position.y += 0.014;
      dummy.updateMatrix();
      screwSlots.setMatrixAt(corner, dummy.matrix);
    }
    cartridge.add(screws, screwSlots);

    // Repeated milled vents and contact pads share just two draw calls per cartridge.
    const vents = new three.InstancedMesh(new three.BoxGeometry(0.15, 0.085, 0.025), recess, 36);
    const contacts = new three.InstancedMesh(new three.BoxGeometry(0.055, 0.014, 0.12), gold, 24);
    const circuitPoints: THREE.Vector3[] = [];
    for (let side = 0; side < 6; side++) {
      const angle = Math.PI / 6 + (side * Math.PI) / 3;
      const normal = new three.Vector3(Math.cos(angle), 0, Math.sin(angle));
      const tangent = new three.Vector3(-Math.sin(angle), 0, Math.cos(angle));
      const edgeRadius = definition.radius * Math.cos(Math.PI / 6);
      for (let index = 0; index < 6; index++) {
        const point = normal
          .clone()
          .multiplyScalar(edgeRadius + 0.018)
          .addScaledVector(tangent, (index - 2.5) * 0.21);
        dummy.position.copy(point);
        dummy.rotation.set(0, Math.PI / 2 - angle, 0);
        dummy.updateMatrix();
        vents.setMatrixAt(side * 6 + index, dummy.matrix);
      }
      for (let index = 0; index < 4; index++) {
        const point = normal
          .clone()
          .multiplyScalar(edgeRadius - 0.25)
          .addScaledVector(tangent, (index - 1.5) * 0.13);
        dummy.position.set(point.x, definition.height / 2 + 0.04, point.z);
        dummy.rotation.set(0, -angle + Math.PI / 2, 0);
        dummy.updateMatrix();
        contacts.setMatrixAt(side * 4 + index, dummy.matrix);
        const outer = point.clone().setY(definition.height / 2 + 0.044);
        const inner = outer.clone().addScaledVector(normal, -0.26 - index * 0.025);
        const elbow = inner.clone().addScaledVector(tangent, 0.08);
        const terminal = elbow.clone().addScaledVector(normal, -0.14);
        circuitPoints.push(outer, inner, inner, elbow, elbow, terminal);
      }
    }
    cartridge.add(vents, contacts);
    cartridge.add(
      new three.LineSegments(new three.BufferGeometry().setFromPoints(circuitPoints), traces),
    );
    plaque(
      definition.title,
      cartridge,
      definition.radius * Math.cos(Math.PI / 6),
      definition.color,
      definition.ink,
    );
    return { group: cartridge, definition, seamMaterial, layerIndex };
  });

  // Three exposed load-bearing columns reveal the layered construction.
  const columns = new three.InstancedMesh(
    new three.CylinderGeometry(0.055, 0.055, 0.9, 12),
    metal,
    3,
  );
  for (let index = 0; index < 3; index++) {
    const angle = -Math.PI / 6 + (index * Math.PI * 2) / 3;
    dummy.position.set(Math.cos(angle) * 1.23, -0.6, Math.sin(angle) * 1.23);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    columns.setMatrixAt(index, dummy.matrix);
  }
  group.add(columns);

  const chamber = new three.Group();
  chamber.position.y = 0.2;
  group.add(chamber);
  mesh(new three.CylinderGeometry(0.91, 0.98, 0.1, 48), metal, chamber, 0, 0.01);
  mesh(new three.CylinderGeometry(0.74, 0.74, 0.06, 48), recess, chamber, 0, 0.09);
  const emitter = arc(0.76, 0.025, cyan, chamber);
  emitter.position.y = 0.14;
  const outerEmitter = arc(0.96, 0.012, goldLight, chamber);
  outerEmitter.position.y = 0.07;

  const chamberGlass = new three.MeshPhysicalMaterial({
    color: '#66d5f4',
    transparent: true,
    opacity: dark ? 0.06 : 0.09,
    metalness: 0.1,
    roughness: 0.12,
    clearcoat: 1,
    depthWrite: false,
    side: three.DoubleSide,
  });
  const glass = mesh(
    new three.CylinderGeometry(0.92, 0.92, 1.2, 48, 1, true),
    chamberGlass,
    chamber,
    0,
    0.79,
  );
  glass.castShadow = false;
  glass.receiveShadow = false;

  const guardPoints: THREE.Vector3[] = [];
  for (let index = 0; index < 3; index++) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 3;
    const at = (radius: number, y: number) =>
      new three.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    const curve = new three.CatmullRomCurve3([
      at(1.11, 0.07),
      at(1.19, 0.4),
      at(1.11, 1.25),
      at(0.87, 1.62),
    ]);
    mesh(new three.TubeGeometry(curve, 28, 0.032, 8, false), metal, chamber);
    guardPoints.push(at(1.11, 0.11), at(1.16, 0.34));
  }
  chamber.add(
    new three.LineSegments(
      new three.BufferGeometry().setFromPoints(guardPoints),
      new three.LineBasicMaterial({ color: '#f5ca37' }),
    ),
  );

  const starGroup = new three.Group();
  starGroup.position.y = 0.82;
  chamber.add(starGroup);
  const starShape = new three.Shape();
  for (let index = 0; index < 8; index++) {
    const angle = Math.PI / 2 + (index * Math.PI) / 4;
    const radius = index % 2 === 0 ? (index % 4 === 0 ? 0.65 : 0.56) : 0.17;
    if (index === 0) starShape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    else starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  starShape.closePath();
  const starGeometry = new three.ExtrudeGeometry(starShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.055,
    bevelSize: 0.04,
    bevelSegments: 2,
    curveSegments: 1,
    steps: 1,
  });
  starGeometry.translate(0, 0, -0.05);
  const starMaterial = new three.MeshStandardMaterial({
    color: '#f5ca37',
    metalness: 0.22,
    roughness: 0.38,
    emissive: '#f5ca37',
    emissiveIntensity: 0.12,
  });
  mesh(starGeometry, starMaterial, starGroup);
  mesh(new three.OctahedronGeometry(0.13, 0), ceramic, starGroup, 0, 0, 0.06);

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 128;
  const glowContext = glowCanvas.getContext('2d')!;
  const glowGradient = glowContext.createRadialGradient(64, 64, 2, 64, 64, 64);
  glowGradient.addColorStop(0, '#f5ca37aa');
  glowGradient.addColorStop(0.25, '#f5ca3744');
  glowGradient.addColorStop(1, '#f5ca3700');
  glowContext.fillStyle = glowGradient;
  glowContext.fillRect(0, 0, 128, 128);
  const glowTexture = new three.CanvasTexture(glowCanvas);
  const glowMaterial = new three.MeshBasicMaterial({
    map: glowTexture,
    transparent: true,
    opacity: dark ? 0.65 : 0.35,
    blending: three.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const glow = mesh(new three.PlaneGeometry(2.1, 2.1), glowMaterial, starGroup, 0, 0, -0.1);
  glow.castShadow = false;
  glow.receiveShadow = false;

  const gyro = new three.Group();
  gyro.position.y = 0.82;
  chamber.add(gyro);
  const gyroMaterial = new three.MeshBasicMaterial({ color: '#66d5f4', toneMapped: false });
  const gyroGold = new three.MeshBasicMaterial({ color: '#f5ca37', toneMapped: false });
  const firstRing = new three.Group();
  const secondRing = new three.Group();
  const thirdRing = new three.Group();
  gyro.add(firstRing, secondRing, thirdRing);
  const firstArc = arc(1.02, 0.017, gyroMaterial, firstRing, 0.12, Math.PI * 1.65);
  firstArc.rotation.x = 0;
  const firstCounterArc = arc(1.02, 0.017, metal, firstRing, 0, Math.PI * 0.22);
  firstCounterArc.rotation.x = 0;
  firstCounterArc.rotation.z = Math.PI * 1.74;
  const secondArc = arc(1.12, 0.012, gyroGold, secondRing, 0, Math.PI * 1.9);
  secondArc.rotation.x = 0;
  const thirdArc = arc(0.89, 0.012, metal, thirdRing, 0, Math.PI * 1.7);
  thirdArc.rotation.x = 0;
  const gyroNode = mesh(new three.SphereGeometry(0.045, 10, 8), goldLight, firstRing, 1.02, 0, 0);
  gyroNode.castShadow = false;

  // Vertical capacitive details stay fine enough to leave the crystal readable.
  const pins = new three.InstancedMesh(new three.CylinderGeometry(0.012, 0.012, 0.18, 6), gold, 18);
  for (let index = 0; index < 18; index++) {
    const angle = (index * Math.PI * 2) / 18;
    dummy.position.set(Math.cos(angle) * 0.83, 0.2, Math.sin(angle) * 0.83);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    pins.setMatrixAt(index, dummy.matrix);
  }
  chamber.add(pins);

  const feet = new three.InstancedMesh(new three.CylinderGeometry(0.16, 0.19, 0.15, 12), navy, 3);
  for (let index = 0; index < 3; index++) {
    const angle = Math.PI / 6 + (index * Math.PI * 2) / 3;
    dummy.position.set(Math.cos(angle) * 1.35, -1.34, Math.sin(angle) * 1.35);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    feet.setMatrixAt(index, dummy.matrix);
  }
  group.add(feet);

  function update(elapsed: number, phase: number, expanded: number, reducedMotion: boolean) {
    const time = reducedMotion ? 0 : elapsed;
    const live = phase !== 4;
    const pulse = live ? 0.85 + Math.sin(time * 2.1) * 0.15 : 0.16;
    cartridges.forEach(({ group: cartridge, definition, seamMaterial }) => {
      cartridge.position.y = definition.y + definition.lift * expanded;
      const active = definition.active.includes(phase);
      seamMaterial.color.set(phase === 3 ? '#f5ca37' : '#66d5f4');
      seamMaterial.color.multiplyScalar(active ? pulse : live ? 0.38 : 0.13);
    });
    chamber.position.y = 0.2 + expanded * 0.68;
    starGroup.rotation.set(
      Math.sin(time * 0.31) * 0.08,
      0.45 + Math.sin(time * 0.23) * 0.32,
      -0.09,
    );
    starGroup.position.y = 0.82 + Math.sin(time * 0.9) * 0.045;
    firstRing.rotation.set(0.28, time * 0.19 + 0.1, 0.38);
    secondRing.rotation.set(1.18, -time * 0.14 + 0.45, -0.3);
    thirdRing.rotation.set(0.7, time * 0.1 - 0.6, 0.62);
    gyroMaterial.color.set(phase === 3 ? '#f5ca37' : '#66d5f4').multiplyScalar(live ? 1 : 0.25);
    starMaterial.emissiveIntensity = live ? 0.08 + pulse * 0.12 : 0.025;
    glowMaterial.opacity = live ? (dark ? 0.65 : 0.35) * pulse : 0.04;
    cyan.color.set('#66d5f4').multiplyScalar(live ? pulse : 0.16);
    goldLight.color.set('#f5ca37').multiplyScalar(live ? 1 : 0.3);
  }

  update(0, 0, 0, false);
  return { group, update };
}
