'use client';
import { useEffect, useRef, useState } from 'react';

/*
  Faithful port of the CodePen rocket animation.
  Original colors ($green:#18F4A3 / $bg:#01191d) replaced with site palette:
    - border/glow   → #6366f1  (indigo-500)
    - inner glow    → rgba(99,102,241,0.3)
    - star/sparkle  → #c7d2fe  (indigo-200)
    - bg            → #0a0a0f
*/

type Phase = 'idle' | 'ignite' | 'launch' | 'gone';

export default function RocketLaunch() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && phase === 'idle') {
          // delay 0.5s before starting so user sees initial state
          setTimeout(() => setPhase('ignite'),   500);
          setTimeout(() => setPhase('launch'),  2600);
          setTimeout(() => setPhase('gone'),    4000);
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [phase]);

  const ignite = phase !== 'idle';
  const launch  = phase === 'launch' || phase === 'gone';
  const gone    = phase === 'gone';

  return (
    <section
      ref={sectionRef}
      className="relative py-20 px-6 border-b border-white/5 overflow-hidden"
      style={{ background: '#0a0a0f', minHeight: '560px' }}
    >
      {/* Ambient bg stars */}
      <BgStars />

      <div className="relative z-10 flex flex-col items-center gap-14">

        {/* ──────────── ARTBOARD ──────────── */}
        <div>
          <div
            className="artboard"
            style={{
              position: 'relative',
              width: 300,
              height: 300,
              borderRadius: '50%',
              border: '2px solid #6366f1',
              overflow: 'hidden',
              // Safari border-radius + overflow fix
              WebkitMaskImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpiYGBgAAgwAAAEAAGbA+oJAAAAAElFTkSuQmCC)',
              backfaceVisibility: 'hidden',
              background: 'radial-gradient(circle at bottom, rgba(99,102,241,0.28) 0%, rgba(10,10,15,0) 60%)',
              boxShadow: '0 0 40px rgba(99,102,241,0.12), inset 0 0 30px rgba(99,102,241,0.06)',
            }}
          >
            {/* Static stars — fade on launch */}
            <div style={{
              opacity: launch ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}>
              <Spark top="37%" left="31%" delay="0s" />
              <Spark top="22%" left="65%" delay="0.4s" />
              <Spark top="60%" left="55%" delay="0.8s" />
            </div>

            {/* Shooting stars — appear on launch */}
            <div style={{
              opacity: launch ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <ShootingStar key={i} i={i} />
              ))}
            </div>

            {/* Smoke — large visible cloud under the nozzle */}
            <div
              style={{
                position: 'absolute',
                width: 160,
                height: 90,
                borderRadius: '50%',
                left: '50%',
                bottom: 10,
                transform: launch
                  ? 'translateX(-50%) translateY(-30px) scale(2.4)'
                  : 'translateX(-50%) translateY(0) scale(1)',
                opacity: ignite ? (gone ? 0 : 1) : 0,
                background: 'radial-gradient(ellipse, rgba(230,235,245,0.85) 0%, rgba(200,210,230,0.55) 45%, transparent 80%)',
                filter: 'blur(10px)',
                transition: launch
                  ? 'transform 2.5s ease-out, opacity 2s ease 0.6s'
                  : 'opacity 0.4s ease',
                zIndex: 1,
              }}
            />

            {/* Takeoff flame — CodePen: from scaleY:0 y:-200 → position */}
            <div
              style={{
                position: 'absolute',
                width: 26,
                height: 52,
                left: '50%',
                /* Rocket bottom is at top:100+80=180px, flame sits just below */
                top: 218,
                transformOrigin: 'top center',
                borderRadius: '0 0 60% 60%',
                background: 'radial-gradient(ellipse at 50% 0%, #fef08a 0%, #f97316 38%, #dc2626 72%, transparent 100%)',
                filter: 'blur(2px)',
                zIndex: 2,
                /* Start hidden (scaleY:0, pushed up), appear on ignite, fly on launch */
                transform: ignite
                  ? launch
                    ? 'translateX(-50%) translateY(-300px) scaleY(1)'
                    : 'translateX(-50%) translateY(0) scaleY(1)'
                  : 'translateX(-50%) translateY(-200px) scaleY(0)',
                opacity: gone ? 0 : 1,
                transition: ignite
                  ? launch
                    ? 'transform 1.4s cubic-bezier(0.2,0,0.05,1), opacity 0.3s ease'
                    : 'transform 0.5s cubic-bezier(0.16,1,0.3,1)'
                  : 'none',
                animation: ignite && !launch ? 'flamePulse 0.13s ease-in-out infinite' : 'none',
              }}
            />

            {/* Rocket — top:100px left:50% (matches CodePen) */}
            <div
              style={{
                position: 'absolute',
                width: 80,
                left: '50%',
                top: 100,
                marginLeft: -40,
                zIndex: 3,
                transform: launch ? 'translateY(-200px)' : 'translateY(0)',
                transition: launch
                  ? 'transform 1.6s cubic-bezier(0.2,0,0.05,1)'
                  : 'none',
                animation: ignite && !launch ? 'rocketShake 0.12s ease-in-out infinite' : 'none',
              }}
            >
              <RocketSVG />
            </div>


          </div>
        </div>

        {/* ──────────── TEXT (appears after liftoff) ──────────── */}
        <div
          className="text-center max-w-2xl"
          style={{
            opacity: gone ? 1 : 0,
            transform: gone ? 'translateY(0)' : 'translateY(28px)',
            transition: 'opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s',
          }}
        >
          <p className="text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-4">
            Engineering in Motion
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ textShadow: '0 2px 20px rgba(99,102,241,0.3)' }}>
            Pushing the boundaries<br />of engineering.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Research in CFD, turbulence modeling, and eco-friendly HVAC —
            grounded in the governing equations of fluid mechanics.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes rocketShake {
          0%,100% { transform: translateY(0) translateX(0); }
          25%      { transform: translateY(0) translateX(2px); }
          75%      { transform: translateY(0) translateX(-2px); }
        }
        @keyframes flamePulse {
          0%,100% { transform: translateX(-50%) scaleY(1)   scaleX(1);   }
          33%      { transform: translateX(-50%) scaleY(1.35) scaleX(0.8); }
          66%      { transform: translateX(-50%) scaleY(0.8)  scaleX(1.2); }
        }
        @keyframes sparkle {
          from { opacity: 0.3; transform: translate(-50%,-50%) scale(0.8); }
          to   { opacity: 1;   transform: translate(-50%,-50%) scale(1.3); }
        }
        @keyframes sparkle90 {
          from { opacity: 0.3; transform: translate(-50%,-50%) rotate(90deg) scale(0.8); }
          to   { opacity: 1;   transform: translate(-50%,-50%) rotate(90deg) scale(1.3); }
        }
        @keyframes shoot {
          0%   { opacity: 0;   transform: rotate(var(--a)) translateX(0); }
          15%  { opacity: 1; }
          100% { opacity: 0;   transform: rotate(var(--a)) translateX(70px); }
        }
        @keyframes bgTwinkle {
          0%,100% { opacity: 0.15; }
          50%      { opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}

/* ── Sparkle star (cross shape, matches CodePen .star::before/after) ── */
function Spark({ top, left, delay }: { top: string; left: string; delay: string }) {
  return (
    <div style={{ position: 'absolute', top, left, width: 10, height: 10 }}>
      <span style={{
        position: 'absolute', width: 3, height: 10,
        background: '#c7d2fe', borderRadius: '50%',
        boxShadow: '0 0 6px 3px rgba(199,210,254,0.15)',
        animation: `sparkle 1s ease-in-out ${delay} infinite alternate`,
        transform: 'translate(-50%,-50%)',
      }} />
      <span style={{
        position: 'absolute', width: 3, height: 10,
        background: '#c7d2fe', borderRadius: '50%',
        boxShadow: '0 0 6px 3px rgba(199,210,254,0.15)',
        animation: `sparkle90 1s ease-in-out ${delay} infinite alternate`,
        transform: 'translate(-50%,-50%) rotate(90deg)',
      }} />
    </div>
  );
}

/* ── Shooting star ── */
function ShootingStar({ i }: { i: number }) {
  const angle = 20 + i * 17;
  const len   = 28 + (i % 4) * 12;
  return (
    <div style={{
      position: 'absolute',
      top:  `${5 + (i * 13) % 85}%`,
      left: `${5 + (i * 19) % 85}%`,
      width: len,
      height: 1.5,
      background: 'linear-gradient(90deg, #818cf8, transparent)',
      borderRadius: 1,
      '--a': `${angle}deg`,
      animation: `shoot ${0.5 + (i % 3) * 0.2}s ease-out ${(i * 0.14).toFixed(2)}s infinite`,
    } as React.CSSProperties} />
  );
}

/* ── Rocket SVG — original CodePen design (green/teal palette) ── */
function RocketSVG() {
  return (
    <svg
      width="80"
      viewBox="0 0 154.1 259.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .st0{fill:#1d4ed8;}
        .st1{fill:#f0f4ff;}
        .st5{opacity:0.55;fill:#bfdbfe;}
        .st6{opacity:0.7;fill:#1e3a8a;}
        .st10{fill:#eff6ff;}
        .st11{fill:#1e3a8a;}
        .st12{fill:#3b82f6;}
      `}</style>
      {/* Fins + base */}
      <path className="st0" d="M97.4 236.1c0 2.6-5.2 4.7-11.7 4.7H70.3c-6.4 0-11.7-2.1-11.7-4.7v-4.5c0-2.6 5.2-4.7 11.7-4.7h15.4c6.4 0 11.7 2.1 11.7 4.7v4.5zM37.1 137.4s-28 19.2-28 32v59.3l30-30-2-61.3zM117.5 137.4s28 19.2 28 32v59.3l-30-30 2-61.3z"/>
      {/* Main body */}
      <path className="st1" d="M29.6 140.5c.3 36.4 8.3 69.6 21.3 95.3 8.6-2.8 17.7-4.4 27.2-4.4 9.5-.1 18.6 1.3 27.3 4 12.5-25.9 19.9-59.3 19.6-95.6-.6-57.8-20.4-107.7-48.8-132-28.1 24.8-47.1 75-46.6 132.7z"/>
      {/* Body highlight */}
      <path className="st5" d="M60.2 233.7l12-1.9c-18.3-108.4-8.6-169-8.6-169l-11.4.4c-22 76.5 8 170.5 8 170.5z"/>
      {/* Dark stripe between body and nose */}
      <path className="st6" d="M41.5 64l-2.1 6.7s40.7-5 75.7.1l-3.2-7.4c-.1 0-47.1-5.4-70.4.6z"/>
      {/* Nose cone */}
      <path className="st0" d="M41.5 64c11.4-.9 23.2-1.4 35.2-1.5 12-.1 23.7.2 35.2.9-8.6-23.7-21-43-35.6-55.6C61.7 20.6 49.7 40.2 41.5 64z"/>
      {/* Nose highlight */}
      <path className="st10" d="M63.6 62.7C65.7 35.3 76.2 7.8 76.2 7.8c-18.9 24.2-24 55.3-24 55.3l11.4-.4z"/>
      {/* Window 1 */}
      <path className="st11" d="M75.9 78.3c-14.8.1-26.7 12.2-26.6 27 .1 14.8 12.2 26.7 27 26.6 14.8-.1 26.7-12.2 26.5-27-.1-14.9-12.2-26.8-26.9-26.6z"/>
      <path className="st12" d="M75.9 86.4c-10.3.1-18.5 8.5-18.5 18.8.1 10.3 8.5 18.5 18.8 18.4 10.3-.1 18.5-8.5 18.4-18.8 0-10.2-8.4-18.5-18.7-18.4z"/>
      <path className="st0" d="M68.6 122.1c2.3 1 4.9 1.6 7.7 1.6 10.3-.1 18.5-8.5 18.4-18.8 0-3.6-1.1-7-3-9.9-.3.3-.7.5-1 .8-8.1 6.6-18.2 15.6-22.1 26.3z"/>
      {/* Window 2 */}
      <path className="st11" d="M79 139.9c-11.1.1-20 9.2-19.9 20.3.1 11.1 9.2 20 20.3 19.9 11.1-.1 20-9.2 19.9-20.3-.1-11-9.2-20-20.3-19.9z"/>
      <path className="st12" d="M79.1 146.1c-7.7.1-13.9 6.4-13.8 14.1.1 7.7 6.4 13.9 14.1 13.8 7.7-.1 13.9-6.4 13.8-14.1-.1-7.7-6.4-13.9-14.1-13.8z"/>
      <path className="st0" d="M73.5 172.8c1.8.8 3.7 1.2 5.8 1.2 7.7-.1 13.9-6.4 13.8-14.1 0-2.7-.8-5.3-2.2-7.4-.3.2-.5.4-.8.6-6 4.9-13.6 11.7-16.6 19.7z"/>
      {/* Window 3 */}
      <path className="st11" d="M81.5 187.9c-7.8.1-14.1 6.5-14 14.3.1 7.8 6.5 14.1 14.3 14.1 7.8-.1 14.1-6.5 14-14.3-.1-7.8-6.5-14.2-14.3-14.1z"/>
      <path className="st12" d="M81.5 192.2c-5.4 0-9.8 4.5-9.8 9.9s4.5 9.8 9.9 9.8 9.8-4.5 9.8-9.9-4.5-9.8-9.9-9.8z"/>
      <path className="st0" d="M77.6 211.1c1.2.5 2.6.9 4.1.8 5.4 0 9.8-4.5 9.8-9.9 0-1.9-.6-3.7-1.6-5.2-.2.1-.4.3-.5.4-4.3 3.5-9.7 8.3-11.8 13.9z"/>
    </svg>
  );
}

/* ── Background ambient stars ── */
function BgStars() {
  const stars = useRef(
    Array.from({ length: 55 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, y: Math.random() * 100,
      s: 0.5 + Math.random() * 1.5,
      d: Math.random() * 4, dur: 2 + Math.random() * 3,
    }))
  ).current;
  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s, borderRadius: '50%', background: 'white',
          animation: `bgTwinkle ${s.dur}s ease-in-out ${s.d}s infinite`,
        }} />
      ))}
    </div>
  );
}
