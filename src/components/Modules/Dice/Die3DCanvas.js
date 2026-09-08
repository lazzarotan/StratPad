"use client";

import { useEffect, useRef } from "react";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  MeshPhongMaterial,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  TetrahedronGeometry,
  BoxGeometry,
  OctahedronGeometry,
  DodecahedronGeometry,
  IcosahedronGeometry,
  PolyhedronGeometry,
  CanvasTexture,
  PlaneGeometry,
  DoubleSide,
  Quaternion,
  Euler,
} from "three";


// Dice Configuration
export const DICE_TYPES = {
  d4:  { sides: 4,  label: "D4",  color: "#16a34a", hex: 0x16a34a },
  d6:  { sides: 6,  label: "D6",  color: "#4f46e5", hex: 0x4f46e5 },
  d8:  { sides: 8,  label: "D8",  color: "#2563eb", hex: 0x2563eb },
  d10: { sides: 10, label: "D10", color: "#dc2626", hex: 0xdc2626 },
  d12: { sides: 12, label: "D12", color: "#9333ea", hex: 0x9333ea },
  d20: { sides: 20, label: "D20", color: "#d97706", hex: 0xd97706 },
};


// ── Shared WebGL renderer (single GL context for ALL dice) ──
const MAX_DPR = Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 1.5);
let sharedRenderer = null;
let sharedRendererRefCount = 0;
let sharedRendererSize = 0;

function acquireRenderer() {
  if (!sharedRenderer) {
    sharedRenderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    sharedRenderer.setPixelRatio(MAX_DPR);
    sharedRenderer.setClearColor(0x000000, 0);
    sharedRendererSize = 0;
  }
  sharedRendererRefCount++;
  return sharedRenderer;
}

function releaseRenderer() {
  sharedRendererRefCount--;
  if (sharedRendererRefCount <= 0) {
    sharedRenderer.dispose();
    sharedRenderer = null;
    sharedRendererSize = 0;
    sharedRendererRefCount = 0;
  }
}

function renderToCanvas(scene, camera, size, canvas2d) {
  if (!sharedRenderer || !canvas2d || !scene || !camera) return;
  if (sharedRendererSize !== size) {
    sharedRenderer.setSize(size, size);
    sharedRendererSize = size;
  }
  sharedRenderer.render(scene, camera);

  const pxSize = Math.round(size * MAX_DPR);
  if (canvas2d.width !== pxSize) {
    canvas2d.width = pxSize;
    canvas2d.height = pxSize;
  }
  const ctx = canvas2d.getContext("2d");
  ctx.clearRect(0, 0, pxSize, pxSize);
  ctx.drawImage(sharedRenderer.domElement, 0, 0, pxSize, pxSize);
}


// ── Module-level caches — created once per die type, never disposed ──
const geometryCache   = new Map();
const edgesCache      = new Map();
const faceFramesCache = new Map();
const textureCache    = new Map();
const planeGeoCache   = new Map();

function createDieGeometry(type) {
  switch (type) {
    case "d4":
      return new TetrahedronGeometry(1.1, 0);
    case "d6":
      return new BoxGeometry(1.3, 1.3, 1.3);
    case "d8":
      return new OctahedronGeometry(1.1, 0);
    case "d10":
      return createD10Geometry();
    case "d12":
      return new DodecahedronGeometry(1.05, 0);
    case "d20":
      return new IcosahedronGeometry(1.1, 0);
    default:
      return new BoxGeometry(1.3, 1.3, 1.3);
  }
}

function getCachedGeometry(type) {
  if (!geometryCache.has(type)) geometryCache.set(type, createDieGeometry(type));
  return geometryCache.get(type);
}

function getCachedEdges(type) {
  if (!edgesCache.has(type)) edgesCache.set(type, new EdgesGeometry(getCachedGeometry(type), 15));
  return edgesCache.get(type);
}

function getCachedFaceFrames(type) {
  if (!faceFramesCache.has(type)) {
    const facesData = getFacesData(getCachedGeometry(type));
    faceFramesCache.set(type, computeFaceFrames(facesData));
  }
  return faceFramesCache.get(type);
}

function getCachedTexture(number) {
  if (!textureCache.has(number)) textureCache.set(number, createNumberTexture(number));
  return textureCache.get(number);
}

