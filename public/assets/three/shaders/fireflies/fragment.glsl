void main()
{
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    gl_FragColor = vec4(gl_PointCoord, 1.0, 1.0);
}