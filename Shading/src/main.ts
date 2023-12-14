// external dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// local from us provided utilities
import RenderWidget from './lib/rendererWidget';
import { Application, createWindow } from './lib/window';
import type * as utils from './lib/utils';

// helper lib, provides exercise dependent prewritten Code
import * as helper from './helper';

// load shaders
import cookFragmentShader from './shader/cook.f.glsl?raw';
import cookVertexShader from './shader/cook.v.glsl?raw';
import gouraudFragmentShader from './shader/gouraud.f.glsl?raw';
import gouraudVertexShader from './shader/gouraud.v.glsl?raw';
import phongFragmentShader from './shader/phong.f.glsl?raw';
import phongVertexShader from './shader/phong.v.glsl?raw';
import lambertFragmentShader from './shader/lambert.f.glsl?raw';
import lambertVertexShader from './shader/lambert.v.glsl?raw';
import normalFragmentShader from './shader/normal.f.glsl?raw';
import normalVertexShader from './shader/normal.v.glsl?raw';
import basicVertexShader from './shader/basic.v.glsl?raw';
import basicFragmentShader from './shader/basic.f.glsl?raw';
import ambientVertexShader from './shader/ambient.v.glsl?raw';
import ambientFragmentShader from './shader/ambient.f.glsl?raw';
import toonVertexShader from './shader/toon.v.glsl?raw';
import toonFragmentShader from './shader/toon.f.glsl?raw';

var uniforms = { // ambient_uniform
  ambientColor: { value: new THREE.Vector3(0.4, 0.05, 0.05)}, // Initial ambient color
  ambientReflectance: { value: 0.5 },// Initial ambient reflectance
};

