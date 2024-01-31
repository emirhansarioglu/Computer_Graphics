// custom imports
// external dependencies
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// local from us provided utilities
import * as utils from './lib/utils';
import RenderWidget from './lib/rendererWidget';
import { Application, createWindow } from './lib/window';

import { CanvasWidget } from './canvasWidget';
import { ImageData } from './canvasWidget';
import * as helper from './helper';

var canwid : CanvasWidget;
var camera : THREE.PerspectiveCamera;
var settings : helper.Settings;
var scene : THREE.Scene;
function callback(changed: utils.KeyValuePair<helper.Settings>) {
    switch (changed.key) {
        case "width":
            canwid.changeDimensions(changed.value, canwid.Canvas.height);
            break;
        case "height":
            canwid.changeDimensions(canwid.Canvas.width, changed.value);
            break;
    }
}
// Function to check ray-sphere intersection
function intersectSphere(ray: THREE.Ray, sphere: THREE.Mesh): THREE.Intersection | null {
    let sphereCenter = new THREE.Vector3().copy(sphere.position);
    let sphereRadius = 1/6;

    let rayToSphere = new THREE.Vector3().subVectors(sphereCenter, ray.origin);
    let tca = rayToSphere.dot(ray.direction);
    let d2 = rayToSphere.dot(rayToSphere) - tca * tca;

    if (d2 > sphereRadius * sphereRadius) {
        return null; // No intersection
    }

    let thc = Math.sqrt(sphereRadius * sphereRadius - d2);
    let t0 = tca - thc;
    let t1 = tca + thc;

    if (t0 < 0 && t1 < 0) {
        return null; // Both intersections are behind the ray
    }

    let t = Math.min(t0, t1);
    let intersectionPoint = new THREE.Vector3().copy(ray.direction).multiplyScalar(t).add(ray.origin);

    return {
        distance: ray.origin.distanceTo(intersectionPoint),
        point: intersectionPoint,
        object: sphere,
    };
}


// Function to calculate Blinn-Phong shading
function calculateBlinnPhong(intersection: THREE.Intersection, light: THREE.PointLight): THREE.Color {

    // Check if the object has a material property
    if (!(intersection.object instanceof THREE.Mesh) || !intersection.object.material || !intersection.object.geometry) {
        // Skip non-mesh or objects without materials
        return new THREE.Color(0, 0, 0);
    }

    // Get material properties
    let material = intersection.object.material as THREE.MeshPhongMaterial;
    let color = material.color;
    let specularColor = material.specular 
    let shininess = material.shininess

    // Calculate surface normal in world space
    let normal = intersection.face?.normal.clone() || new THREE.Vector3(); // For triangles
    if (intersection.object.geometry instanceof THREE.SphereGeometry) {
        // For spheres, use normalized vector between sphere origin and intersection point
        let sphereCenter = new THREE.Vector3().copy(intersection.object.position);
        normal = new THREE.Vector3().copy(intersection.point).sub(sphereCenter).normalize();
    }
    normal.transformDirection(intersection.object.matrixWorld);

    // Initialize final color
    let finalColor = new THREE.Color(0, 0, 0);

    // Calculate light vector and distance
    let lightVector = new THREE.Vector3().copy(light.position).sub(intersection.point);
    let lightDistance = lightVector.length();
    lightVector.normalize();
    var in_shadow = false;
    // Shadow check
    if (settings.shadows) {
        let shadowRaycaster = new THREE.Raycaster();
        shadowRaycaster.set(intersection.point, lightVector);
        let shadowIntersects = shadowRaycaster.intersectObjects(scene.children, true);

        // Check if there is an intersection between the point and the light source
        if (shadowIntersects.length > 0 && shadowIntersects[0].distance < lightDistance) {
            in_shadow = true;
        }
    }
    
    // Calculate attenuation
    let attenuation = 1 / (lightDistance * lightDistance);

    // Calculate diffuse component
    let diffuse = Math.max(normal.dot(lightVector), 0);

    // Calculate halfway vector for Blinn-Phong specular component
    let halfwayVector = new THREE.Vector3().addVectors(lightVector, new THREE.Vector3().copy(camera.position).sub(intersection.point).normalize()).normalize();

    // Calculate specular component
    let specular = Math.pow(Math.max(normal.dot(halfwayVector), 0), shininess) * shininess/50.0 ;

    // Calculate final color using Phong model and accumulate
    let diffuseColor = new THREE.Color().copy(color).multiplyScalar(diffuse * attenuation * light.intensity);
    let specularColorComponent = new THREE.Color().copy(specularColor).multiplyScalar(specular * attenuation * light.intensity *4);
    finalColor.addColors(diffuseColor, specularColorComponent);
    if (in_shadow){
        finalColor = new THREE.Color(0, 0, 0);
    }
    return finalColor;
}

