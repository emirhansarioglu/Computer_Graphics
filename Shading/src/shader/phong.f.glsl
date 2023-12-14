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
uniform vec3 ambientColor;
uniform vec3 specularColor;
uniform float ambientReflectance;
uniform float diffuseReflectance;
uniform float specularReflectance; 
uniform float shininess; 
uniform vec3 lightPos;

in vec3 vPositionWorld;
in vec3 vNormal;
in vec3 vViewDirection;
out vec4 fragColor;

// main function gets executed for every pixel
void main()
{
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPos - vPositionWorld); 
    vec3 viewDir = normalize(vViewDirection);
    vec3 reflectDir = reflect(-lightDir, normal);

    float diffuseIntensity = max(dot(normal, lightDir), 0.0);
    float specularintensity = 0.0;
    if (diffuseIntensity > 0.0){
        specularintensity = pow(max(dot(reflectDir, viewDir), 0.0), shininess); // shininess = magnitude
    }
    vec3 ambient = ambientColor * ambientReflectance;
    vec3 diffuse = diffuseColor * diffuseIntensity * diffuseReflectance ;
    vec3 specular = specularColor * specularintensity * specularReflectance;
    vec3 phong = ambient + diffuse + specular;
    fragColor = vec4(phong, 1.0) ;
}
