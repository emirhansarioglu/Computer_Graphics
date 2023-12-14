// These uniforms and attributes are provided by threejs.
// If you want to add your own, look at https://threejs.org/docs/#api/en/materials/ShaderMaterial #Custom attributes and uniforms
// defines the precision
precision highp float;

// = object.matrixWorld
uniform mat4 modelMatrix;

// = camera.matrixWorldInverse * object.matrixWorld
uniform mat4 modelViewMatrix;

// = camera.projectionMatrix
uniform mat4 projectionMatrix;

// = camera.matrixWorldInverse
uniform mat4 viewMatrix;

// = inverse transpose of modelViewMatrix
uniform mat3 normalMatrix;

// = camera position in world space
uniform vec3 cameraPosition;

uniform vec3 lightPos;
// default vertex attributes provided by Geometry and BufferGeometry
in vec3 position;
in vec3 normal;
in vec2 uv;

out vec3 vViewDirection;
out vec3 vPositionWorld;
out vec3 vNormal;

// main function gets executed for every vertex
void main()
{
    vNormal = normalize(normal); 
    vPositionWorld = (modelMatrix * vec4(position, 1.0)).xyz; // Calculate world space position
    vViewDirection = normalize(modelViewMatrix * vec4(position, 1.0)).xyz; 
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