function main(){
    let root = Application("Ray Tracing");
    root.setLayout([["left", "renderer"]]);
    root.setLayoutColumns(["50%", "50%"]);
    root.setLayoutRows(["100%"]);

    // ---------------------------------------------------------------------------
    // create Settings and create GUI settings
    settings = new helper.Settings();
    helper.createGUI(settings);
    // adds the callback that gets called on settings change
    settings.addCallback(callback);

    // ---------------------------------------------------------------------------
    let leftDiv = createWindow("left");
    root.appendChild(leftDiv);
    canwid = new CanvasWidget(leftDiv, 256, 256);
    
    // create RenderDiv
    let rendererDiv = createWindow("renderer");
    root.appendChild(rendererDiv);

    // create renderer
    let renderer = new THREE.WebGLRenderer({
        antialias: true,  // to enable anti-alias and get smoother output
    });
    // create scene
    scene =  new THREE.Scene();
    // create camera
    camera = new THREE.PerspectiveCamera();
    helper.setupCamera(camera);
    camera.lookAt(scene.position);
    
    // set up light
    var lights = helper.setupLight(scene);
    helper.setupGeometry(scene);
    // create controls
    let controls = new OrbitControls(camera, rendererDiv);
    helper.setupControls(controls);

    //adding save image function to gui
    settings.saveImg = function(){
        canwid.savePNG("ex5_task5.png");
    };
    // Create raycaster
    let raycaster = new THREE.Raycaster();

    // Render loop for ray tracing (left window)
    function animateRayTracer() {
        // Create ImageData for storing the result
        let imageData = new ImageData(canwid.Canvas.width, canwid.Canvas.height);

        // sort the scene for objects other than planes
        scene.children.sort((a, b) => {
            const isNotPlane = !(a instanceof THREE.Mesh && a.geometry instanceof THREE.PlaneGeometry) &&
                            !(b instanceof THREE.Mesh && b.geometry instanceof THREE.PlaneGeometry);

            if (isNotPlane) {
                const distanceA = a.position.distanceTo(camera.position);
                const distanceB = b.position.distanceTo(camera.position);
                return distanceA - distanceB; // Sort in ascending order based on distance
            }
            // Keep the order of plane objects or if only one is not a plane
            return 0;
        });
        // Iterate over each pixel
        for (let x = 0; x < canwid.Canvas.width; x++) {
            for (let y = 0; y < canwid.Canvas.height; y++) {
                // Normalize coordinates
                let normalizedX = (x / canwid.Canvas.width) * 2 - 1;
                let normalizedY = -(y / canwid.Canvas.height) * 2 + 1;

                // Set ray direction based on normalized coordinates
                raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), camera);

                // Find intersected objects
                let intersects: THREE.Intersection[] = [];
                // Check the "Correct Spheres" checkbox
                if (settings.correctSpheres) {
                    // Iterate over all objects in the sorted scene
                    for (const object of scene.children) {
                        if (object instanceof THREE.Mesh) {
                            // Check if the object is a sphere
                            if (object.geometry instanceof THREE.SphereGeometry) {
                                let intersection = intersectSphere(raycaster.ray, object);
                                if (intersection !== null) {
                                    intersects.push(intersection);
                                }
                            } else {
                                // For other geometries, use intersectObject
                                let intersection = raycaster.intersectObject(object);
                                if (intersection.length > 0) {
                                    intersects.push(intersection[0]);
                                }
                            }
                        }
                    }
                } else {
                    // Use intersectObjects for the entire scene
                    intersects = raycaster.intersectObjects(scene.children);
                }
                // If there is an intersection and the object is a Mesh with a material
                if (intersects.length > 0 && intersects[0].object instanceof THREE.Mesh) {
                    let mesh = intersects[0].object as THREE.Mesh;

                    // Check if the Phong model is enabled in the settings
                    let finalColor = new THREE.Color();
                    if (settings.phong) {
                        if (settings.alllights){
                            finalColor = calculateBlinnPhong(intersects[0], lights[0])
                            finalColor.addColors(calculateBlinnPhong(intersects[0], lights[0]).add(calculateBlinnPhong(intersects[0], lights[1])), calculateBlinnPhong(intersects[0], lights[2]))
                        }else{
                            finalColor = calculateBlinnPhong(intersects[0], lights[0]); 
                        }
                    } else {
                        // Check if the material has a color property
                        if ('color' in mesh.material) {
                            finalColor = (mesh.material as THREE.MeshBasicMaterial).color;
                        }
                    }
                    imageData.setPixel(x, y, finalColor, 1);
                }
            }
        }
        // Render the result to the CanvasWidget
        canwid.setImageData(imageData);
    }
    settings.render = function(){
        animateRayTracer();
    };
    let wid = new RenderWidget(rendererDiv, renderer, camera, scene, controls);
    wid.animate();
}

// call main entrypoint
main();
