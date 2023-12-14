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


in vec3 vPositionWorld;
in vec3 vNormal;
in vec3 vColor; 

uniform vec3 lightPos;
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float ambientReflectance;
uniform float diffuseReflectance;
uniform float specularReflectance;
uniform float shininess;

out vec4 fragColor;

// main function gets executed for every vertex
void main()
{
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPos - vPositionWorld);
    vec3 viewDir = normalize(-vPositionWorld);

    vec3 reflectDir = reflect(-lightDir, normal);
    float specularIntensity = pow(max(dot(reflectDir, viewDir), 0.0), shininess);

    vec3 specular = specularReflectance * specularColor * specularIntensity;

    vec3 result = vColor + specular;
    fragColor = vec4(result, 1.0);
}
