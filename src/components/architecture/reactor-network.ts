import type * as THREE from 'three';

interface ReactorNetworkOptions {
  dark: boolean;
  fontFamily: string;
}

/** The network is a physical instrument: transport docks, service cartridges and optical links. */
export function createReactorNetwork(
  three: typeof THREE,
  { dark, fontFamily }: ReactorNetworkOptions,
): {
  group: THREE.Group;
  update: (elapsed: number, phase: number, expanded: number, reducedMotion: boolean) => void;
} {
  const group = new three.Group();
  group.name = 'Orionis optical network';
  const palette = {
    navy: '#082b52',
    primary: '#206bc4',
    ceramic: '#f6f8fb',
    metal: '#b9dfef',
    cyan: '#66d5f4',
    gold: '#f5ca37',
  };
  const shellMaterial = new three.MeshStandardMaterial({
    color: palette.navy,
    roughness: 0.42,
    metalness: 0.18,
  });
  const ceramicMaterial = new three.MeshPhysicalMaterial({
    color: palette.ceramic,
    roughness: 0.42,
    metalness: 0.12,
    clearcoat: 0.3,
    clearcoatRoughness: 0.35,
  });
  const metalMaterial = new three.MeshStandardMaterial({
    color: palette.metal,
    metalness: 0.25,
    roughness: 0.4,
  });
  const goldMaterial = new three.MeshStandardMaterial({
    color: palette.gold,
    metalness: 0.22,
    roughness: 0.4,
  });
  const nodeMaterial = new three.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  const traceMaterial = new three.LineBasicMaterial({
    color: dark ? palette.cyan : palette.primary,
    transparent: true,
    opacity: dark ? 0.48 : 0.36,
  });
  const glyphMaterial = new three.LineBasicMaterial({ color: '#ffffff', toneMapped: false });

  function panelGeometry(width: number, depth: number, height: number, corner = 0.17) {
    const shape = new three.Shape();
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    shape.moveTo(-halfWidth + corner, -halfDepth);
    shape.lineTo(halfWidth - corner, -halfDepth);
    shape.lineTo(halfWidth, -halfDepth + corner);
    shape.lineTo(halfWidth, halfDepth - corner);
    shape.lineTo(halfWidth - corner, halfDepth);
    shape.lineTo(-halfWidth + corner, halfDepth);
    shape.lineTo(-halfWidth, halfDepth - corner);
    shape.lineTo(-halfWidth, -halfDepth + corner);
    shape.closePath();
    const geometry = new three.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.035,
      bevelThickness: 0.025,
      steps: 1,
      curveSegments: 1,
    });
    geometry.translate(0, 0, -height / 2);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }

  function solid(
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    y = 0,
  ) {
    const mesh = new three.Mesh(geometry, material);
    mesh.position.y = y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function labelTexture(title: string, color: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 192;
    const context = canvas.getContext('2d')!;
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = palette.navy;
    context.font = `700 146px ${fontFamily}`;
    context.fillText(title, 512, 105, 956);
    const texture = new three.CanvasTexture(canvas);
    texture.colorSpace = three.SRGBColorSpace;
    return texture;
  }

  function plaque(parent: THREE.Object3D, title: string, color: string, width: number, z: number) {
    const mesh = new three.Mesh(
      new three.PlaneGeometry(width, width / (1024 / 192)),
      new three.MeshBasicMaterial({ map: labelTexture(title, color), toneMapped: false }),
    );
    mesh.position.set(0, 0.015, z);
    parent.add(mesh);
  }

  const matrix = new three.Matrix4();
  const transform = new three.Object3D();
  const boltGeometry = new three.CylinderGeometry(0.029, 0.029, 0.026, 8);
  const ventGeometry = new three.BoxGeometry(0.035, 0.025, 0.2);

  function fittings(parent: THREE.Object3D, width: number, depth: number, top: number) {
    const bolts = new three.InstancedMesh(boltGeometry, metalMaterial, 4);
    bolts.castShadow = true;
    let index = 0;
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        matrix.makeTranslation(x * (width / 2 - 0.2), top, z * (depth / 2 - 0.19));
        bolts.setMatrixAt(index++, matrix);
      }
    }
    parent.add(bolts);
    const vents = new three.InstancedMesh(ventGeometry, metalMaterial, 8);
    for (let vent = 0; vent < 8; vent++) {
      matrix.makeTranslation((vent - 3.5) * 0.075, top - 0.008, -depth / 2 + 0.19);
      vents.setMatrixAt(vent, matrix);
    }
    parent.add(vents);
  }

  type Glyph = 'http' | 'radio' | 'mcp' | 'database' | 'cache' | 'queue';

  function glyph(kind: Glyph) {
    const points: THREE.Vector3[] = [];
    const y = 0.274;
    function stroke(x1: number, z1: number, x2: number, z2: number) {
      points.push(new three.Vector3(x1, y, z1), new three.Vector3(x2, y, z2));
    }
    function arc(x: number, z: number, radius: number, from: number, to: number, count = 16) {
      for (let index = 0; index < count; index++) {
        const start = from + ((to - from) * index) / count;
        const end = from + ((to - from) * (index + 1)) / count;
        stroke(
          x + Math.cos(start) * radius,
          z + Math.sin(start) * radius,
          x + Math.cos(end) * radius,
          z + Math.sin(end) * radius,
        );
      }
    }
    if (kind === 'http') {
      stroke(-0.23, -0.1, 0.23, -0.1);
      stroke(0.23, -0.1, 0.1, -0.22);
      stroke(0.23, -0.1, 0.1, 0.02);
      stroke(0.23, 0.12, -0.23, 0.12);
      stroke(-0.23, 0.12, -0.1, 0);
      stroke(-0.23, 0.12, -0.1, 0.24);
    } else if (kind === 'radio') {
      arc(0, 0.16, 0.1, Math.PI * 1.15, Math.PI * 1.85);
      arc(0, 0.16, 0.22, Math.PI * 1.15, Math.PI * 1.85);
      arc(0, 0.16, 0.34, Math.PI * 1.15, Math.PI * 1.85);
      arc(0, 0.17, 0.027, 0, Math.PI * 2, 8);
    } else if (kind === 'mcp') {
      const nodes = [
        [0, -0.2],
        [-0.21, 0.16],
        [0.21, 0.16],
      ];
      stroke(0, -0.13, -0.17, 0.1);
      stroke(0, -0.13, 0.17, 0.1);
      stroke(-0.14, 0.16, 0.14, 0.16);
      nodes.forEach(([x, z]) => arc(x, z, 0.068, 0, Math.PI * 2, 10));
    } else if (kind === 'database') {
      arc(0, -0.15, 0.2, 0, Math.PI * 2);
      arc(0, 0.05, 0.2, 0, Math.PI);
      arc(0, 0.22, 0.2, 0, Math.PI);
      stroke(-0.2, -0.15, -0.2, 0.22);
      stroke(0.2, -0.15, 0.2, 0.22);
    } else if (kind === 'cache') {
      stroke(-0.17, -0.23, 0.04, -0.23);
      stroke(0.04, -0.23, -0.06, 0.02);
      stroke(-0.06, 0.02, 0.17, 0.02);
      stroke(0.17, 0.02, -0.1, 0.27);
      stroke(-0.1, 0.27, -0.04, 0.08);
      stroke(-0.04, 0.08, -0.23, 0.08);
      stroke(-0.23, 0.08, -0.17, -0.23);
    } else {
      for (let index = 0; index < 3; index++) {
        const z = (index - 1) * 0.15;
        stroke(-0.21, z, 0.21, z);
        stroke(-0.21, z - 0.04, -0.21, z + 0.04);
        stroke(0.21, z - 0.04, 0.21, z + 0.04);
      }
    }
    return new three.LineSegments(new three.BufferGeometry().setFromPoints(points), glyphMaterial);
  }

  const bodyGeometry = panelGeometry(1.73, 1.19, 0.28, 0.24);
  const rimGeometry = panelGeometry(1.8, 1.26, 0.05, 0.26);
  const topGeometry = panelGeometry(1.69, 1.15, 0.065, 0.23);
  const insetGeometry = new three.CylinderGeometry(0.41, 0.41, 0.037, 6);
  insetGeometry.rotateY(Math.PI / 6);
  const bezelGeometry = new three.CylinderGeometry(0.455, 0.455, 0.025, 6);
  bezelGeometry.rotateY(Math.PI / 6);
  const indicatorGeometry = new three.BoxGeometry(0.28, 0.025, 0.032);

  const transportDefinitions = [
    {
      title: 'HTTP',
      glyph: 'http' as const,
      position: [-2.9, 1.42, -2.25],
      color: palette.cyan,
      surface: '#e5f0fa',
    },
    {
      title: 'REALTIME',
      glyph: 'radio' as const,
      position: [0, 2.26, -3.25],
      color: palette.cyan,
      surface: palette.cyan,
    },
    {
      title: 'MCP',
      glyph: 'mcp' as const,
      position: [2.9, 1.6, -2.25],
      color: palette.gold,
      surface: palette.gold,
    },
  ];
  const serviceDefinitions = [
    {
      title: 'ORM',
      glyph: 'database' as const,
      position: [-2.6, -1.01, 2.35],
      color: palette.cyan,
      surface: '#e5f0fa',
    },
    {
      title: 'CACHE',
      glyph: 'cache' as const,
      position: [0, -1.01, 3.28],
      color: palette.gold,
      surface: '#e5f0fa',
    },
    {
      title: 'QUEUES',
      glyph: 'queue' as const,
      position: [2.6, -1.01, 2.35],
      color: palette.cyan,
      surface: '#e5f0fa',
    },
  ];

  function dock(
    definition: (typeof transportDefinitions)[number] | (typeof serviceDefinitions)[number],
    index: number,
    service: boolean,
  ) {
    const dockGroup = new three.Group();
    dockGroup.name = `${definition.title} dock`;
    dockGroup.position.set(...(definition.position as [number, number, number]));
    const indicatorMaterial = new three.MeshBasicMaterial({
      color: definition.color,
      toneMapped: false,
    });
    const surfaceMaterial = new three.MeshStandardMaterial({
      color: definition.surface,
      metalness: 0.12,
      roughness: 0.42,
    });
    solid(dockGroup, rimGeometry, metalMaterial, -0.16);
    solid(dockGroup, bodyGeometry, surfaceMaterial);
    solid(dockGroup, topGeometry, surfaceMaterial, 0.177);
    solid(dockGroup, bezelGeometry, service ? metalMaterial : goldMaterial, 0.226);
    solid(dockGroup, insetGeometry, shellMaterial, 0.245);
    dockGroup.add(glyph(definition.glyph));
    const indicator = solid(dockGroup, indicatorGeometry, indicatorMaterial, 0.226);
    indicator.position.z = 0.43;
    plaque(dockGroup, definition.title, definition.surface, 1.48, 0.67);
    fittings(dockGroup, 1.73, 1.19, 0.23);
    if (service) dockGroup.scale.setScalar(0.81);
    group.add(dockGroup);
    return { group: dockGroup, base: definition.position[1], index, service, indicatorMaterial };
  }
  const transports = transportDefinitions.map((definition, index) =>
    dock(definition, index, false),
  );
  const services = serviceDefinitions.map((definition, index) => dock(definition, index, true));

  // A discontinuous hexagonal carrier keeps the negative space around the reactor open.
  const beamGeometry = panelGeometry(3.38, 0.23, 0.095, 0.08);
  const traces: THREE.Vector3[] = [];
  const footGeometry = new three.CylinderGeometry(0.18, 0.22, 0.17, 6);
  const feet = new three.InstancedMesh(footGeometry, shellMaterial, 6);
  feet.castShadow = true;
  const contactGeometry = new three.BoxGeometry(0.15, 0.032, 0.055);
  const contacts = new three.InstancedMesh(contactGeometry, goldMaterial, 24);
  const nodes = new three.InstancedMesh(
    new three.CylinderGeometry(0.045, 0.045, 0.018, 10),
    nodeMaterial,
    6,
  );
  for (let side = 0; side < 6; side++) {
    const angle = Math.PI / 6 + (side * Math.PI) / 3;
    const nextAngle = angle + Math.PI / 3;
    const start = new three.Vector3(Math.cos(angle) * 4.4, -1.7, Math.sin(angle) * 4.4);
    const end = new three.Vector3(Math.cos(nextAngle) * 4.4, -1.7, Math.sin(nextAngle) * 4.4);
    const center = start.clone().add(end).multiplyScalar(0.5);
    const beam = solid(group, beamGeometry, ceramicMaterial);
    beam.position.copy(center);
    beam.rotation.y = -Math.atan2(end.z - start.z, end.x - start.x);
    matrix.makeTranslation(start.x * 0.96, -1.82, start.z * 0.96);
    feet.setMatrixAt(side, matrix);
    matrix.makeTranslation(start.x * 0.96, -1.6, start.z * 0.96);
    nodes.setMatrixAt(side, matrix);
    const direction = end.clone().sub(start).normalize();
    traces.push(
      start.clone().addScaledVector(direction, 0.62).setY(-1.641),
      end.clone().addScaledVector(direction, -0.62).setY(-1.641),
    );
    for (let contact = 0; contact < 4; contact++) {
      transform.position.copy(center).addScaledVector(direction, (contact - 1.5) * 0.13);
      transform.position.y = -1.63;
      transform.rotation.set(0, beam.rotation.y, 0);
      transform.updateMatrix();
      contacts.setMatrixAt(side * 4 + contact, transform.matrix);
    }
  }
  group.add(feet, contacts, nodes);
  group.add(
    new three.LineSegments(new three.BufferGeometry().setFromPoints(traces), traceMaterial),
  );

  type Conduit = {
    curve: THREE.CatmullRomCurve3;
    geometry: THREE.BufferGeometry;
    material: THREE.MeshBasicMaterial;
    dock: (typeof transports)[number];
    service: boolean;
    anchorX: number;
  };
  const conduits: Conduit[] = [];
  const segmentCount = 28;
  const radialCount = 6;
  const conduitPoint = new three.Vector3();
  const tangent = new three.Vector3();
  const normal = new three.Vector3();
  const binormal = new three.Vector3();
  const up = new three.Vector3(0, 1, 0);
  const right = new three.Vector3(1, 0, 0);

  function conduit(dock: (typeof transports)[number], service: boolean, anchorX: number) {
    const curve = new three.CatmullRomCurve3(Array.from({ length: 4 }, () => new three.Vector3()));
    const geometry = new three.BufferGeometry();
    geometry.setAttribute(
      'position',
      new three.BufferAttribute(new Float32Array((segmentCount + 1) * radialCount * 3), 3).setUsage(
        three.DynamicDrawUsage,
      ),
    );
    const indices: number[] = [];
    for (let index = 0; index < segmentCount; index++) {
      for (let radial = 0; radial < radialCount; radial++) {
        const a = index * radialCount + radial;
        const b = index * radialCount + ((radial + 1) % radialCount);
        indices.push(a, b, b + radialCount, a, b + radialCount, a + radialCount);
      }
    }
    geometry.setIndex(indices);
    const material = new three.MeshBasicMaterial({
      color: palette.cyan,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new three.Mesh(geometry, material);
    mesh.frustumCulled = false;
    group.add(mesh);
    conduits.push({ curve, geometry, material, dock, service, anchorX });
  }
  transports.forEach((item, index) => conduit(item, false, (index - 1) * 1.08));
  services.forEach((item, index) => conduit(item, true, (index - 1) * 1.08));

  function redrawConduit(item: Conduit, expanded: number) {
    const points = item.curve.points;
    const position = item.dock.group.position;
    if (item.service) {
      points[0].set(item.anchorX, -0.5 + expanded * 0.32, 1.18);
      points[1].set(item.anchorX * 1.7, -1.39, 1.73);
      points[2].set(position.x, -1.39, position.z - 0.82);
      points[3].set(position.x, position.y, position.z - 0.48);
    } else {
      points[0].set(position.x, position.y - 0.18, position.z + 0.33);
      points[1].set(position.x * 0.94, position.y - 0.8, position.z + 0.75);
      points[2].set(item.anchorX * 0.95, 0.58 + expanded * 0.7, -1.54);
      points[3].set(item.anchorX, 0.2 + expanded * 0.7, -1.12);
    }
    const positions = item.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let segment = 0; segment <= segmentCount; segment++) {
      const fraction = segment / segmentCount;
      item.curve.getPoint(fraction, conduitPoint);
      item.curve.getTangent(fraction, tangent);
      normal.crossVectors(tangent, Math.abs(tangent.y) > 0.96 ? right : up).normalize();
      binormal.crossVectors(tangent, normal).normalize();
      for (let radial = 0; radial < radialCount; radial++) {
        const angle = (radial / radialCount) * Math.PI * 2;
        const cosine = Math.cos(angle) * 0.018;
        const sine = Math.sin(angle) * 0.018;
        positions.setXYZ(
          segment * radialCount + radial,
          conduitPoint.x + normal.x * cosine + binormal.x * sine,
          conduitPoint.y + normal.y * cosine + binormal.y * sine,
          conduitPoint.z + normal.z * cosine + binormal.z * sine,
        );
      }
    }
    positions.needsUpdate = true;
  }

  const packetMaterial = new three.MeshBasicMaterial({ color: palette.cyan, toneMapped: false });
  const packets = new three.InstancedMesh(
    new three.SphereGeometry(0.048, 8, 6),
    packetMaterial,
    conduits.length * 6,
  );
  packets.instanceMatrix.setUsage(three.DynamicDrawUsage);
  packets.frustumCulled = false;
  group.add(packets);
  const nodeColor = new three.Color();

  function update(elapsed: number, phase: number, expanded: number, reducedMotion: boolean) {
    const time = reducedMotion ? 0 : elapsed;
    const response = phase === 3;
    const active = phase === 2 || response;
    for (const item of transports) {
      item.group.position.y =
        item.base + expanded * 0.16 + Math.sin(time * 0.7 + item.index * 1.7) * 0.038;
      item.indicatorMaterial.color.set(response ? palette.gold : palette.cyan);
    }
    const packetColor = response ? palette.gold : palette.cyan;
    packetMaterial.color.set(packetColor);
    packets.visible = active;
    conduits.forEach((item, index) => {
      redrawConduit(item, expanded);
      const visible = active && (!item.service || !response);
      item.material.color.set(response ? palette.gold : palette.cyan);
      item.material.opacity = visible ? 0.66 : dark ? 0.2 : 0.25;
      for (let pulse = 0; pulse < 2; pulse++) {
        for (let trail = 0; trail < 3; trail++) {
          const progress = (((time * 0.34 + pulse * 0.5 - trail * 0.026) % 1) + 1) % 1;
          item.curve.getPoint(response ? 1 - progress : progress, transform.position);
          transform.rotation.set(0, 0, 0);
          transform.scale.setScalar(visible ? 1 - trail * 0.25 : 0);
          transform.updateMatrix();
          packets.setMatrixAt(index * 6 + pulse * 3 + trail, transform.matrix);
        }
      }
    });
    packets.instanceMatrix.needsUpdate = true;
    for (let index = 0; index < 6; index++) {
      const intensity =
        phase === 4 ? 0.2 : phase < 2 ? 0.5 + 0.5 * Math.sin(time * 1.3 - index * 0.7) : 0.9;
      nodeColor.set(response ? palette.gold : palette.cyan).multiplyScalar(intensity);
      nodes.setColorAt(index, nodeColor);
    }
    if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
  }
  update(0, 0, 0, true);
  return { group, update };
}