function getCachedPlaneGeo(size) {
  if (!planeGeoCache.has(size)) planeGeoCache.set(size, new PlaneGeometry(size, size));
  return planeGeoCache.get(size);
}


// D10: Pentagonal
function createD10Geometry() {
  const radius = 1.0;

  const vertices = [
    0,  1,  0,
    0, -1,  0
  ];

  for (let i = 0; i < 10; ++i) {
    const angle = (i * Math.PI * 2) / 10;
    const yOffset = 0.105 * (i % 2 ? 1 : -1);
    vertices.push(
      Math.cos(angle),
      yOffset,
      Math.sin(angle)
    );
  }

  const faces = [
    0, 3, 2,   0, 4, 3,   0, 5, 4,   0, 6, 5,   0, 7, 6,
    0, 8, 7,   0, 9, 8,   0, 10, 9,  0, 11, 10, 0, 2, 11,
    1, 2, 3,   1, 3, 4,   1, 4, 5,   1, 5, 6,   1, 6, 7,
    1, 7, 8,   1, 8, 9,   1, 9, 10,  1, 10, 11, 1, 11, 2
  ];

  return new PolyhedronGeometry(vertices, faces, radius, 0);
}


// Number Texture — draws a number on a tiny canvas
function createNumberTexture(number) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, size, size);

  const text = String(number);
  const fontSize = text.length > 1 ? 64 : 80;

  ctx.fillStyle = "white";
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, size / 2, size / 2);

  return new CanvasTexture(canvas);
}

// EXTRACT LOGICAL FACE DATA FROM GEOMETRY
function getFacesData(geometry) {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();

  const triangles = [];
  const triCount = index ? index.count / 3 : position.count / 3;

  for (let i = 0; i < triCount; i++) {
    let ai, bi, ci;
    if (index) {
      ai = index.getX(i * 3);
      bi = index.getX(i * 3 + 1);
      ci = index.getX(i * 3 + 2);
    } else {
      ai = i * 3;
      bi = i * 3 + 1;
      ci = i * 3 + 2;
    }

    const vA = new Vector3().fromBufferAttribute(position, ai);
    const vB = new Vector3().fromBufferAttribute(position, bi);
    const vC = new Vector3().fromBufferAttribute(position, ci);

    const center = new Vector3().add(vA).add(vB).add(vC).divideScalar(3);

    const edge1 = new Vector3().subVectors(vB, vA);
    const edge2 = new Vector3().subVectors(vC, vA);
    const normal = new Vector3().crossVectors(edge1, edge2).normalize();

    triangles.push({ center, normal });
  }

  const faces = [];
  const used = new Set();
  const THRESHOLD = 0.9;

  for (let i = 0; i < triangles.length; i++) {
    if (used.has(i)) continue;

    const group = [triangles[i]];
    used.add(i);

    for (let j = i + 1; j < triangles.length; j++) {
      if (used.has(j)) continue;
      if (triangles[i].normal.dot(triangles[j].normal) > THRESHOLD) {
        group.push(triangles[j]);
        used.add(j);
      }
    }

    const faceCenter = new Vector3();
    const faceNormal = new Vector3();

    for (const tri of group) {
      faceCenter.add(tri.center);
      faceNormal.add(tri.normal);
    }

    faceCenter.divideScalar(group.length);
    faceNormal.normalize();

    faces.push({ center: faceCenter, normal: faceNormal });
  }

  return faces;
}


// Compute Face Frames
//
// The single source of truth for each face's orientation.
// Returns a labelQuat (for placing the number on the face)
// and a landingEuler (for rotating the mesh to show that face).
//
// labelQuat maps:  (0,0,1) → faceNormal,  (0,1,0) → faceUp
// landingEuler is the INVERSE — rotates the mesh so:
//    faceNormal → toward camera (+Z)
//    faceUp → screen up (+Y)
//
function computeFaceFrames(facesData) {
  const frames = [];

  for (const { center, normal } of facesData) {
    let worldUp = new Vector3(0, 1, 0);

    if (Math.abs(normal.dot(worldUp)) > 0.99) {
      worldUp = new Vector3(0, 0, -1);
    }

    const faceUp = worldUp
      .clone()
      .sub(normal.clone().multiplyScalar(normal.dot(worldUp)))
      .normalize();

    const faceRight = new Vector3().crossVectors(faceUp, normal).normalize();
    const correctedUp = new Vector3().crossVectors(normal, faceRight).normalize();

    const q1 = new Quaternion().setFromUnitVectors(
      new Vector3(0, 0, 1),
      normal
    );

    const rotatedY = new Vector3(0, 1, 0).applyQuaternion(q1);

    const cross = new Vector3().crossVectors(rotatedY, correctedUp);
    const twistAngle = Math.atan2(cross.dot(normal), rotatedY.dot(correctedUp));

    const q2 = new Quaternion().setFromAxisAngle(normal, twistAngle);

    const labelQuat = q2.multiply(q1);

    const landingQuat = labelQuat.clone().invert();
    const landingEuler = new Euler().setFromQuaternion(landingQuat);

    frames.push({
      center,
      normal,
      labelQuat: labelQuat.clone(),
      landingEuler: { x: landingEuler.x, y: landingEuler.y, z: landingEuler.z },
    });
  }

  return frames;
}


