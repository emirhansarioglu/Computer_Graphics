# RayTracing
* Left window for Ray Tracing of the scene in the right window
* Ray Tracing using THREE.Raycaster()
* Toggle button in gui for correcting the Ray Tracing on sphere objects
* Toggle button in gui for adding phong illimunation model(optional: all lights button for more light sources)
* Toggle button in gui for adding shadows


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