// feel free to declar certain variables outside the main function to change them somewhere else
// e.g. settings, light or material
function main(){
  // setup/layout root Application.
  // Its the body HTMLElement with some additional functions.
  // More complex layouts are possible too.
  var root = Application("Shader");
	root.setLayout([["renderer"]]);
  root.setLayoutColumns(["100%"]);
  root.setLayoutRows(["100%"]);

  // ---------------------------------------------------------------------------
  // create Settings and create GUI settings
  var settings = new helper.Settings();
  helper.createGUI(settings);
  // adds the callback that gets called on params change
  settings.addCallback(callback);

  // ---------------------------------------------------------------------------
  // create RenderDiv
	var rendererDiv = createWindow("renderer");
  root.appendChild(rendererDiv);

  // create renderer
  var renderer = new THREE.WebGLRenderer({
      antialias: true,  // to enable anti-alias and get smoother output
  });

  // create scene
  var scene = new THREE.Scene();
  var { material, model0, model1, model2, model3 } = helper.setupGeometry(scene);
  material.uniforms = uniforms; 

  // add light proxy
  var lightgeo = new THREE.SphereGeometry(0.1, 32, 32);
  var lightMaterial = new THREE.MeshBasicMaterial({color: 0xffffff}); // start color in gui
  var light = new THREE.Mesh(lightgeo, lightMaterial);
  scene.add(light);
  light.position.set(2, 2, 2); // start position in gui

  // Custom Uniforms for Lambert Shading as it need changes from gui even when it's not the material
  var uniforms_lambert = {
    diffuseReflectance: { value: 1.0 },
    diffuseColor: { value: new THREE.Vector3(0.8, 0.1, 0.1) }, 
    lightPos: {value: light.position } 
  };
  // Custom uniforms for Phong and Gouraud
  var uniforms_phong = {
    lightPos: {value: light.position }, 
    ambientColor: { value: new THREE.Vector3(0.8, 0.1, 0.1) },
    diffuseColor: { value: new THREE.Vector3(0.8, 0.1, 0.1) }, 
    specularColor: { value: new THREE.Vector3(1.0, 1.0, 1.0)}, 
    ambientReflectance: { value: 0.5 }, 
    diffuseReflectance: { value: 1.0 }, 
    specularReflectance: { value: 1.0 }, 
    shininess: { value: 128 } 
  };
  // Custom uniforms for Cook_Torrance
  var uniforms_cook = {
    lightPos: {value: light.position }, 
    diffuseColor: { value: new THREE.Vector3(0.8, 0.1, 0.1) }, 
    specularColor: { value: new THREE.Vector3(1.0, 1.0, 1.0)}, 
    diffuseReflectance: { value: 1.0 }, 
    specularReflectance: { value: 1.0 }, 
    roughness: { value: 0.2 } 
  };
 
  
  // defines callback that should get called whenever the
  // params of the settings get changed (eg. via GUI)
  function callback(changed: utils.KeyValuePair<helper.Settings>) {
    if (changed.key == 'shader'){
      if (changed.value == helper.Shaders.ambient){ // AMBIENT
        material = new THREE.RawShaderMaterial( {
          vertexShader: ambientVertexShader, 
          fragmentShader: ambientFragmentShader,
          uniforms: uniforms
        });
        material.glslVersion = THREE.GLSL3;
        model0.material = material;
        model1.material = material;
        model2.material = material;
        model3.material = material;
      }
      if (changed.value == helper.Shaders.lambert){ // LAMBERT
        material = new THREE.RawShaderMaterial( {
          vertexShader: lambertVertexShader, 
          fragmentShader: lambertFragmentShader,
          uniforms: uniforms_lambert
        });
        material.glslVersion = THREE.GLSL3;
        model0.material = material;
        model1.material = material;
        model2.material = material;
        model3.material = material;
      }
      if (changed.value == helper.Shaders.basic){ // BASIC
        material = new THREE.RawShaderMaterial( {
          vertexShader: basicVertexShader, 
          fragmentShader: basicFragmentShader
        });
        material.glslVersion = THREE.GLSL3;
        model0.material = material;
        model1.material = material;
        model2.material = material;
        model3.material = material;
      }
      if (changed.value == helper.Shaders.phong_phong){ // PHONG
        material = new THREE.RawShaderMaterial( {
          vertexShader: phongVertexShader, 
          fragmentShader: phongFragmentShader,
          uniforms: uniforms_phong
        });
        material.glslVersion = THREE.GLSL3;
        model0.material = material;
        model1.material = material;
        model2.material = material;
        model3.material = material;
      }
      if (changed.value == helper.Shaders.gouraud_phong){ // GOURAUD-PHONG
        material = new THREE.RawShaderMaterial( {
          vertexShader: gouraudVertexShader, 
          fragmentShader: gouraudFragmentShader,
          uniforms: uniforms_phong
        });
        material.glslVersion = THREE.GLSL3;
        model0.material = material;
        model1.material = material;
        model2.material = material;
        model3.material = material;
      }
      if (changed.value == helper.Shaders.phong_cooktorrance){ // COOK TORRANCE
        material = new THREE.RawShaderMaterial( {
          vertexShader: cookVertexShader, 
          fragmentShader: cookFragmentShader,
          uniforms: uniforms_cook
        });
        material.glslVersion = THREE.GLSL3;
        model0.material = material;
        model1.material = material;
        model2.material = material;
        model3.material = material;
      }
      if (changed.value == helper.Shaders.normal){ // NORMAL
        var meshes = [model0, model1, model2, model3];
        // Loop through each mesh and create a new material instance with its own normalMatrix
        meshes.forEach((mesh) => { 
          const modelMatrix = mesh.matrixWorld;
          var invtraMatrix = new THREE.Matrix3().getNormalMatrix(modelMatrix);  // inverse transpose of normal
          material = new THREE.RawShaderMaterial({
            vertexShader: normalVertexShader,
            fragmentShader: normalFragmentShader,
            uniforms: { 
              normalizedMatrix: {value: invtraMatrix}
            }
          })
          material.glslVersion = THREE.GLSL3;
          mesh.material = material;
        });
      }
      if (changed.value == helper.Shaders.toon){ // TOON
        material = new THREE.RawShaderMaterial( {
          vertexShader: toonVertexShader, 
          fragmentShader: toonFragmentShader, // no custom uniforms
        });
        material.glslVersion = THREE.GLSL3;
        model0.material = material;
        model1.material = material;
        model2.material = material;
        model3.material = material;
      }
    }
    // change variables for all uniforms that use it
    if (changed.key == 'ambient_color'){ 
      uniforms.ambientColor.value.x = changed.value[0] / 255;
      uniforms.ambientColor.value.y = changed.value[1] / 255;
      uniforms.ambientColor.value.z = changed.value[2] / 255;
      uniforms_phong.ambientColor.value.x = changed.value[0] / 255;
      uniforms_phong.ambientColor.value.y = changed.value[1] / 255;
      uniforms_phong.ambientColor.value.z = changed.value[2] / 255;
    }
    if (changed.key == 'ambient_reflectance'){
      uniforms.ambientReflectance.value = changed.value;
      uniforms_phong.ambientReflectance.value = changed.value;
    }
    if (changed.key == 'diffuse_color'){
      uniforms_lambert.diffuseColor.value.x = changed.value[0] / 255;
      uniforms_lambert.diffuseColor.value.y = changed.value[1] / 255;
      uniforms_lambert.diffuseColor.value.z = changed.value[2] / 255;
      uniforms_phong.diffuseColor.value.x = changed.value[0] / 255;
      uniforms_phong.diffuseColor.value.y = changed.value[1] / 255;
      uniforms_phong.diffuseColor.value.z = changed.value[2] / 255;
      uniforms_cook.diffuseColor.value.x = changed.value[0] / 255;
      uniforms_cook.diffuseColor.value.y = changed.value[1] / 255;
      uniforms_cook.diffuseColor.value.z = changed.value[2] / 255;
    }
    if (changed.key == 'diffuse_reflectance'){
      uniforms_lambert.diffuseReflectance.value = changed.value;
      uniforms_phong.diffuseReflectance.value = changed.value;
      uniforms_cook.diffuseReflectance.value = changed.value;
    }
    if (changed.key == 'specular_color'){
      uniforms_phong.specularColor.value.x = changed.value[0] / 255;
      uniforms_phong.specularColor.value.y = changed.value[1] / 255;
      uniforms_phong.specularColor.value.z = changed.value[2] / 255;
      uniforms_cook.specularColor.value.x = changed.value[0] / 255;
      uniforms_cook.specularColor.value.y = changed.value[1] / 255;
      uniforms_cook.specularColor.value.z = changed.value[2] / 255;
    }
    if (changed.key == 'specular_reflectance'){
      uniforms_phong.specularReflectance.value = changed.value;
      uniforms_cook.specularReflectance.value = changed.value;
    }
    if (changed.key == 'magnitude'){
      uniforms_phong.shininess.value = changed.value;
    }
    if (changed.key == 'roughness'){
      uniforms_cook.roughness.value = changed.value;
    }
    if (changed.key == 'lightX'){
      light.position.setX(changed.value);
    }
    if (changed.key == 'lightY'){
      light.position.setY(changed.value);
    }
    if (changed.key == 'lightZ'){
      light.position.setZ(changed.value);
    }
  }
  
  
  // create camera
  var camera = new THREE.PerspectiveCamera();
  helper.setupCamera(camera, scene);

  // create controls
  var controls = new OrbitControls(camera, rendererDiv);
  helper.setupControls(controls);

  // fill the renderDiv. In RenderWidget happens all the magic.
  // It handles resizes, adds the fps widget and most important defines the main animate loop.
  // You dont need to touch this, but if feel free to overwrite RenderWidget.animate
  var wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls);
  // start the draw loop (this call is async)
  wid.animate();
}

// call main entrypoint
main();