// Number labels using face frames
const LABEL_SIZES = {
  d4: 1.0,
  d6: 1.0,
  d8: 0.8,
  d10: 0.8,
  d12: 0.6,
  d20: 0.6,
};

function addFaceLabels(mesh, type, faceFrames) {
  const numFaces = DICE_TYPES[type].sides;
  const labelSize = LABEL_SIZES[type] || 0.35;

  for (let i = 0; i < Math.min(faceFrames.length, numFaces); i++) {
    const { center, normal, labelQuat } = faceFrames[i];
    const number = i + 1;

    const planeMat = new MeshBasicMaterial({
      map: getCachedTexture(number),
      transparent: true,
      side: DoubleSide,
      depthWrite: false,
    });

    const plane = new Mesh(getCachedPlaneGeo(labelSize), planeMat);

    plane.position.copy(center).addScaledVector(normal, 0.02);
    plane.quaternion.copy(labelQuat);

    mesh.add(plane);
  }
}


// LANDING MATH — snap precomputed angles near the spin target
function snapAngle(base, desired) {
  const fullRots = Math.round(base / (Math.PI * 2));
  let result = fullRots * Math.PI * 2 + desired;

  if (result - base > Math.PI) result -= Math.PI * 2;
  if (base - result > Math.PI) result += Math.PI * 2;

  return result;
}

function computeLandingAngles(faceFrames, faceIndex, afterSpinRotation) {
  if (faceIndex < 0 || faceIndex >= faceFrames.length) {
    return afterSpinRotation;
  }

  const target = faceFrames[faceIndex].landingEuler;

  return {
    x: snapAngle(afterSpinRotation.x, target.x),
    y: snapAngle(afterSpinRotation.y, target.y),
    z: snapAngle(afterSpinRotation.z, target.z),
  };
}


