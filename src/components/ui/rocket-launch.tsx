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
        <div
          style={{
            transition: gone ? 'transform 0.4s ease-in-out' : 'none',
            transform:  gone ? 'rotate(40deg)' : 'rotate(0deg)',
          }}
        >
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

            {/* Smoke */}
            <div
              style={{
                position: 'absolute',
                width: 130,
                height: 70,
                borderRadius: '50%',
                left: '50%',
                bottom: 30,
                transform: launch
                  ? 'translateX(-50%) translateY(-20px) scale(2.2)'
                  : 'translateX(-50%) translateY(0) scale(1)',
                opacity: ignite ? (gone ? 0 : 0.85) : 0,
                background: 'radial-gradient(ellipse, rgba(148,163,184,0.4) 0%, rgba(100,116,139,0.15) 55%, transparent 80%)',
                filter: 'blur(8px)',
                transition: launch
                  ? 'transform 2.5s ease-out, opacity 1.8s ease 0.8s'
                  : 'opacity 0.5s ease',
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
                top: 182,
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
                transform: launch
                  ? gone
                    ? 'translateY(-300px) rotate(40deg)'
                    : 'translateY(-300px)'
                  : 'translateY(0)',
                transition: launch
                  ? gone
                    ? 'transform 1.2s cubic-bezier(0.4,0,0.2,1)'
                    : 'transform 1.4s cubic-bezier(0.2,0,0.05,1)'
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

/* ── Rocket SVG — shape identical to CodePen, indigo palette ── */
function RocketSVG() {
  return (
    <svg width="80" height="160" viewBox="0 0 80 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Nose cone */}
      <path d="M40 6 C30 26 24 50 22 68 L58 68 C56 50 50 26 40 6Z" fill="#e0e7ff"/>
      {/* Body */}
      <rect x="22" y="68" width="36" height="62" rx="3" fill="#c7d2fe"/>
      {/* Stripe */}
      <rect x="22" y="100" width="36" height="10" fill="#818cf8" opacity="0.6"/>
      {/* Window */}
      <circle cx="40" cy="86" r="9" fill="#1e1b4b"/>
      <circle cx="40" cy="86" r="7" fill="#6366f1" opacity="0.8"/>
      <circle cx="37" cy="83" r="2.5" fill="white" opacity="0.5"/>
      {/* Engine */}
      <path d="M22 130 L17 144 L63 144 L58 130Z" fill="#a5b4fc"/>
      {/* Nozzle */}
      <ellipse cx="40" cy="144" rx="14" ry="5" fill="#6366f1"/>
      {/* Left fin */}
      <path d="M22 98 L6 130 L22 126Z" fill="#6366f1"/>
      {/* Right fin */}
      <path d="M58 98 L74 130 L58 126Z" fill="#6366f1"/>
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
