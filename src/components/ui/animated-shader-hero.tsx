import React, { useRef, useEffect } from 'react';
import { GradientButton } from './gradient-button';

interface HeroProps {
  trustBadge?: {
    text: string;
    icons?: string[];
  };
  headline: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  buttons?: {
    primary?: { text: string; href?: string };
    secondary?: { text: string; href?: string };
  };
  className?: string;
}

// ─── WebGL Shader Background ───────────────────────────────────────────────

const spaceShaderSource = `#version 300 es
/*
 * Space nebula shader — adapted from Matthias Hurrle (@atzedent)
 * Colour palette shifted to deep-space blues, indigos and violets.
 */
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p){
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p){
  float t=.0,a=1.;mat2 m=mat2(1.,-.5,.2,1.2);
  for(int i=0;i<5;i++){t+=a*noise(p);p*=2.*m;a*=.5;}
  return t;
}
float clouds(vec2 p){
  float d=1.,t=.0;
  for(float i=.0;i<3.;i++){
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);d=a;p*=2./(i+1.);
  }
  return t;
}

void main(void){
  vec2 uv=(FC-.5*R)/MN, st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.25,-st.y));
  uv*=1.-.3*(sin(T*.15)*.5+.5);

  for(float i=1.;i<12.;i++){
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.35+.1*uv.x);
    vec2 p=uv;
    float d=length(p);

    // Blue-dominant star colours (low red, mid green, bright blue)
    col+=.00125/d*(cos(sin(i)*vec3(3.5,2.0,0.3))+1.);

    // Purple-violet nebula glow
    float b=noise(i+p+bg*1.731);
    col+=.0025*b/length(max(p,vec2(b*p.x*.02,p.y)))*vec3(0.5,0.25,1.4);

    // Deep navy background blend
    col=mix(col,vec3(bg*.015,bg*.04,bg*.22),d);
  }

  // Global cool-shift: boost blue, suppress red
  col.b = min(col.b*1.35, 2.0);
  col.r *= 0.6;
  col.g *= 0.8;

  O=vec4(col,1);
}`;

// ─── Hooks ────────────────────────────────────────────────────────────────

const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    // Compile helpers
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        console.error(gl.getShaderInfoLog(s));
      return s;
    };

    const vertSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

    const vs = compile(gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl.FRAGMENT_SHADER, spaceShaderSource);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes  = gl.getUniformLocation(prog, 'resolution');
    const uTime = gl.getUniformLocation(prog, 'time');

    const resize = () => {
      const dpr = Math.max(1, 0.5 * devicePixelRatio);
      canvas.width  = innerWidth  * dpr;
      canvas.height = innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return canvasRef;
};

// ─── Component ────────────────────────────────────────────────────────────

const AnimatedShaderHero: React.FC<HeroProps> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = '',
}) => {
  const canvasRef = useShaderBackground();

  return (
    <div className={`relative w-full min-h-screen overflow-hidden bg-black ${className}`}>
      <style>{`
        @keyframes shr-fade-down {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shr-fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .shr-fade-down { animation: shr-fade-down 0.8s ease-out forwards; }
        .shr-fade-up   { animation: shr-fade-up 0.8s ease-out forwards; opacity: 0; }
        .shr-d200 { animation-delay: 0.2s; }
        .shr-d400 { animation-delay: 0.4s; }
        .shr-d600 { animation-delay: 0.6s; }
        .shr-d800 { animation-delay: 0.8s; }
      `}</style>

      {/* WebGL canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        style={{ background: 'black' }}
      />

      {/* Dark vignette overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">

        {/* Trust badge */}
        {trustBadge && (
          <div className="mb-8 shr-fade-down">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-950/60 backdrop-blur-md border border-indigo-400/25 rounded-full text-sm text-indigo-200">
              {trustBadge.icons?.map((ic, i) => <span key={i}>{ic}</span>)}
              <span>{trustBadge.text}</span>
            </div>
          </div>
        )}

        {/* Headline */}
        <div className="space-y-2 mb-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight
                         bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300
                         bg-clip-text text-transparent shr-fade-up shr-d200">
            {headline.line1}
          </h1>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight
                         bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400
                         bg-clip-text text-transparent shr-fade-up shr-d400">
            {headline.line2}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="max-w-2xl text-lg md:text-xl text-slate-300/90 font-light leading-relaxed
                      shr-fade-up shr-d600">
          {subtitle}
        </p>

        {/* Buttons */}
        {buttons && (
          <div className="flex flex-col sm:flex-row gap-4 mt-10 shr-fade-up shr-d800">
            {buttons.primary && (
              <GradientButton asChild>
                <a href={buttons.primary.href ?? '#'}>{buttons.primary.text}</a>
              </GradientButton>
            )}
            {buttons.secondary && (
              <GradientButton variant="variant" asChild>
                <a href={buttons.secondary.href ?? '#'}>{buttons.secondary.text}</a>
              </GradientButton>
            )}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs z-10">
        <span className="tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
      </div>
    </div>
  );
};

export default AnimatedShaderHero;
