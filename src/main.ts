import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import waterVertexShader from "./shaders/water/vertex.glsl?raw";
import waterFragmentShader from "./shaders/water/fragment.glsl?raw";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {
  depthColor: "#1b1b89",
  surfaceColor: "#4fadfc",
};

// Canvas
const canvas: HTMLCanvasElement | null = document.querySelector("canvas.webgl");

if (!canvas) {
  throw new Error("Canvas not found");
}

// Scene
const scene = new THREE.Scene();

/**
 * Update all materials
 */

const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial &&
      child.name !== "Water"
    ) {
      //child.material.envMap = environmentMapTexture;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
      console.log(child);
    }
    if (child instanceof THREE.Mesh && child.name === "Water") {
      child.material.transparent = true;
      child.material.opacity = 0.5;
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Models
 */
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer: any = null;
gltfLoader.load("models/lowPolyIslandWithoutWater.glb", (gltf) => {
  gltf.scene.scale.set(1, 1, 1);

  scene.add(gltf.scene);
  updateAllMaterials();
});

/**
 * Water
 */
const waterGeometry = new THREE.PlaneGeometry(10, 10, 32, 32);
const waterMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },
    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 4 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallWavesIterations: { value: 4 },

    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.66 },
    uColorMultiplier: { value: 2.5 },
  },
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  transparent: true,
  side: THREE.DoubleSide,
});
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI * 0.5;
water.position.y = 0.01;
water.name = "Water";
scene.add(water);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.position.set(5, 5, 5);
directionalLight.shadow.bias = -0.01;
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x99ccff, 1);

// Debug
gui
  .add(waterMaterial.uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("bigWavesElevation");

gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(10)
  .step(0.001)
  .name("BigWavesFrequencyX");

gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("BigWavesFrequencyY");

gui
  .add(waterMaterial.uniforms.uBigWavesSpeed, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("BigWavesSpeed");

gui
  .add(waterMaterial.uniforms.uSmallWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("smallWavesElevation");

gui
  .add(waterMaterial.uniforms.uSmallWavesFrequency, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("smallWavesFrequency");

gui
  .add(waterMaterial.uniforms.uSmallWavesSpeed, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("smallWavesSpeed");

gui
  .add(waterMaterial.uniforms.uSmallWavesIterations, "value")
  .min(0)
  .max(10)
  .step(1)
  .name("smallWavesIterations");

gui.addColor(debugObject, "surfaceColor").onChange(() => {
  waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
});

gui
  .add(waterMaterial.uniforms.uColorOffset, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("colorOffset");

gui
  .add(waterMaterial.uniforms.uColorMultiplier, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("colorMultiplier");

gui
  .add(renderer, "toneMapping", {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  })
  .onChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping);
    updateAllMaterials();
  });

gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);
/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Update water
  waterMaterial.uniforms.uTime.value = elapsedTime;

  // Update Mixer
  if (mixer) {
    mixer.update(deltaTime);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
