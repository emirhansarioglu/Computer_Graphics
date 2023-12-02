// external dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import RenderWidget from './lib/rendererWidget';
import { Application, createWindow, Window } from './lib/window';

import * as helper from './helper';
// put your imports here

/*******************************************************************************
 * Main entrypoint. Previouly declared functions get managed/called here.
 * Start here with programming.
 ******************************************************************************/

var camera: THREE.PerspectiveCamera;
var controls: OrbitControls;
var rendererDiv: Window;

function main(){
    var root = Application("Robot");
  	root.setLayout([["renderer"]]);
    root.setLayoutColumns(["100%"]);
    root.setLayoutRows(["100%"]);

    // ---------------------------------------------------------------------------
    // create RenderDiv
    rendererDiv = createWindow("renderer");
    root.appendChild(rendererDiv);

    // create renderer
    var renderer = new THREE.WebGLRenderer({
        antialias: true,  // to enable anti-alias and get smoother output
    });

    // important exercise specific limitation, do not remove this line
    THREE.Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false;

    // create scene
    var scene = new THREE.Scene();
    // manually set matrixWorld
    scene.matrixWorld.copy(scene.matrix);
    // Changing background color
    scene.background = new THREE.Color(0.33,0.33,0.34);

    // ROOT
    const robotRoot = new THREE.Object3D();
    scene.add(robotRoot);

    // BODY
    const geometry_body = new THREE.BoxGeometry(1.5,1.5,1);
    const material_body = new THREE.MeshPhongMaterial({ color: 0x000040 });
    const body = new THREE.Mesh(geometry_body, material_body);
    body.matrix.set(1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1);
    robotRoot.add(body);
    const bodyAxes = new THREE.AxesHelper(2);
    body.add(bodyAxes);
    bodyAxes.visible = false;
    body.userData.initialMatrix = body.matrix.clone();
    // ARMS
    const geometry_arm = new THREE.BoxGeometry(1.5,0.5,0.5);
    const material_arm = new THREE.MeshPhongMaterial({ color: 0x000040 });
    const right_arm = new THREE.Mesh(geometry_arm, material_arm);
    const left_arm = new THREE.Mesh(geometry_arm, material_arm);
    left_arm.matrix.set(1,0,0,1.75,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1);
    right_arm.matrix.set(1,0,0,-1.75,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1);
    body.add(left_arm);
    body.add(right_arm);
    const left_arm_axes = new THREE.AxesHelper(2);
    left_arm.add(left_arm_axes);
    left_arm_axes.visible = false;
    const right_arm_axes = new THREE.AxesHelper(2);
    right_arm.add(right_arm_axes);
    right_arm_axes.visible = false;
    left_arm.userData.initialMatrix = left_arm.matrix.clone();
    right_arm.userData.initialMatrix = right_arm.matrix.clone();

    // LEGS
    const geometry_leg = new THREE.BoxGeometry(0.5,1.75,0.5);
    const material_leg = new THREE.MeshPhongMaterial({ color: 0x000040 });
    const right_leg = new THREE.Mesh(geometry_leg, material_leg);
    const left_leg = new THREE.Mesh(geometry_leg, material_leg);
    left_leg.matrix.set(1,0,0,0.5,
      0,1,0,-1.75,
      0,0,1,0,
      0,0,0,1);
    right_leg.matrix.set(1,0,0,-0.5,
      0,1,0,-1.75,
      0,0,1,0,
      0,0,0,1);
    body.add(left_leg);
    body.add(right_leg);
    const left_leg_axes = new THREE.AxesHelper(2);
    left_leg.add(left_leg_axes);
    left_leg_axes.visible = false;
    const right_leg_axes = new THREE.AxesHelper(2);
    right_leg.add(right_leg_axes);
    right_leg_axes.visible = false;
    left_leg.userData.initialMatrix = left_leg.matrix.clone();
    right_leg.userData.initialMatrix = right_leg.matrix.clone();

    // HEAD
    const geometry_head = new THREE.SphereGeometry(0.7,16,16);
    const material_head = new THREE.MeshPhongMaterial({ color: 0x000040 });
    const head = new THREE.Mesh(geometry_head, material_head);
    head.matrix.set(1,0,0,0,
      0,1,0,1.5,
      0,0,1,0,
      0,0,0,1);
    body.add(head);
    const head_axes = new THREE.AxesHelper(2);
    head.add(head_axes);
    head_axes.visible = false; 
    head.userData.initialMatrix = head.matrix.clone();
     
    // FEET
    const geometry_feet = new THREE.BoxGeometry(0.5, 0.25, 0.75)
    const material_feet = new THREE.MeshPhongMaterial({ color: 0x000040});
    const right_feet = new THREE.Mesh(geometry_feet, material_feet);
    const left_feet = new THREE.Mesh(geometry_feet, material_feet);
    left_feet.matrix.set(1,0,0,0,
      0,1,0,-1.125,
      0,0,1,0.45,
      0,0,0,1);
    right_feet.matrix.set(1,0,0,0,
      0,1,0,-1.125,
      0,0,1,0.45,
      0,0,0,1);
    right_leg.add(right_feet);
    left_leg.add(left_feet);
    const left_feet_axes = new THREE.AxesHelper(2);
    left_feet.add(left_feet_axes);
    left_feet_axes.visible = false;
    const right_feet_axes = new THREE.AxesHelper(2);
    right_feet.add(right_feet_axes);
    right_feet_axes.visible = false;
    left_feet.userData.initialMatrix = left_feet.matrix.clone();
    right_feet.userData.initialMatrix = right_feet.matrix.clone();

    
    // Selecting the body parts of the robot with eventlistener
    let selectedNode: THREE.Object3D = robotRoot; // To store the currently selected node
    let axesVisible = false;
      

    // Function to reset the pose of a mesh to its initial position
    function resetMeshPose(mesh: THREE.Mesh): void {
      if (mesh.userData.initialMatrix) {
        mesh.matrix.copy(mesh.userData.initialMatrix);
        updateMatrixWorld(mesh);
      }
    }

    // Function to reset the pose of all meshes in the scene graph
    function resetAllMeshes(scene: THREE.Scene): void {
      scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          resetMeshPose(node);
        }
      });
    }



    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'w':
          if (selectedNode instanceof THREE.Mesh ) {
            // change the color back
            selectedNode.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            // unshow the axes
            for (const child of selectedNode.children) {
              if (child instanceof THREE.AxesHelper){
                child.visible = false;
              }
            }
            // toggle to new part 
            if (selectedNode.parent instanceof THREE.Object3D){
              selectedNode  = selectedNode.parent;
            }
            if (selectedNode instanceof THREE.Mesh){
              selectedNode.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            }
            for (const child of selectedNode.children) {
              if (child instanceof THREE.AxesHelper){
                child.visible = axesVisible;
              }
            }
          }
          break;
        
        case 's':
          for (const child of selectedNode.children) {
              if (child instanceof THREE.Mesh){
                // change the color back
                if (selectedNode instanceof THREE.Mesh){
                  selectedNode.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
                } 
                // unshow the axes
                for (const child of selectedNode.children) {
                  if (child instanceof THREE.AxesHelper){
                    child.visible = false;
                  }
                }
                // change the body part
                selectedNode = child ;
                if (selectedNode instanceof THREE.Mesh){
                  selectedNode.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
                }
                for (const child of selectedNode.children) {
                  if (child instanceof THREE.AxesHelper){
                    child.visible = axesVisible;
                  }
                }
                break;
              }
            }
          break;

        case 'a':
          if(selectedNode === left_leg){
            left_leg.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            left_leg_axes.visible = false;
            selectedNode = right_arm;
            right_arm.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            right_arm_axes.visible = axesVisible;

          } else if(selectedNode === right_leg){
            right_leg.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            right_leg_axes.visible = false;
            selectedNode = left_leg;
            left_leg.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            left_leg_axes.visible = axesVisible;

          } else if(selectedNode === right_arm){
            right_arm.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            right_arm_axes.visible = false;
            selectedNode = left_arm;
            left_arm.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            left_arm_axes.visible = axesVisible;

          } else if(selectedNode === head){
            head.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            head_axes.visible = false;
            selectedNode = right_leg;
            right_leg.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            right_leg_axes.visible = axesVisible;

          } else if(selectedNode === left_arm){
            left_arm.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            left_arm_axes.visible = false;
            selectedNode = head;
            head.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            head_axes.visible = axesVisible;
          }
          break;

        case 'd':
          if(selectedNode === left_leg){
            left_leg.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            left_leg_axes.visible = false;
            selectedNode = right_leg;
            right_leg.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            right_leg_axes.visible = axesVisible;

          } else if(selectedNode === right_leg){
            right_leg.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            right_leg_axes.visible = false;
            selectedNode = head;
            head.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            head_axes.visible = axesVisible;

          } else if(selectedNode === right_arm){
            right_arm.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            right_arm_axes.visible = false;
            selectedNode = left_leg;
            left_leg.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            left_leg_axes.visible = axesVisible;

          } else if(selectedNode === head){
            head.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            head_axes.visible = false;
            selectedNode = left_arm;
            left_arm.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            left_arm_axes.visible = axesVisible;
          
          } else if(selectedNode === left_arm){
            left_arm.material = new THREE.MeshPhongMaterial({ color: 0x000040 });
            left_arm_axes.visible = false;
            selectedNode = right_arm;
            right_arm.material = new THREE.MeshPhongMaterial({ color: 0x400040 });
            right_arm_axes.visible = axesVisible;
          } 
          break;

        case 'c':
          axesVisible = !axesVisible;
          for (const child of selectedNode.children) {
            if (child instanceof THREE.AxesHelper){
              child.visible = axesVisible;
            }
          }
          break;
        
        case "ArrowUp":
          if (selectedNode === left_feet){
            left_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,-0.45,
              0,0,0,1));
            left_feet.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(355* Math.PI / 180),-Math.sin(355* Math.PI / 180),0,
              0,Math.sin(355* Math.PI / 180),Math.cos(355* Math.PI / 180),0,
              0,0,0,1));
            left_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,0.45,
              0,0,0,1));

          } else if(selectedNode === right_feet){
            right_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,-0.45,
              0,0,0,1));
            right_feet.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(355* Math.PI / 180),-Math.sin(355* Math.PI / 180),0,
              0,Math.sin(355* Math.PI / 180),Math.cos(355* Math.PI / 180),0,
              0,0,0,1));
            right_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,0.45,
              0,0,0,1));
            
          } else if(selectedNode === left_leg){
            left_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.875,
              0,0,1,0,
              0,0,0,1));
            left_leg.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(355* Math.PI / 180),-Math.sin(355* Math.PI / 180),0,
              0,Math.sin(355* Math.PI / 180),Math.cos(355* Math.PI / 180),0,
              0,0,0,1));
            left_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.875,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === right_leg){
            right_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.5, 
              0,1,0,0.875,
              0,0,1,0,
              0,0,0,1));
            right_leg.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(355* Math.PI / 180),-Math.sin(355* Math.PI / 180),0,
              0,Math.sin(355* Math.PI / 180),Math.cos(355* Math.PI / 180),0,
              0,0,0,1));
            right_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.5, 
              0,1,0,-0.875,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === left_arm){
            left_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
            left_arm.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(355* Math.PI / 180),-Math.sin(355* Math.PI / 180),0,
              0,Math.sin(355* Math.PI / 180),Math.cos(355* Math.PI / 180),0,
              0,0,0,1));
            left_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
          } else if(selectedNode === right_arm){      
            right_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
            right_arm.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(355* Math.PI / 180),-Math.sin(355* Math.PI / 180),0,
              0,Math.sin(355* Math.PI / 180),Math.cos(355* Math.PI / 180),0,
              0,0,0,1));
            right_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === body){
            body.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(355* Math.PI / 180),-Math.sin(355* Math.PI / 180),0,
              0,Math.sin(355* Math.PI / 180),Math.cos(355* Math.PI / 180),0,
              0,0,0,1));

          } else if(selectedNode === head){
            head.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.7,
              0,0,1,0,
              0,0,0,1));
            head.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(355* Math.PI / 180),-Math.sin(355* Math.PI / 180),0,
              0,Math.sin(355* Math.PI / 180),Math.cos(355* Math.PI / 180),0,
              0,0,0,1));
            head.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.7,
              0,0,1,0,
              0,0,0,1));
          }

          updateMatrixWorld(robotRoot); 
          break;
        
        case "ArrowDown":
          if (selectedNode === left_feet){
            left_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,-0.45,
              0,0,0,1));
            left_feet.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(5*Math.PI / 180),-Math.sin(5*Math.PI / 180),0,
              0,Math.sin(5*Math.PI / 180),Math.cos(5*Math.PI / 180),0,
              0,0,0,1));
            left_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,0.45,
              0,0,0,1));

          } else if(selectedNode === right_feet){
            right_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,-0.45,
              0,0,0,1));
            right_feet.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(5*Math.PI / 180),-Math.sin(5*Math.PI / 180),0,
              0,Math.sin(5*Math.PI / 180),Math.cos(5*Math.PI / 180),0,
              0,0,0,1));
            right_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,0.45,
              0,0,0,1));
            
          } else if(selectedNode === left_leg){
            left_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.875,
              0,0,1,0,
              0,0,0,1));
            left_leg.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(5*Math.PI / 180),-Math.sin(5*Math.PI / 180),0,
              0,Math.sin(5*Math.PI / 180),Math.cos(5*Math.PI / 180),0,
              0,0,0,1));
            left_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.875,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === right_leg){
            right_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.5, 
              0,1,0,0.875,
              0,0,1,0,
              0,0,0,1));
            right_leg.matrix.multiply(new THREE.Matrix4().set(
              1,0,0,0,
              0,Math.cos(5*Math.PI / 180),-Math.sin(5*Math.PI / 180),0,
              0,Math.sin(5*Math.PI / 180),Math.cos(5*Math.PI / 180),0,
              0,0,0,1));
            right_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.5, 
              0,1,0,-0.875,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === left_arm){
            left_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
            left_arm.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(5*Math.PI / 180),-Math.sin(5*Math.PI / 180),0,
              0,Math.sin(5*Math.PI / 180),Math.cos(5*Math.PI / 180),0,
              0,0,0,1));
            left_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
          } else if(selectedNode === right_arm){      
            right_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
            right_arm.matrix.multiply(new THREE.Matrix4().set(
              1,0,0,0,
              0,Math.cos(5*Math.PI / 180),-Math.sin(5*Math.PI / 180),0,
              0,Math.sin(5*Math.PI / 180),Math.cos(5*Math.PI / 180),0,
              0,0,0,1));
            right_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === body){
            body.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(5*Math.PI / 180),-Math.sin(5*Math.PI / 180),0,
              0,Math.sin(5*Math.PI / 180),Math.cos(5*Math.PI / 180),0,
              0,0,0,1));

          } else if(selectedNode === head){
            head.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.7,
              0,0,1,0,
              0,0,0,1));
            head.matrix.multiply(new THREE.Matrix4().set( 
              1,0,0,0,
              0,Math.cos(5*Math.PI / 180),-Math.sin(5*Math.PI / 180),0,
              0,Math.sin(5*Math.PI / 180),Math.cos(5*Math.PI / 180),0,
              0,0,0,1));
            head.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.7,
              0,0,1,0,
              0,0,0,1));
          }

          updateMatrixWorld(robotRoot); 
          break;

        case "ArrowLeft":
          if (selectedNode === left_feet){
            left_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,-0.45,
              0,0,0,1));
            left_feet.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(355* Math.PI/180),0,Math.sin(355* Math.PI/180),0,
              0,1,0,0,
              -Math.sin(355* Math.PI/180),0,Math.cos(355* Math.PI/180),0,
              0,0,0,1));
            left_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,0.45,
              0,0,0,1));

          } else if(selectedNode === right_feet){
            right_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,-0.45,
              0,0,0,1));
            right_feet.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(355* Math.PI/180),0,Math.sin(355* Math.PI/180),0,
              0,1,0,0,
              -Math.sin(355* Math.PI/180),0,Math.cos(355* Math.PI/180),0,
              0,0,0,1));
            right_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,0.45,
              0,0,0,1));
            
          } else if(selectedNode === left_leg){
            left_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.875,
              0,0,1,0,
              0,0,0,1));
            left_leg.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(355* Math.PI/180),0,Math.sin(355* Math.PI/180),0,
              0,1,0,0,
              -Math.sin(355* Math.PI/180),0,Math.cos(355* Math.PI/180),0,
              0,0,0,1));
            left_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.875,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === right_leg){
            right_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.875,
              0,0,1,0,
              0,0,0,1));
            right_leg.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(355* Math.PI/180),0,Math.sin(355* Math.PI/180),0,
              0,1,0,0,
              -Math.sin(355* Math.PI/180),0,Math.cos(355* Math.PI/180),0,
              0,0,0,1));
            right_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.875,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === left_arm){
            left_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
            left_arm.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(355* Math.PI/180),0,Math.sin(355* Math.PI/180),0,
              0,1,0,0,
              -Math.sin(355* Math.PI/180),0,Math.cos(355* Math.PI/180),0,
              0,0,0,1));
            left_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
          } else if(selectedNode === right_arm){      
            right_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
            right_arm.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(355* Math.PI/180),0,Math.sin(355* Math.PI/180),0,
              0,1,0,0,
              -Math.sin(355* Math.PI/180),0,Math.cos(355* Math.PI/180),0,
              0,0,0,1));
            right_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === body){
            body.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(355* Math.PI/180),0,Math.sin(355* Math.PI/180),0,
              0,1,0,0,
              -Math.sin(355* Math.PI/180),0,Math.cos(355* Math.PI/180),0,
              0,0,0,1));

          } else if(selectedNode === head){
            head.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.7,
              0,0,1,0,
              0,0,0,1));
            head.matrix.multiply(new THREE.Matrix4().set(
              Math.cos(355* Math.PI/180),0,Math.sin(355* Math.PI/180),0,
              0,1,0,0,
              -Math.sin(355* Math.PI/180),0,Math.cos(355* Math.PI/180),0,
              0,0,0,1));
            head.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.7,
              0,0,1,0,
              0,0,0,1));
          }

          updateMatrixWorld(robotRoot); 
          break;
        
        case "ArrowRight":
          if (selectedNode === left_feet){
            left_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,-0.45,
              0,0,0,1));
            left_feet.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(5*Math.PI/180),0,Math.sin(5*Math.PI/180),0,
              0,1,0,0,
              -Math.sin(5*Math.PI/180),0,Math.cos(5*Math.PI/180),0,
              0,0,0,1));
            left_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,0.45,
              0,0,0,1));

          } else if(selectedNode === right_feet){
            right_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,-0.45,
              0,0,0,1));
            right_feet.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(5*Math.PI/180),0,Math.sin(5*Math.PI/180),0,
              0,1,0,0,
              -Math.sin(5*Math.PI/180),0,Math.cos(5*Math.PI/180),0,
              0,0,0,1));
            right_feet.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0,
              0,0,1,0.45,
              0,0,0,1));
            
          } else if(selectedNode === left_leg){
            left_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.875,
              0,0,1,0,
              0,0,0,1));
            left_leg.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(5*Math.PI/180),0,Math.sin(5*Math.PI/180),0,
              0,1,0,0,
              -Math.sin(5*Math.PI/180),0,Math.cos(5*Math.PI/180),0,
              0,0,0,1));
            left_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.875,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === right_leg){
            right_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.875,
              0,0,1,0,
              0,0,0,1));
            right_leg.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(5*Math.PI/180),0,Math.sin(5*Math.PI/180),0,
              0,1,0,0,
              -Math.sin(5*Math.PI/180),0,Math.cos(5*Math.PI/180),0,
              0,0,0,1));
            right_leg.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.875,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === left_arm){
            left_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
            left_arm.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(5*Math.PI/180),0,Math.sin(5*Math.PI/180),0,
              0,1,0,0,
              -Math.sin(5*Math.PI/180),0,Math.cos(5*Math.PI/180),0,
              0,0,0,1));
            left_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
          } else if(selectedNode === right_arm){      
            right_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));
            right_arm.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(5*Math.PI/180),0,Math.sin(5*Math.PI/180),0,
              0,1,0,0,
              -Math.sin(5*Math.PI/180),0,Math.cos(5*Math.PI/180),0,
              0,0,0,1));
            right_arm.matrix.multiply(new THREE.Matrix4().set(1,0,0,-0.75, 
              0,1,0,0,
              0,0,1,0,
              0,0,0,1));

          } else if(selectedNode === body){
            body.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(5*Math.PI/180),0,Math.sin(5*Math.PI/180),0,
              0,1,0,0,
              -Math.sin(5*Math.PI/180),0,Math.cos(5*Math.PI/180),0,
              0,0,0,1));

          } else if(selectedNode === head){
            head.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,-0.7,
              0,0,1,0,
              0,0,0,1));
            head.matrix.multiply(new THREE.Matrix4().set( 
              Math.cos(5*Math.PI/180),0,Math.sin(5*Math.PI/180),0,
              0,1,0,0,
              -Math.sin(5*Math.PI/180),0,Math.cos(5*Math.PI/180),0,
              0,0,0,1));
            head.matrix.multiply(new THREE.Matrix4().set(1,0,0,0, 
              0,1,0,0.7,
              0,0,1,0,
              0,0,0,1));
          }

          updateMatrixWorld(robotRoot); 
          break;

        case 'r':
          resetAllMeshes(scene);
      }
    });

    //  Update matrixWorld of every part recursively
    function updateMatrixWorld(node: THREE.Object3D) {
      if (node.parent) {  // if it has a parent, adjust the global transformation 
          node.matrixWorld.multiplyMatrices(node.parent.matrixWorld, node.matrix);
      } else {
          node.matrixWorld.copy(node.matrix);
      }

      for (const child of node.children) {
          updateMatrixWorld(child);
      }
    }
    updateMatrixWorld(robotRoot);

    //Light
    helper.setupLight(scene);

    // create camera
    camera = new THREE.PerspectiveCamera();
    helper.setupCamera(camera, scene);
    camera.position.z = 8
    camera.position.y = 0

    // create controls
    controls = new OrbitControls(camera, rendererDiv);
    helper.setupControls(controls);

    // start the animation loop (async)
    var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls);
    wid.animate();
}

// call main entrypoint
main();
