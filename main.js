import WebGL from 'three/addons/capabilities/WebGL.js';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import{ GUI } from 'dat.gui'

//--- COMPATIBILITY CHECK ---//
if (WebGL.isWebGLAvailable() ) {

//--- MAIN PROGRAM ---//

// app constants
const collision_dampening = 0;
const air_dampening = 1;
let properties = {
  gravity: 0,
  speed: 0.5
}


// set up scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;
//const axes_helper = new THREE.AxesHelper( 5 );
//scene.add( axes_helper );

// set up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement );

// set up controls
const controls = new MapControls( camera, renderer.domElement );
controls.enableDamping = true;

// set up GUI
const gui = new GUI();
const properties_folder = gui.addFolder('Properties');
properties_folder.add(properties, 'speed', 0, 3);
properties_folder.add(properties, 'gravity', -10, 10);
properties_folder.open();

// particle handles
const SPHERE_RADIUS = 0.75;
const PARTICLE_COUNT = 30;
let range = 10;

function generate_random(min, max) {
  let rand = Math.random() * (max - min) + min;
  
  return rand;
}

let particles = new Array();

for (let i = 0; i < PARTICLE_COUNT; i++) {
  // set up geometry
  const sphere_geometry = new THREE.SphereGeometry( SPHERE_RADIUS, 32, 16 );
  const sphere_material = new THREE.MeshBasicMaterial();
  sphere_material.color = new THREE.Color().setHSL(generate_random(0,1), 1, .5)
  const sphere = new THREE.Mesh( sphere_geometry, sphere_material );
  sphere.position.x = generate_random(-9.50, 9.50);
  sphere.position.y = generate_random(-9.50, 9.50);
  sphere.position.z = generate_random(-9.50, 9.50);
  scene.add(sphere);
  let velocity = new THREE.Vector3();
  velocity.x = generate_random(0,.25);
  velocity.y = generate_random(0,.25);
  velocity.z = generate_random(0,.25);
  particles[i] = {mesh: sphere, v: velocity};
}

let box = new THREE.BoxGeometry(20, 20, 20);
let box_mesh = new THREE.Line( box );
scene.add( new THREE.BoxHelper (box_mesh, 'white') );

// app states
let clock = new THREE.Clock();

// window resize callback
function onWindowResize() {
  camera.aspect =  window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize );

let distance = new THREE.Vector3();
let normal = new THREE.Vector3();
let relative_v = new THREE.Vector3();
let dot = new THREE.Vector3();
let movement = new THREE.Vector3();

function animate() {
  requestAnimationFrame( animate );

  controls.update();

  // get delta time
  let dt = clock.getDelta() * 2;

  // update sphere position
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    
    let p1 = particles[i];

    // if the balls hit a wall, their velocities are reversed
    if (p1.mesh.position.x + SPHERE_RADIUS > range || p1.mesh.position.x - SPHERE_RADIUS < -range) p1.v.x *= -1;
    if (p1.mesh.position.y + SPHERE_RADIUS > range || p1.mesh.position.y - SPHERE_RADIUS < -range) p1.v.y *= -1;
    if (p1.mesh.position.z + SPHERE_RADIUS > range || p1.mesh.position.z - SPHERE_RADIUS < -range) p1.v.z *= -1;

    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      let p2 = particles[j];

      distance.copy(p1.mesh.position).add(p1.v).sub(p2.mesh.position).sub(p2.v);

      if (distance.length() < 2 * SPHERE_RADIUS) {
 
        normal.copy(p1.mesh.position).sub(p2.mesh.position).normalize();

        relative_v.copy( p1.v ).sub( p2.v );
        dot = relative_v.dot( normal );

        normal = normal.multiplyScalar( dot );

        p1.v.sub( normal );
        p2.v.add( normal );
      }
    }

    p1.v.y += properties.gravity * dt;
    movement.copy(p1.v).multiplyScalar(properties.speed);
    p1.mesh.position.add(movement);
  }

  renderer.render( scene, camera );
}

function main() {
  renderer.render( scene, camera );
  animate();
}


main();


}
else {

  const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
} //--- END CHECK ---//
