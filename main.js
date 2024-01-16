import WebGL from 'three/addons/capabilities/WebGL.js';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';

//--- COMPATIBILITY CHECK ---//
if (WebGL.isWebGLAvailable() ) {

//--- MAIN PROGRAM ---//

// set up scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
//const axes_helper = new THREE.AxesHelper( 5 );
//scene.add( axes_helper );

// set up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement );

// set up controls
//const controls = new MapControls( camera, renderer.domElement );
//controls.enableDamping = true;

// particle handles
const SPHERE_RADIUS = 0.25;
const PARTICLE_COUNT = 1000;
let particles = new Array();

function generate_random(min, max) {
  let rand = Math.random() * (max - min) + min;
  
  return rand;
}

for (let i = 0; i < PARTICLE_COUNT; i++) {
  // set up geometry
  const sphere_geometry = new THREE.SphereGeometry( SPHERE_RADIUS, 32, 16 );
  const sphere_material = new THREE.MeshBasicMaterial( { color: 0x4263f5 } );
  const sphere = new THREE.Mesh( sphere_geometry, sphere_material );
  sphere.position.x = generate_random(-9.75, 9.75);
  sphere.position.y = generate_random(-6, 6);
  sphere.position.z = generate_random(-9.75, 9.75);
  scene.add(sphere);
  let velocity = new THREE.Vector3(0, 0 , 0);
  particles[i] = {mesh: sphere, velocity: velocity};
}

const plane_geometry = new THREE.PlaneGeometry(20, 20);
const plane_material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
const plane = new THREE.Mesh( plane_geometry, plane_material );
scene.add(plane);
plane.rotateX(-90 * (Math.PI / 180));
plane.position.y = -7;

// app constants
const gravity = -3.8;
const collision_dampening = 0.70;

// app states
let clock = new THREE.Clock();

// window resize callback
function onWindowResize() {
  camera.aspect =  window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize );

function animate() {
  requestAnimationFrame( animate );

  //controls.update();

  // get delta time
  let dt = clock.getDelta() * 2;

  // update sphere position
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles[i].velocity.y += gravity * dt;
    particles[i].mesh.position.y += particles[i].velocity.y * dt;
    resolve_collisions(particles[i]);
  }

  renderer.render( scene, camera );
}

function resolve_collisions(object) {
  
  let x_bounds = 10;
  let y_bounds = plane.position.y;
  let z_bounds = 10;
  let x_position = object.mesh.position.x;
  let y_position = object.mesh.position.y;
  let z_position = object.mesh.position.z;

  if (y_position - SPHERE_RADIUS <= y_bounds) {
    object.mesh.position.y = y_position + Math.abs(y_position - SPHERE_RADIUS - y_bounds);
    object.velocity.y *= -1 * collision_dampening; 
  }

  if (x_position + SPHERE_RADIUS >= x_bounds) {
    object.mesh.position.x = x_position - Math.abs(x_position - SPHERE_RADIUS - x_bounds);
    object.velocity.x = -1 * abs(object.velocity.y) * collision_dampening;
  }

  if (x_position + SPHERE_RADIUS <= -x_bounds) {
    object.mesh.position.x = x_position + Math.abs(x_position - SPHERE_RADIUS - x_bounds);
    object.velocity.x = abs(object.velocity.y) * collision_dampening;
  }

  if (z_position + SPHERE_RADIUS >= z_bounds) {
    object.mesh.position.z = z_position - Math.abs(z_position - SPHERE_RADIUS - z_bounds);
    object.velocity.z = -1 * abs(object.velocity.y) * collision_dampening;
  }

  if (z_position + SPHERE_RADIUS <= -z_bounds) {
    object.mesh.position.z = z_position + Math.abs(z_position - SPHERE_RADIUS - z_bounds);
    object.velocity.z = abs(object.velocity.y) * collision_dampening;
  }

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