// THREE.js Die Renderer Component — uses shared WebGL renderer
export default function Die3DCanvas({ type, rolling, rollTrigger, finalValue, value, size = 70, color }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const materialRef = useRef(null);
  const meshRef = useRef(null);
  const frameRef = useRef(null);
  const sizeRef = useRef(size);

  // Animation state
  const targetRotation = useRef({ x: 0, y: 0, z: 0 });
  const currentRotation = useRef({ x: 0.3, y: 0.5, z: 0 });
  const isAnimating = useRef(false);
  const animFnRef = useRef(null);

  // Precomputed face frames — label quats + landing eulers
  const faceFramesRef = useRef([]);

  const config = DICE_TYPES[type];

  // Scene setup — no renderer created here, uses shared one
  useEffect(() => {
    acquireRenderer();

    const scene = new Scene();
    sceneRef.current = scene;

    const camera = new PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 4.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Lights
    scene.add(new AmbientLight(0xffffff, 0.35));
    const dirLight = new DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);
    const rimLight = new DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(-2, -1, 3);
    scene.add(rimLight);

    // Mesh — geometry and face frames are shared via cache
    const material = new MeshPhongMaterial({
      color: color ?? config.hex,
      specular: 0x444444,
      shininess: 60,
      flatShading: true,
    });
    materialRef.current = material;

    const mesh = new Mesh(getCachedGeometry(type), material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Edge lines — edges geometry is shared via cache
    const lineMat = new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });
    mesh.add(new LineSegments(getCachedEdges(type), lineMat));

    // Face frames from cache — no recomputation needed
    const faceFrames = getCachedFaceFrames(type);
    faceFramesRef.current = faceFrames;

    // Add number labels using cached textures and plane geometries
    addFaceLabels(mesh, type, faceFrames);

    // Initial tilt
    mesh.rotation.set(0.3, 0.5, 0);

    // Lazy animation loop — only runs while animating, stops when settled
    function animate() {
      if (isAnimating.current && mesh) {
        const lerp = 0.02;
        currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * lerp;
        currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * lerp;
        currentRotation.current.z += (targetRotation.current.z - currentRotation.current.z) * lerp;

        mesh.rotation.x = currentRotation.current.x;
        mesh.rotation.y = currentRotation.current.y;
        mesh.rotation.z = currentRotation.current.z;

        const dx = Math.abs(targetRotation.current.x - currentRotation.current.x);
        const dy = Math.abs(targetRotation.current.y - currentRotation.current.y);
        const dz = Math.abs(targetRotation.current.z - currentRotation.current.z);
        if (dx < 0.01 && dy < 0.01 && dz < 0.01) {
          isAnimating.current = false;
        }
      }

      renderToCanvas(scene, camera, sizeRef.current, canvasRef.current);

      if (isAnimating.current) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        frameRef.current = null;
      }
    }

    animFnRef.current = animate;

    // Render one static frame so the die is visible immediately
    renderToCanvas(scene, camera, sizeRef.current, canvasRef.current);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;

      mesh.traverse((child) => {
        // Geometries and textures are shared via cache — do NOT dispose them
        if (child.material) child.material.dispose();
      });

      releaseRenderer();
    };
  }, [type]);

  // Resize — update ref and re-render (no scene teardown)
  useEffect(() => {
    sizeRef.current = size;
    renderToCanvas(sceneRef.current, cameraRef.current, size, canvasRef.current);
  }, [size]);

  // Initial entrance spin on mount
  useEffect(() => {
    const spinsX = (0.3 + Math.random() * 0.5) * Math.PI * 2;
    const spinsY = (0.3 + Math.random() * 0.5) * Math.PI * 2;
    const spinsZ = (0.2 + Math.random() * 0.3) * Math.PI * 2;

    const afterSpin = {
      x: currentRotation.current.x + spinsX,
      y: currentRotation.current.y + spinsY,
      z: currentRotation.current.z + spinsZ,
    };

    // Land on the die's initial value face
    if (faceFramesRef.current.length > 0 && value != null) {
      targetRotation.current = computeLandingAngles(
        faceFramesRef.current,
        value - 1,
        afterSpin
      );
    } else {
      targetRotation.current = afterSpin;
    }

    isAnimating.current = true;
    if (!frameRef.current && animFnRef.current) {
      frameRef.current = requestAnimationFrame(animFnRef.current);
    }
  }, []);

  // Roll trigger — full trajectory in one shot
  useEffect(() => {
    if (rollTrigger === 0) return;
    if (finalValue == null) return;

    const faceIndex = finalValue - 1;

    const spinsX = (0.5 + Math.random() * 1.5) * Math.PI * 2;
    const spinsY = (0.5 + Math.random() * 1.5) * Math.PI * 2;
    const spinsZ = (0.25 + Math.random() * 0.75) * Math.PI * 2;
    const offsetX = (Math.random() - 0.5) * Math.PI;
    const offsetY = (Math.random() - 0.5) * Math.PI;

    const afterSpin = {
      x: targetRotation.current.x + spinsX + offsetX,
      y: targetRotation.current.y + spinsY + offsetY,
      z: targetRotation.current.z + spinsZ,
    };

    if (faceFramesRef.current.length > 0) {
      targetRotation.current = computeLandingAngles(
        faceFramesRef.current,
        faceIndex,
        afterSpin
      );
    } else {
      targetRotation.current = afterSpin;
    }

    isAnimating.current = true;
    if (!frameRef.current && animFnRef.current) {
      frameRef.current = requestAnimationFrame(animFnRef.current);
    }
  }, [rollTrigger, finalValue]);

  // Update die color when the color prop changes without rebuilding the scene
  useEffect(() => {
    if (!materialRef.current) return;
    materialRef.current.color.set(color ?? config.hex);
    renderToCanvas(sceneRef.current, cameraRef.current, sizeRef.current, canvasRef.current);
  }, [color]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        borderRadius: "8px",
      }}
    />
  );
}
