// external dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// local from us provided utilities
import * as utils from './lib/utils';
import RenderWidget from './lib/rendererWidget';
import { Application, createWindow } from './lib/window';

// helper lib, provides exercise dependent prewritten Code
import * as helper from './helper';
import ImageWidget from './imageWidget';
import UvFragmentShader from './Shaders/uv_shader.f.glsl?raw';
import UvVertexShader from './Shaders/uv_shader.v.glsl?raw';
import SphericalFragmentShader from './Shaders/spherical.f.glsl?raw';
import SphericalVertexShader from './Shaders/spherical.v.glsl?raw';
import SphericalFixedFragmentShader from './Shaders/spherical_fixed.f.glsl?raw';
import SphericalFixedVertexShader from './Shaders/spherical_fixed.v.glsl?raw';

function createQuadGeometry() {
  const geometry = new THREE.BufferGeometry();

  // Define vertices, indices, and UVs for two triangles forming a quad
  const vertices = new Float32Array([
    -1, 1, 0,   // Vertex 1
    -1, -1, 0,  // Vertex 2
    1, -1, 0,   // Vertex 3
    1, 1, 0,    // Vertex 4
  ]);

  const indices = new Uint32Array([0, 1, 2, 0, 2, 3]);

  const uvs = new Float32Array([
    0, 1,   // UV for Vertex 1
    0, 0,   // UV for Vertex 2
    1, 0,   // UV for Vertex 3
    1, 1,   // UV for Vertex 4
  ]);

  // Add attributes to geometry
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  return geometry;
}

var uvShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    textureSampler: { value: null }, // Texture will be passed as a uniform
    drawingTexture: { value: null }, // Texture for drawing
  },
  vertexShader: UvVertexShader,
  fragmentShader: UvFragmentShader,
});
var sphericalShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    textureSampler: { value: null }, // Texture will be passed as a uniform
    drawingTexture: { value: null }, // Texture for drawing
  },
  vertexShader: SphericalVertexShader,
  fragmentShader: SphericalFragmentShader,
})
var sphericalFixedShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    textureSampler: { value: null }, // Texture will be passed as a uniform
    drawingTexture: { value: null }, // Texture for drawing
  },
  vertexShader: SphericalFixedVertexShader,
  fragmentShader: SphericalFixedFragmentShader,
})
const textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load('src/textures/earth.jpg');
uvShaderMaterial.uniforms.textureSampler.value = texture;
sphericalShaderMaterial.uniforms.textureSampler.value = texture;
sphericalFixedShaderMaterial.uniforms.textureSampler.value = texture;

var scene =  new THREE.Scene();
var ImgWid : ImageWidget;
var geo_flag = "quad_geo";
var shader_flag = "uv_attribute";
var texturedObject= new THREE.Object3D();
texturedObject = new THREE.Mesh(createQuadGeometry(), uvShaderMaterial);
scene.add(texturedObject);

