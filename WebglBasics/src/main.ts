/**
 * This is a minimal boilerplate example for the CG1 course.
 * Later skeletons will provide less code in main.ts so use this for reference.
 *
 * written by Ugo Finnendahl
 **/

// External dependencies.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';

// Local from us provided global utilities.
import * as utils from './lib/utils';
import RenderWidget from './lib/rendererWidget';
import { Application, createWindow } from './lib/window';

// The helper lib, provides exercise dependent prewritten Code.
import * as helper from './helper';


/*******************************************************************************
 * Defines Settings and GUI.
 ******************************************************************************/

// enum(s)
enum Models {
  quad = "Quad",
  box = "Box",
  sphere = "Sphere",
  torus = "Torus"
}

// Settings class with default values. An instance of Settings stores the current state.
class Settings extends utils.Callbackable{
  // Different setting types are possible (e.g. string, enum, number, boolean, function).
  name: string = "Basic";
  model: Models = Models.box;
  scale: number = 1;
  disco: boolean = false;
  fun: () => void = function(){ alert("You clicked me!") }
  
}

// Create GUI given a Settings object.
function createGUI(settings: Settings): dat.GUI {
  // we are using dat.GUI (https://github.com/dataarts/dat.gui)
  var gui: dat.GUI = new dat.GUI();

  // Build the GUI
  // The five types have different appearances.
  gui.add(settings, 'name').name('App name');
  gui.add(settings, 'model', utils.enumOptions(Models)).name('3D Model');
  gui.add(settings, 'scale', 0, 1, 0.1).name('Scale');
  gui.add(settings, 'disco').name("Disco");
  gui.add(settings, 'fun').name("Click Me");

  return gui;
}


/*******************************************************************************
 * The main application. Your logic should later be separated into multiple files.
 ******************************************************************************/

var mesh: THREE.Mesh;
var isBlack =  true
// Defines the callback that should get called
// whenever the settings change (i.e. via GUI).
function callback(changed: utils.KeyValuePair<Settings>) {
  if (changed.key == "name") {
    document.title = changed.value;
  }
  else if (changed.key == "model") {
    switch (changed.value) {
      case Models.box:
        mesh.geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case Models.sphere:
        mesh.geometry = new THREE.SphereGeometry(0.66, 30, 30);
        break;
      case Models.torus:
        mesh.geometry = new THREE.TorusGeometry(1, 0.2, 8, 10);
        break;
      case Models.quad:
        mesh.geometry = new THREE.PlaneGeometry(1, 1);
        break;
    }
  }
  else if (changed.key == "scale") {
    helper.scale(mesh, changed.value, changed.value, changed.value); 
  }
  else if (changed.key == "disco") {
    if (isBlack) { // change it to purple
      mesh.material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    }else{
      mesh.material = new THREE.MeshPhongMaterial({ color: 0x887766 });
    }
    isBlack = !isBlack; 
  }
}


/*******************************************************************************
 * Main entrypoint. Previouly declared functions get managed/called here.
 * Start here with programming.
 ******************************************************************************/

function main(){
  // Setup/layout root Application.
  // Its the body HTMLElement with some additional functions.
  var root = Application("Basic");
  // Define the (complex) layout, that will be filled later.
  // This defines 9 cells in a 3 by 3 grid. Each area gets a name.
  // Areas can span muliple cells:
  root.setLayout([
      ["area1", "area1"   , "area2"],
      ["area3", "renderer", "renderer"],
      ["area3", "renderer", "renderer"]
  ]);
  // Now we need to size each cell by sizing the columns and the rows:
  // 1fr means 1 fraction, so 2fr 1fr means.
  // The first column has 2/3 width and the second 1/3 width of the application.
  root.setLayoutColumns(["0fr", "1fr", "1fr"]);
  // You can use percentages as well, but (100/3)% is difficult to realize without fr.
  root.setLayoutRows(["0%", "50%", "50%"]);

  // ---------------------------------------------------------------------------
  // Create settings.
  var settings = new Settings();
  // Create GUI using settings.
  var gui = createGUI(settings);
  gui.open();
  // Adds the callback that gets called on settings change.
  settings.addCallback(callback);

  // ---------------------------------------------------------------------------
  // Create window with given name.
  // The root layout will ensure that the window is placed in the according area.
  var rendererDiv = createWindow("renderer");
  // Add it to the root application.
  root.appendChild(rendererDiv);

  // Create renderer.
  var renderer = new THREE.WebGLRenderer({
      antialias: true,  // to enable anti-alias and get smoother output
  });

  // Create scene.
  var scene = new THREE.Scene();
  helper.setupScene(scene);

  // Uses ./helper.ts for building the scene.
  // First the Mesh.
  mesh = helper.setupGeometry(scene);
  // Then the Light.
  helper.setupLight(scene);

  // Create camera.
  var camera = new THREE.PerspectiveCamera();
  // Uses ./helper.ts for setting up the camera.
  helper.setupCamera(camera, scene);

  // Create controls.
  var controls = new OrbitControls(camera, rendererDiv);
  // Uses ./helper.ts for setting up the controls
  helper.setupControls(controls);

  document.addEventListener("keydown", (event) => {
    if (event.key === " ") {
        // randomize the background color
        var red = Math.random();
        var green = Math.random();
        var blue = Math.random();
        scene.background = new THREE.Color(red, green, blue);
    }
  });

  // Fill the Window (renderDiv). In RenderWidget happens all the magic.
  // It handles resizes, adds the fps widget and most important: defines the main animate loop.
  // You dont need to touch this, but if feel free to overwrite RenderWidget.animate
  var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls);
  // Start the draw loop (this call is async).
  wid.animate();
}

// Call main entrypoint
main();

// Hints for debugging:
// Print to the browser console:
console.log("Hello World!")
// If you want to expose variables in the browser console write:
let variable = "expose me";
(<any>window).variable = variable;
