out vec2 vUv;
#define PI 3.1415926535897932384626433832795
void main()
{
  vec3 positionRelativeToCenter = position - vec3(0.0, 0.0, 0.0); // Center is accepted (0,0,0)
  float u = (atan(-positionRelativeToCenter.z, positionRelativeToCenter.x) + PI) / (2.0 * PI);
  float v = (atan(positionRelativeToCenter.y, sqrt(pow(positionRelativeToCenter.x, 2.0) + pow(positionRelativeToCenter.z, 2.0))) + PI / 2.0) / PI;
  vUv = vec2(u, v);
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
