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

in vec3 trf_normal;
in vec3 viewDir;

out vec4 fragColor;

// main function gets executed for every pixel
void main()
{    
    // Calculate the angle between normal and view direction
    float angle = dot(normalize(trf_normal), normalize(viewDir));

    // Determine color based on intensity thresholds 0.9, 0.6, 0.3
    vec3 color;
    if (angle > 0.9) // threshold1
        color = vec3(0.75, 0.0, 0.0); // Bright Red
    else if (angle > 0.6) // threshold2
        color = vec3(0.5, 0.0, 0.0); 
    else if (angle > 0.3) // threshold3
        color = vec3(0.25, 0.0, 0.0); 
    else
        color = vec3(0.1, 0.0, 0.0); // Pale Red

    fragColor = vec4(color, 1.0);
}
