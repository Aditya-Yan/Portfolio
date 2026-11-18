// Camera and orbital geometry are independent of the rendering surface.
export const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
export const dot = (a, b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export const cross = (a, b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const normalize = v => { const length=Math.hypot(...v)||1;return v.map(n=>n/length); };
export function multiply(a, b) {
  return normalize([
    a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],
    a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],
    a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],
    a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]
  ]);
}
export function rotate(v, q) {
  const uv=cross(q,v),uuv=cross(q,uv);
  return v.map((n,i)=>n+2*(q[3]*uv[i]+uuv[i]));
}
export function arcball(x, y, width, height) {
  const radius=Math.min(width,height)*.48;
  const px=(x-width/2)/radius,py=(height/2-y)/radius,d=px*px+py*py;
  return d>1?normalize([px,py,0]):[px,py,Math.sqrt(1-d)];
}
export function between(a, b) {
  const cosine=dot(a,b);
  if(cosine<-.99999) return [...normalize(cross(a,Math.abs(a[0])<.8?[1,0,0]:[0,1,0])),0];
  return normalize([...cross(a,b),1+cosine]);
}
export function axisAngle(axis, angle) {
  const n=normalize(axis),s=Math.sin(angle/2);
  return [n[0]*s,n[1]*s,n[2]*s,Math.cos(angle/2)];
}
export function orbitPoint(orbit, angle) {
  const a=Math.cos(angle)*orbit.radius,b=Math.sin(angle)*orbit.radius*orbit.eccentricity;
  return orbit.u.map((v,i)=>v*a+orbit.v[i]*b);
}
export function project(point, camera) {
  const p=rotate(point,camera.orientation);
  const perspective=camera.distance/(camera.distance-p[2]);
  return {x:camera.x+p[0]*camera.scale*camera.zoom*perspective,y:camera.y-p[1]*camera.scale*camera.zoom*perspective,z:p[2],perspective};
}
