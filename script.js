import * as d3 from "d3";

import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

let games;
let line, matLine, renderer, scene, camera, controls;

let lines = [];

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

  createLines();

  window.addEventListener("resize", onWindowResize);
  onWindowResize();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createLines() {
  // Create the X scale
  const xScale = d3.scaleLinear().domain([0, 4]).range([-5, 5]);

  // Create the Y scale
  // Find the maximum and minimum values
  let max = d3.max(games, (d) => Math.max(d.Q1, d.Q2, d.Q3, d.Q4));
  let min = d3.min(games, (d) => Math.min(d.Q1, d.Q2, d.Q3, d.Q4));

  // Adjust min and max to be symmetrical around zero if needed
  max = Math.max(Math.abs(max), Math.abs(min));
  min = -max;

  // Create the yScale with the dynamic domain
  const yScale = d3.scaleLinear().domain([min, max]).range([-2.5, 2.5]);

  // Create the Z scale
  const zScale = d3.scaleLinear().domain([0, games.length]).range([-20, 20]);

  games.forEach((game, index) => {
    const positions = [];
    const colors = [];

    // Change second argument of each Vector3 to represent point difference
    const points = [
      new THREE.Vector3(xScale(0), yScale(0), zScale(index)),
      new THREE.Vector3(xScale(1), yScale(game.Q1), zScale(index)),
      new THREE.Vector3(xScale(2), yScale(game.Q2), zScale(index)),
      new THREE.Vector3(xScale(3), yScale(game.Q3), zScale(index)),
      new THREE.Vector3(xScale(4), yScale(game.Q4), zScale(index)),
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

    lines.push(line);
  });
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

async function loadData() {
  games = await d3.json("data/season-2022-2023.json");

  init();
  animate();
}

loadData();
