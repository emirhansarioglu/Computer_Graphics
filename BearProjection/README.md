# Projection / Canonical viewing volume

* Two controllable perspective cameras on teddy bear object: World camera(left) and Screen camera(right)
* Visualized frustrum of screen camera and movable teddy bear
* An extra orthographic camera(middle) on a teddy bear object that moved to Normalized Device Coordinates
* Visualized canonical viewing volume with six clipping planes

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
