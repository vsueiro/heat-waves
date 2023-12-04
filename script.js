import * as d3 from "d3";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

let line, matLine, renderer, scene, camera, controls;

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.set(-40, 0, 60);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 10;
  controls.maxDistance = 500;

  // Position and THREE.Color Data

  const positions = [];
  const colors = [];

  // Change second argument of each Vector3 to represent point difference
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1, 0.25, 0),
    new THREE.Vector3(2, -0.5, 0),
    new THREE.Vector3(3, -0.25, 0),
    new THREE.Vector3(4, 0.5, 0),
  ];

  const spline = new THREE.CatmullRomCurve3(points);
  const divisions = Math.round(32 * points.length);
  const point = new THREE.Vector3();
  const color = new THREE.Color();

  for (let i = 0, l = divisions; i < l; i++) {
    const t = i / l;

    spline.getPoint(t, point);
    positions.push(point.x, point.y, point.z);

    // Dark gray for EmoJimmy
    color.set(0x222222);

    if (point.y > 0) {
      // Red if winning
      color.set(0xff2222);
    }

    colors.push(color.r, color.g, color.b);
  }

  // Line2 ( LineGeometry, LineMaterial )

  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  geometry.setColors(colors);

  matLine = new LineMaterial({
    color: 0xffffff,
    worldUnits: true,
    linewidth: 0.1, // in world units with size attenuation, pixels otherwise
    vertexColors: true,
  });

  line = new Line2(geometry, matLine);
  line.computeLineDistances();
  line.scale.set(1, 1, 1);
  scene.add(line);

  window.addEventListener("resize", onWindowResize);
  onWindowResize();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  // main scene

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  controls.update();

  // renderer will set this eventually
  matLine.resolution.set(window.innerWidth, window.innerHeight); // resolution of the viewport

  renderer.render(scene, camera);

  renderer.setScissorTest(false);
}

init();
animate();
