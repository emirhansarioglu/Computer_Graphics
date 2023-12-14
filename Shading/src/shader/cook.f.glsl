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
uniform vec3 specularColor;
uniform float diffuseReflectance;
uniform float specularReflectance; 
uniform vec3 lightPos;
uniform float roughness;

in vec3 vViewDirection;
in vec3 vPositionWorld;
in vec3 vNormal;
out vec4 fragColor;

// main function gets executed for every pixel
void main()
{
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPos - vPositionWorld); 
    vec3 viewDir = normalize(-vViewDirection);

    float NdotV = max(dot(normal, viewDir), 0.0);
    float NdotL = max(dot(normal, lightDir), 0.0);
    vec3 halfVector = normalize(viewDir + lightDir);
    float NdotH = max(dot(normal, halfVector), 0.0);
    float alphaSq = roughness * roughness;

    
    // GGX Distribution Function (D)
    float D;
    if (NdotH > 0.0) {
        float denom = 3.14159 * pow(NdotH * NdotH * (alphaSq  + (1.0 - NdotH * NdotH )/(NdotH * NdotH )), 2.0);
        D = alphaSq / denom;
    } else {
        D = 0.0;
    }
    
    // Smith's Masking Functions (G1 and G2)
    float G1;
    if (NdotV > 0.0) {
        G1 = 2.0 / (1.0 + sqrt(1.0 + (alphaSq - alphaSq * NdotV * NdotV) / (NdotV * NdotV)));
    } else {
        G1 = 0.0;
    }
    float G2;
    if (NdotL > 0.0) {
        G2 = 2.0 / (1.0 + sqrt(1.0 + (alphaSq - alphaSq * NdotL * NdotL) / (NdotL * NdotL)));
    } else {
        G2 = 0.0;
    }
    float G = G1 * G2;
    
    // Schlick's Approximation for F
    vec3 F0 = specularColor; // The specular color should be used as reflectance at normal incidence F0.
    vec3 F = F0 + (1.0 - F0) * pow(1.0 - normalize(dot(viewDir, halfVector)), 5.0);

    vec3 specular = (D * G * F) / (4.0 * max(NdotV, 0.00001) * max(NdotL, 0.00001));
    specular = specular * specularReflectance;

    vec3 lambertDiffuse = diffuseColor * diffuseReflectance * NdotL;
    lambertDiffuse = lambertDiffuse / 3.14159;
    vec3 finalColor = lambertDiffuse + specular;
    fragColor = vec4(finalColor, 1.0);
}
