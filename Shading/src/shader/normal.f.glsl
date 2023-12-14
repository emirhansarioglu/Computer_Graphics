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
uniform mat3 normalizedMatrix;

// = camera position in world space
uniform vec3 cameraPosition;

in vec3 vNormal;
out vec4 fragColor;

// main function gets executed for every pixel
void main()
{
    vec3 normalRGB = normalize(vNormal) * 0.5 + 0.5; // Map normals to RGB space ([-1,1]->[0,1])
    fragColor = vec4(normalRGB, 1.0); // Output normalized RGB color
}
