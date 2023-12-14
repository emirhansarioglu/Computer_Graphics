// external dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// local from us provided utilities
import type * as utils from './lib/utils';
import RenderWidget from './lib/rendererWidget';
import { Application, createWindow } from './lib/window';

// helper lib, provides exercise dependent prewritten Code
import * as helper from './helper';

    

/*******************************************************************************
 * Main entrypoint.
 ******************************************************************************/

var settings: helper.Settings;

function main(){
  var root = Application("Camera");
  root.setLayout([["world", "canonical", "screen"]]);
  root.setLayoutColumns(["1fr", "1fr", "1fr"]);
  root.setLayoutRows(["100%"]);

  // ---------------------------------------------------------------------------
  // create Settings and create GUI settings
  settings = new helper.Settings();
  helper.createGUI(settings)
  settings.addCallback(callback);

  var screenDiv = createWindow("screen");
  root.appendChild(screenDiv);

  // create RenderDiv
  var worldDiv = createWindow("world");
  root.appendChild(worldDiv);

  // create canonicalDiv
  var canonicalDiv = createWindow("canonical");
  root.appendChild(canonicalDiv);

  //Creating a white scene with the teddy bear
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  var bear = helper.createTeddyBear();
  scene.add(bear);
  
  // rendering the scene with screen camera
  var screen_camera = new THREE.PerspectiveCamera();
  helper.setupCamera(screen_camera, scene, 1, 5, 40);
  var screen_camhelper = new THREE.CameraHelper(screen_camera);
  scene.add(screen_camhelper);
  // create controls
  var screen_controls = new OrbitControls(screen_camera, screenDiv);
  helper.setupControls(screen_controls);
  // rendering
  var screen_renderer = new THREE.WebGLRenderer();
  var screen_wid = new RenderWidget(screenDiv, screen_renderer, screen_camera, scene, screen_controls);
  screen_wid.animate();

  // rendering the scene with world camera
  var world_camera = new THREE.PerspectiveCamera();
  helper.setupCamera(world_camera, scene, 1, 1000, 40);
  // create controls
  var world_controls = new OrbitControls(world_camera, worldDiv);
  helper.setupControls(world_controls);
  // rendering
  var world_renderer = new THREE.WebGLRenderer();
  var world_wid = new RenderWidget(worldDiv, world_renderer, world_camera, scene, world_controls);
  world_wid.animate();
  
  // orthographic camera
  var mid_scene = new THREE.Scene();
  mid_scene.background = new THREE.Color(0xffffff);
  helper.setupCube(mid_scene);
  var canon_cam = helper.createCanonicalCamera();
  //orbitcontrols
  var canon_control = new OrbitControls(canon_cam, canonicalDiv);
  helper.setupControls(canon_control);


  // MUST COPY THE ORIGINAL BEAR HERE !!!
  function deepCloneObject(originalObject: THREE.Object3D): THREE.Object3D {
    const clonedObject = originalObject.clone(false) as THREE.Object3D; // parameter false is important!
    // Deep clone children recursively
    originalObject.children.forEach(child => {
      const clonedChild = deepCloneObject(child);
      clonedObject.add(clonedChild);
    });

    if (originalObject instanceof THREE.Mesh) {
      // Clone geometry and material for meshes
      if (originalObject.geometry !== undefined) {
        (clonedObject as THREE.Mesh).geometry = originalObject.geometry.clone() as THREE.BufferGeometry;
        if (originalObject.geometry instanceof THREE.BufferGeometry) {
          const originalPositions = originalObject.geometry.getAttribute('position');
          if (originalPositions !== undefined) {
            const clonedPositions = originalPositions.clone() as THREE.BufferAttribute;
            (clonedObject as THREE.Mesh).geometry.setAttribute('position', clonedPositions);
          }
        }
      }
      if (originalObject.material !== undefined ) {
        (clonedObject as THREE.Mesh).material = originalObject.material.clone();
      }
      clonedObject.position.copy(originalObject.position);
      clonedObject.rotation.copy(originalObject.rotation);
      clonedObject.scale.copy(originalObject.scale);
    }
    return clonedObject;
  }
  
  var new_bear = helper.createTeddyBear();
  mid_scene.add(new_bear);
  
  
  // function for vector matrix multiplication with homogeneous coordinates
  function vecmatrmult(matrix: THREE.Matrix4, vector: THREE.Vector4): THREE.Vector4 {
    const x = vector.x;
    const y = vector.y;
    const z = vector.z;
    const w = vector.w;

    const e = matrix.elements;
    const newX = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
    const newY = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
    const newZ = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
    const newW = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

    return new THREE.Vector4(newX, newY, newZ, newW);
  }
  function canon_pipeline(mesh: THREE.Object3D){
    mesh.matrixAutoUpdate = false;
    if(mesh instanceof THREE.Mesh){
      var geo: THREE.BufferGeometry
      geo = mesh.geometry as THREE.BufferGeometry;
      var positions = geo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < positions.count; i++) {
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positions, i); // Get vertex position
        const vec = new THREE.Vector4(vertex.x, vertex.y, vertex.z, 1);
        const vec2 = vecmatrmult(mesh.matrixWorld, vec);
        const vec3 = vecmatrmult(screen_camera.matrixWorldInverse, vec2);
        const vec4 = vecmatrmult(screen_camera.projectionMatrix, vec3);
        vec4.divideScalar(vec4.w);
        positions.setXYZ(i, vec4.x, vec4.y, -vec4.z); // Set new vertex position back
        positions.needsUpdate = true; 
      }
    }
    mesh.matrix.copy(new THREE.Matrix4());
  }
  new_bear.traverse(canon_pipeline);
  // rendering
  var canonical_renderer = new THREE.WebGLRenderer();
  var canon_wid = new RenderWidget(canonicalDiv, canonical_renderer, canon_cam, mid_scene, canon_control);
  canon_wid.animate();

  const clippingPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), 1),
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1),
    new THREE.Plane(new THREE.Vector3(0, 1, 0), 1),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), 1),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), 1),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), 1),
  ];
  canonical_renderer.clippingPlanes = clippingPlanes;

  
  function callback(changed: utils.KeyValuePair<helper.Settings>){
    switch (changed.key) {
      case "rotateX":
        bear.rotation.x = changed.value;
        mid_scene.remove(new_bear);
        bear.updateMatrix();
        bear.updateMatrixWorld(true);
        var bear2 = deepCloneObject(bear);
        mid_scene.add(bear2);
        bear2.traverse(canon_pipeline);
        bear2.updateMatrixWorld(true);
        new_bear = bear2;
        break;
      case 'rotateY':
        bear.rotation.y = changed.value;
        mid_scene.remove(new_bear);
        bear.updateMatrix();
        bear.updateMatrixWorld(true);
        var bear2 = deepCloneObject(bear);
        mid_scene.add(bear2);
        bear2.traverse(canon_pipeline);
        bear2.updateMatrixWorld(true);
        new_bear = bear2;
        break;
      case "rotateZ":
        bear.rotation.z = changed.value;
        mid_scene.remove(new_bear);
        bear.updateMatrix();
        bear.updateMatrixWorld(true);
        var bear2 = deepCloneObject(bear);
        mid_scene.add(bear2);
        bear2.traverse(canon_pipeline);
        bear2.updateMatrixWorld(true);
        new_bear = bear2;
        break;
      case "translateX":
        bear.position.x = changed.value;
        mid_scene.remove(new_bear);
        bear.updateMatrix();
        bear.updateMatrixWorld(true);
        var bear2 = deepCloneObject(bear);
        mid_scene.add(bear2);
        bear2.traverse(canon_pipeline);
        bear2.updateMatrixWorld(true);
        new_bear = bear2;
        break;
      case 'translateY':
        bear.position.y = changed.value;
        mid_scene.remove(new_bear);
        bear.updateMatrix();
        bear.updateMatrixWorld(true);
        var bear2 = deepCloneObject(bear);
        mid_scene.add(bear2);
        bear2.traverse(canon_pipeline);
        bear2.updateMatrixWorld(true);
        new_bear = bear2;
        break;
      case "translateZ":
        bear.position.z = changed.value;
        mid_scene.remove(new_bear);
        bear.updateMatrix();
        bear.updateMatrixWorld(true);
        var bear2 = deepCloneObject(bear);
        mid_scene.add(bear2);
        bear2.traverse(canon_pipeline);
        bear2.updateMatrixWorld(true);
        new_bear = bear2;
        break;
      case "near":
        screen_camera.near = changed.value
        screen_camera.updateProjectionMatrix();
        screen_camhelper.update();
        break;
      case 'far':
        screen_camera.far = changed.value
        screen_camera.updateProjectionMatrix();
        screen_camhelper.update();
        break;
      case "fov":
        screen_camera.fov = changed.value
        screen_camera.updateProjectionMatrix();
        screen_camhelper.update();
        break;
      // CLIPPING THE CUBE WALLS  
      case "planeX0":
        const indexToRemove1 = clippingPlanes.findIndex(obj => obj.normal.equals(new THREE.Vector3(1, 0, 0)));
        if (indexToRemove1 !== -1) {
          clippingPlanes.splice(indexToRemove1, 1);
        }else{
          clippingPlanes.push(new THREE.Plane(new THREE.Vector3(1, 0, 0), 1));
        }
        canonical_renderer.clippingPlanes = clippingPlanes;
        break;
      case "planeX1":
        const indexToRemove2 = clippingPlanes.findIndex(obj => obj.normal.equals(new THREE.Vector3(-1,0,0))); 
        if (indexToRemove2 !== -1) {
          clippingPlanes.splice(indexToRemove2, 1);
        }else{
          clippingPlanes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1));
        }
        canonical_renderer.clippingPlanes = clippingPlanes;
        break;
      case "planeY0":
        const indexToRemove3 = clippingPlanes.findIndex(obj => obj.normal.equals(new THREE.Vector3(0,1,0))); 
        if (indexToRemove3 !== -1) {
          clippingPlanes.splice(indexToRemove3, 1);
        }else{
          clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 1, 0), 1));
        }
        canonical_renderer.clippingPlanes = clippingPlanes;
        break;
      case "planeY1":
        const indexToRemove4 = clippingPlanes.findIndex(obj => obj.normal.equals(new THREE.Vector3(0,-1,0))); 
        if (indexToRemove4 !== -1) {
          clippingPlanes.splice(indexToRemove4, 1);
        }else{
          clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), 1));
        }
        canonical_renderer.clippingPlanes = clippingPlanes;
        break;
      case "planeZ0":
        const indexToRemove5 = clippingPlanes.findIndex(obj => obj.normal.equals(new THREE.Vector3(0,0,1))); 
        if (indexToRemove5 !== -1) {
          clippingPlanes.splice(indexToRemove5, 1);
        }else{
          clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 0, 1), 1));
        }
        canonical_renderer.clippingPlanes = clippingPlanes;
        break;
      case "planeZ1":
        const indexToRemove6 = clippingPlanes.findIndex(obj => obj.normal.equals(new THREE.Vector3(0,0,-1))); 
        if (indexToRemove6 !== -1) {
          clippingPlanes.splice(indexToRemove6, 1);
        }else{
          clippingPlanes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), 1));
        }
        canonical_renderer.clippingPlanes = clippingPlanes;
        break;
    }
  }


  // Event listener for orbit control changes
  screen_controls.addEventListener('change', () => {
    mid_scene.remove(new_bear);
    var bear2 = helper.createTeddyBear();
    mid_scene.add(bear2);
    canon_cam.updateMatrix();
    canon_cam.updateMatrixWorld();
    canon_cam.updateProjectionMatrix();
    screen_camera.updateMatrix();
    screen_camera.updateMatrixWorld();
    screen_camera.updateProjectionMatrix();
    bear2.traverse(canon_pipeline);
    new_bear = bear2;
  });
  
}

// call main entrypoint
main();
