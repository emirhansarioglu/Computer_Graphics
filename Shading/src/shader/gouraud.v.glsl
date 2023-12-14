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

// default vertex attributes provided by Geometry and BufferGeometry
in vec3 position;
in vec3 normal;
in vec2 uv;

out vec3 vPositionWorld;
out vec3 vNormal;
out vec3 vColor; 

uniform vec3 lightPos;
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float ambientReflectance;
uniform float diffuseReflectance;
uniform float specularReflectance;
uniform float shininess;

// main function gets executed for every vertex
void main()
{
    vec3 normal = normalize(normalMatrix * normal);
    vec3 lightDir = normalize(lightPos - (modelMatrix * vec4(position, 1.0)).xyz);
    float diffuseIntensity = max(dot(normal, lightDir), 0.0);
    
    vec3 ambient = ambientColor * ambientReflectance ;
    vec3 diffuse = diffuseReflectance * diffuseColor * diffuseIntensity;

    vColor = ambient + diffuse;
    vPositionWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
