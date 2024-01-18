uniform sampler2D textureSampler;
uniform sampler2D drawingTexture;
in vec3 vPosition;
#define PI 3.1415926535897932384626433832795

void main() 
{
    vec3 positionRelativeToCenter = vPosition - vec3(0.0, 0.0, 0.0); // Center is accepted (0,0,0) 
    float u = (PI + atan(-positionRelativeToCenter.z, positionRelativeToCenter.x)) / (2.0 * PI);
    float v = (atan(positionRelativeToCenter.y, sqrt(pow(positionRelativeToCenter.x, 2.0) + pow(positionRelativeToCenter.z, 2.0))) + PI/2.0) / PI;
    vec2 vUv = vec2(u, v);

    vec4 baseColor = texture(textureSampler, vUv);
    vec4 drawingColor = texture(drawingTexture, vUv);
    gl_FragColor = baseColor * (1.0 - drawingColor.a) + drawingColor;
}