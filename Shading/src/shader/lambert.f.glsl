// defines the precision
precision highp float;

// we have access to the same uniforms as in the vertex shader
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


uniform vec3 diffuseColor;
uniform float diffuseReflectance;
uniform vec3 lightPos;

in vec3 vPositionWorld;
in vec3 vNormal;
out vec4 fragColor;

// main function gets executed for every pixel
void main()
{
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPos - vPositionWorld); 
    float diffuseIntensity = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diffuseColor * diffuseIntensity * diffuseReflectance ;
    fragColor = vec4(diffuse, 1.0) ;
}
