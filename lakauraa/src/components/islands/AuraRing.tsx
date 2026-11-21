// Objet 3D iridescent : l'anneau de la marque (tore + point rouge), rendu par un shader WebGL fait main (≈ 4 Ko, sans Three.js).
// Matière : irisation par interférence (reflets qui glissent du bleu au violet au rouge selon l'angle de vue),
// strictement dans la palette de Lakauraa. Réagit à la souris. Pause hors écran / onglet masqué.
// Animations réduites ou WebGL absent : on garde l'anneau SVG statique placé dessous.
import { useEffect, useRef } from 'react';

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision mediump float;
uniform vec2 uRes; uniform float uT; uniform vec2 uM;
mat3 rot(vec2 a){ float cx=cos(a.x),sx=sin(a.x),cy=cos(a.y),sy=sin(a.y);
  return mat3(cy,0.,-sy, 0.,1.,0., sy,0.,cy) * mat3(1.,0.,0., 0.,cx,sx, 0.,-sx,cx); }
float torus(vec3 p){ vec2 q = vec2(length(p.xz) - 0.78, p.y); return length(q) - 0.2; }
float dotS(vec3 p){ float a = uT*0.9 + 0.8; return length(p - vec3(cos(a)*0.78, 0.0, sin(a)*0.78)) - 0.2; }
float map(vec3 p, out float id){ float t = torus(p), d = dotS(p); id = d < t ? 1.0 : 0.0; return min(t, d); }
vec3 pal(float h){ // bleu -> violet -> rouge -> violet -> bleu (couleurs du logo)
  vec3 b = vec3(0.118,0.42,1.0), v = vec3(0.48,0.25,0.84), r = vec3(0.88,0.07,0.18);
  float x = abs(fract(h) * 2.0 - 1.0); // 0..1..0
  return x < 0.5 ? mix(b, v, x*2.0) : mix(v, r, (x-0.5)*2.0);
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
  vec3 ro = vec3(0.0, 0.0, -3.1), rd = normalize(vec3(uv * 1.25, 1.6));
  mat3 R = rot(vec2(-0.95 + uM.y*0.5, uT*0.28 + uM.x*0.9));
  ro = R * ro; rd = R * rd;
  float t = 0.0, id = 0.0, md = 10.0; bool hit = false;
  for (int i = 0; i < 56; i++){ vec3 p = ro + rd*t; float d = map(p, id); md = min(md, d);
    if (d < 0.0015){ hit = true; break; } t += d; if (t > 6.0) break; }
  vec4 col = vec4(0.0);
  if (hit){
    vec3 p = ro + rd*t; float tmp; vec2 e = vec2(0.002, 0.0);
    vec3 n = normalize(vec3(map(p+e.xyy,tmp)-map(p-e.xyy,tmp), map(p+e.yxy,tmp)-map(p-e.yxy,tmp), map(p+e.yyx,tmp)-map(p-e.yyx,tmp)));
    float fr = pow(1.0 - max(dot(n, -rd), 0.0), 2.2);
    if (id > 0.5){ col = vec4(vec3(0.95,0.12,0.22) * (0.65 + 0.6*fr) + 0.35*fr, 1.0); }
    else {
      float h = dot(n, normalize(vec3(0.35,0.8,0.45))) * 0.9 + fr * 1.7 + uT*0.05; // irisation : dépend de l'angle de vue
      vec3 base = pal(h);
      vec3 l = normalize(vec3(-0.5,0.8,-0.6)); float dif = max(dot(n,l),0.0);
      float spec = pow(max(dot(reflect(rd,n), l), 0.0), 36.0);
      vec3 c = base * (0.28 + 0.8*dif) + pal(h + 0.33) * fr * 0.55 + vec3(1.0) * spec * 0.9;
      col = vec4(c, 1.0);
    }
  } else {
    float a = smoothstep(0.012, 0.0, md); // bord lissé (anticrénelage)
    col = vec4(pal(uT*0.05) * 0.6 * a, a);
  }
  gl_FragColor = vec4(col.rgb * col.a, col.a); // alpha prémultiplié
}`;

export default function AuraRing() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(pr, 'uRes'), uT = gl.getUniformLocation(pr, 'uT'), uM = gl.getUniformLocation(pr, 'uM');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const size = () => { const r = cv.getBoundingClientRect(); const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } gl.viewport(0, 0, cv.width, cv.height); };
    let mx = 0, my = 0, tx = 0, ty = 0, raf = 0, visible = true, t0 = performance.now();
    const draw = (now: number) => {
      raf = 0; size(); mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uT, reduced ? 1.2 : (now - t0) / 1000); gl.uniform2f(uM, mx, my);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      cv.dataset.ready = '1';
      if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    const onMove = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2; };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }); io.observe(cv);
    const onVis = () => { if (!document.hidden) kick(); };
    if (!reduced) { window.addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('visibilitychange', onVis); }
    kick();
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', onVis); gl.getExtension('WEBGL_lose_context')?.loseContext(); };
  }, []);
  return <canvas ref={ref} className="aura-ring__cv" aria-hidden="true" />;
}
