uniform sampler2D textureSampler;
uniform sampler2D drawingTexture;
in vec2 vUv;

void main()
{
  vec4 baseColor = texture(textureSampler, vUv);
  vec4 drawingColor = texture(drawingTexture, vUv);
  gl_FragColor = baseColor * (1.0 - drawingColor.a) + drawingColor;
}