function callback(changed: utils.KeyValuePair<helper.Settings>) {
  switch (changed.key) {
    case "geometry":
      switch (changed.value){
        case "Quad":
          geo_flag = "quad_geo"
          scene.remove(texturedObject)
          switch(shader_flag){
            case "uv_attribute":
              texturedObject = new THREE.Mesh(createQuadGeometry(), uvShaderMaterial);
              break;
            case "spherical":
              texturedObject = new THREE.Mesh(createQuadGeometry(), sphericalShaderMaterial);
              break;
            case "fixed_spherical":
              texturedObject = new THREE.Mesh(createQuadGeometry(), sphericalFixedShaderMaterial);
              break;
          }
          scene.add(texturedObject)
          break;
        case "Box":
          geo_flag = "box_geo";
          scene.remove(texturedObject)
          switch(shader_flag){
            case "uv_attribute":
              texturedObject = new THREE.Mesh(helper.createBox(), uvShaderMaterial);
              break;
            case "spherical":
              texturedObject = new THREE.Mesh(helper.createBox(), sphericalShaderMaterial);
              break;
            case "fixed_spherical":
              texturedObject = new THREE.Mesh(helper.createBox(), sphericalFixedShaderMaterial);
              break;  
          }
          scene.add(texturedObject)
          break;
        case "Sphere":
          geo_flag = "sphere_geo";
          scene.remove(texturedObject)
          switch(shader_flag){
            case "uv_attribute":
              texturedObject = new THREE.Mesh(helper.createSphere(), uvShaderMaterial);
              break;
            case "spherical":
              texturedObject = new THREE.Mesh(helper.createSphere(), sphericalShaderMaterial);
              break;
            case "fixed_spherical":
              texturedObject = new THREE.Mesh(helper.createSphere(), sphericalFixedShaderMaterial);
              break;
          }
          scene.add(texturedObject)
          break;
        case "Knot":
          geo_flag = "knot_geo";
          scene.remove(texturedObject)
          switch(shader_flag){
            case "uv_attribute":
              texturedObject = new THREE.Mesh(helper.createKnot(), uvShaderMaterial);
              break;
            case "spherical":
              texturedObject = new THREE.Mesh(helper.createKnot(), sphericalShaderMaterial);
              break;
            case "fixed_spherical":
              texturedObject = new THREE.Mesh(helper.createKnot(), sphericalFixedShaderMaterial);
              break;
          }
          scene.add(texturedObject)
          break;
        case "Bunny":
          geo_flag = "bunny_geo";
          scene.remove(texturedObject);
          switch(shader_flag){
            case "uv_attribute":
              texturedObject = new THREE.Mesh(helper.createBunny(), uvShaderMaterial);
              break;
            case "spherical":
              texturedObject = new THREE.Mesh(helper.createBunny(), sphericalShaderMaterial);
              break;
            case "fixed_spherical":
              texturedObject = new THREE.Mesh(helper.createBunny(), sphericalFixedShaderMaterial);
              break;
          }
          scene.add(texturedObject)
          break;
      }
      break;
    case "texture":
      var texturePath: string;
      if (changed.value == helper.Textures.wood_ceiling){
        texturePath = `src/textures/wood_ceiling.jpg`;
      }
      else if(changed.value == helper.Textures.indoor){
        texturePath = 'src/textures/indoor.jpg';
      }
      else{
        texturePath = `src/textures/${changed.value}.jpg`;
      }
      ImgWid.setImage(texturePath);
      texture = textureLoader.load(texturePath);
      uvShaderMaterial.uniforms.textureSampler.value = texture;
      sphericalShaderMaterial.uniforms.textureSampler.value = texture;
      sphericalFixedShaderMaterial.uniforms.textureSampler.value = texture;
      break;
    
    case "shader":
      switch (changed.value){
        case 'UV attribute':
          shader_flag = "uv_attribute"
          scene.remove(texturedObject);
          switch(geo_flag){
            case "quad_geo":
              texturedObject = new THREE.Mesh(createQuadGeometry(), uvShaderMaterial);
              break;
            case "box_geo":
              texturedObject = new THREE.Mesh(helper.createBox(), uvShaderMaterial);
              break;
            case "sphere_geo":
              texturedObject = new THREE.Mesh(helper.createSphere(), uvShaderMaterial);
              break;
            case "knot_geo":
              texturedObject = new THREE.Mesh(helper.createKnot(), uvShaderMaterial);
              break;
            case "bunny_geo":
              texturedObject = new THREE.Mesh(helper.createBunny(), uvShaderMaterial);
              break;
          }
          scene.add(texturedObject);
          break;
        case 'Spherical':
          shader_flag = "spherical"
          scene.remove(texturedObject);
          switch(geo_flag){
            case "quad_geo":
              texturedObject = new THREE.Mesh(createQuadGeometry(), sphericalShaderMaterial);
              break;
            case "box_geo":
              texturedObject = new THREE.Mesh(helper.createBox(), sphericalShaderMaterial);
              break;
            case "sphere_geo":
              texturedObject = new THREE.Mesh(helper.createSphere(), sphericalShaderMaterial);
              break;
            case "knot_geo":
              texturedObject = new THREE.Mesh(helper.createKnot(), sphericalShaderMaterial);
              break;
            case "bunny_geo":
              texturedObject = new THREE.Mesh(helper.createBunny(), sphericalShaderMaterial);
              break;
          }
          scene.add(texturedObject);
          break;
        case 'Spherical (fixed)':
          shader_flag = "fixed_spherical"
          scene.remove(texturedObject);
          switch(geo_flag){
            case "quad_geo":
              texturedObject = new THREE.Mesh(createQuadGeometry(), sphericalFixedShaderMaterial);
              break;
            case "box_geo":
              texturedObject = new THREE.Mesh(helper.createBox(), sphericalFixedShaderMaterial);
              break;
            case "sphere_geo":
              texturedObject = new THREE.Mesh(helper.createSphere(), sphericalFixedShaderMaterial);
              break;
            case "knot_geo":
              texturedObject = new THREE.Mesh(helper.createKnot(), sphericalFixedShaderMaterial);
              break;
            case "bunny_geo":
              texturedObject = new THREE.Mesh(helper.createBunny(), sphericalFixedShaderMaterial);
              break;
          }
          scene.add(texturedObject);
          break;
      }
      break;
    case "environment":

      break;
    case "normalmap":

      break;
    default:
      break;
  }
}


function main(){
  let root = Application("Texturing");
  root.setLayout([["texture", "renderer"]]);
  root.setLayoutColumns(["50%", "50%"]);
  root.setLayoutRows(["100%"]);

  // ---------------------------------------------------------------------------
  // create Settings and create GUI settings
  let settings = new helper.Settings();
  helper.createGUI(settings);
  // adds the callback that gets called on settings change
  settings.addCallback(callback);

  // ---------------------------------------------------------------------------
  let textureDiv = createWindow("texture");
  root.appendChild(textureDiv);
  // the image widget. Change the image with setImage
  // you can enable drawing with enableDrawing
  // and it triggers the event "updated" while drawing
  ImgWid = new ImageWidget(textureDiv);

  // Drawing
  ImgWid.enableDrawing();
  ImgWid.DrawingCanvas.addEventListener('updated', () => { 
    // Convert drawing canvas to texture and update the uniform
    const drawingTexture = new THREE.CanvasTexture(ImgWid.DrawingCanvas);
    uvShaderMaterial.uniforms.drawingTexture.value = drawingTexture;
    sphericalShaderMaterial.uniforms.drawingTexture.value = drawingTexture;
    sphericalFixedShaderMaterial.uniforms.drawingTexture.value = drawingTexture;
  });
  // Clearing Drawing
  settings.pen = function(){
    ImgWid.clearDrawing();
  };
  ImgWid.setImage('src/textures/earth.jpg');

  // ---------------------------------------------------------------------------
  // create RenderDiv
	let rendererDiv = createWindow("renderer");
  root.appendChild(rendererDiv);

  // create renderer
  let renderer = new THREE.WebGLRenderer({
      antialias: true,  // to enable anti-alias and get smoother output
  });

  // create camera
  let camera = new THREE.PerspectiveCamera();
  helper.setupCamera(camera, scene);

  // create controls
  let controls = new OrbitControls(camera, rendererDiv);
  helper.setupControls(controls);

  let wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls);
  wid.animate();
}



// call main entrypoint
main();
