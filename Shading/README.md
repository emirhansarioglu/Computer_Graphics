# Shading
* Different shaders for 4 objects controllable from gui
* Normal Shader and Toon Shader
* Ambient Shader and Diffuse Light Shader with from gui controllable parameters(color, reflectance)
* Phong illumination model with two common interpolation methods for it: Gouraud and Phong
* Cook-Torrance shader using the Phong interpolation technique with:
  GGX normal distribution function for D, Smith’s masking functions for G, and Schlick’s approximation for F


## Requirements

* node.js
* npm
* browser that supports WebGL


## Installation

Run `npm install` in the root of the project directory.


## Run

The command:

`npm run dev`

will start a webserver on port 5173 (this may change, check the console) combined with a watcher that recompiles every changed (typescript) file within this folder.


## Developing

The main entrypoint is `src/main.ts`. Start there with programming.

The files in `src/lib/` are global utilities that you can use.

Sometimes we also provide some helper files (e.g. `src/helper.ts`) that contains exercise specific functions.
