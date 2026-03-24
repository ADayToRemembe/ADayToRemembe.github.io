'use client';
import { useEffect, useRef, useState } from 'react';

export default function RocketLaunch() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'idle' | 'ignite' | 'liftoff' | 'gone'>('idle');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && phase === 'idle') {
          // Sequence: idle → ignite (0s) → liftoff (1.8s) → gone (3.2s)
          setPhase('ignite');
          setTimeout(() => setPhase('liftoff'), 1800);
          setTimeout(() => setPhase('gone'), 3200);
        }
      },
      { threshold: 0.4 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [phase]);

  const gone = phase === 'gone';
  const liftoff = phase === 'liftoff' || gone;
  const ignite = phase === 'ignite' || liftoff || gone;

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-6 border-b border-white/5 overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Stars bg layer */}
      <StarField active={ignite} />

      <div className="relative z-10 flex flex-col items-center gap-16">

        {/* ── Artboard ── */}
        <div
          className="artboard-wrap"
          style={{
            transition: gone ? 'transform 0.5s ease-in-out' : 'none',
            transform: gone ? 'rotate(40deg)' : 'rotate(0deg)',
          }}
        >
          <div className="artboard">

            {/* Static stars (fade out on liftoff) */}
            <div className="stars" style={{ opacity: liftoff ? 0 : 1, transition: 'opacity 0.3s ease' }}>
              {[
                { top: '22%', left: '18%' },
                { top: '55%', left: '72%' },
                { top: '35%', left: '60%' },
              ].map((pos, i) => (
                <div key={i} className="star" style={{ position: 'absolute', ...pos }} />
              ))}
            </div>

            {/* Shooting stars (appear on liftoff) */}
            <div className="stars2" style={{ opacity: liftoff ? 1 : 0, transition: 'opacity 0.3s ease' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="shootingstar"
                  style={{
                    '--delay': `${i * 0.18}s`,
                    '--angle': `${30 + i * 12}deg`,
                    '--len': `${30 + Math.random() * 40}px`,
                    top: `${Math.random() * 90}%`,
                    left: `${Math.random() * 90}%`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Smoke */}
            {ignite && (
              <div
                className="smoke"
                style={{
                  transform: liftoff ? 'translateY(-20px) scale(2.5)' : 'translateY(0) scale(1)',
                  opacity: gone ? 0 : 1,
                  transition: liftoff
                    ? 'transform 2s ease-out, opacity 1.5s ease 1s'
                    : 'none',
                }}
              />
            )}

            {/* Rocket */}
            <div
              id="rocket"
              className={ignite && !liftoff ? 'shake' : ''}
              style={{
                transform: liftoff
                  ? gone
                    ? 'translateX(-50%) translateY(-340px) rotate(40deg)'
                    : 'translateX(-50%) translateY(-320px)'
                  : 'translateX(-50%) translateY(0)',
                transition: liftoff
                  ? gone
                    ? 'transform 1.2s cubic-bezier(0.4,0,0.2,1)'
                    : 'transform 1.4s cubic-bezier(0.2,0,0.05,1)'
                  : 'none',
              }}
            >
              <RocketSVG />
            </div>

            {/* Takeoff flames */}
            <div
              className="takeoff"
              style={{
                transform: ignite
                  ? liftoff
                    ? 'translateX(-50%) translateY(-320px) scaleY(1)'
                    : 'translateX(-50%) translateY(0) scaleY(1)'
                  : 'translateX(-50%) translateY(-200px) scaleY(0)',
                opacity: gone ? 0 : 1,
                transition: ignite
                  ? liftoff
                    ? 'transform 1.4s cubic-bezier(0.2,0,0.05,1), opacity 0.4s ease'
                    : 'transform 0.5s cubic-bezier(0.16,1,0.3,1)'
                  : 'none',
              }}
            />
          </div>
        </div>

        {/* ── Text (visible after liftoff, overlaid) ── */}
        <div
          className="text-center max-w-2xl"
          style={{
            opacity: gone ? 1 : 0,
            transform: gone ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
          }}
        >
          <p className="text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-4">
            Engineering in Motion
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Pushing the boundaries<br />of engineering.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Research in CFD, turbulence modeling, and eco-friendly HVAC —
            grounded in the governing equations of fluid mechanics.
          </p>
        </div>
      </div>

      <style>{`
        .artboard-wrap {
          width: 300px;
          height: 300px;
          flex-shrink: 0;
        }
        .artboard {
          position: relative;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          border: 2px solid #6366f1;
          overflow: hidden;
          -webkit-mask-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA5JREFUeNpiYGBgAAgwAAAEAAGbA+oJAAAAAElFTkSuQmCC);
          background: radial-gradient(circle at bottom, rgba(99,102,241,0.25) 0%, rgba(10,10,15,0) 65%);
          box-shadow: 0 0 40px rgba(99,102,241,0.15), inset 0 0 30px rgba(99,102,241,0.08);
        }

        /* Rocket */
        #rocket {
          position: absolute;
          width: 56px;
          left: 50%;
          bottom: 60px;
          z-index: 3;
        }
        #rocket.shake {
          animation: rocketShake 0.12s ease-in-out infinite;
        }
        @keyframes rocketShake {
          0%,100% { transform: translateX(-50%) translateX(0); }
          25%      { transform: translateX(-50%) translateX(2px); }
          75%      { transform: translateX(-50%) translateX(-2px); }
        }

        /* Takeoff flame */
        .takeoff {
          position: absolute;
          width: 28px;
          height: 50px;
          left: 50%;
          bottom: 44px;
          z-index: 2;
          border-radius: 0 0 60% 60%;
          background: radial-gradient(ellipse at 50% 0%, #fef08a 0%, #f97316 40%, #dc2626 80%, transparent 100%);
          filter: blur(2px);
          transform-origin: top center;
          animation: flamePulse 0.12s ease-in-out infinite;
        }
        @keyframes flamePulse {
          0%,100% { transform: translateX(-50%) scaleY(1) scaleX(1); }
          33%      { transform: translateX(-50%) scaleY(1.3) scaleX(0.8); }
          66%      { transform: translateX(-50%) scaleY(0.85) scaleX(1.2); }
        }

        /* Smoke */
        .smoke {
          position: absolute;
          width: 120px;
          height: 60px;
          left: 50%;
          transform: translateX(-50%);
          bottom: 30px;
          z-index: 1;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(148,163,184,0.45) 0%, rgba(100,116,139,0.2) 50%, transparent 80%);
          filter: blur(6px);
        }

        /* Star sparkle */
        .star {
          width: 10px;
          height: 10px;
        }
        .star::before, .star::after {
          content: '';
          position: absolute;
          width: 2px;
          height: 10px;
          background: #e0e7ff;
          border-radius: 50%;
          box-shadow: 0 0 6px 3px rgba(199,210,254,0.2);
          animation: sparkle 1.2s ease-in-out infinite alternate;
        }
        .star::after  { transform: translate(-50%,-50%) rotate(90deg); }
        .star::before { transform: translate(-50%,-50%); }
        @keyframes sparkle {
          from { opacity: 0.4; transform: translate(-50%,-50%) scale(0.8); }
          to   { opacity: 1;   transform: translate(-50%,-50%) scale(1.2); }
        }

        /* Shooting stars */
        .shootingstar {
          position: absolute;
          width: var(--len, 36px);
          height: 1.5px;
          background: linear-gradient(90deg, #c7d2fe, transparent);
          border-radius: 1px;
          transform: rotate(var(--angle, 45deg));
          animation: shoot 0.6s ease-out var(--delay, 0s) infinite;
        }
        @keyframes shoot {
          0%   { opacity: 0; transform: rotate(var(--angle,45deg)) translateX(0); }
          20%  { opacity: 1; }
          100% { opacity: 0; transform: rotate(var(--angle,45deg)) translateX(60px); }
        }
      `}</style>
    </section>
  );
}

function RocketSVG() {
  return (
    <svg width="56" height="140" viewBox="0 0 56 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Nose */}
      <path d="M28 5 C20 22 16 44 14 58 L42 58 C40 44 36 22 28 5Z" fill="#e2e8f0"/>
      {/* Body */}
      <rect x="14" y="58" width="28" height="55" rx="3" fill="#cbd5e1"/>
      {/* Window */}
      <circle cx="28" cy="78" r="7" fill="#1e293b"/>
      <circle cx="28" cy="78" r="5" fill="#6366f1" opacity="0.7"/>
      <circle cx="26" cy="76" r="2" fill="white" opacity="0.5"/>
      {/* Engine */}
      <path d="M14 113 L10 124 L46 124 L42 113Z" fill="#94a3b8"/>
      {/* Fins */}
      <path d="M14 86 L3 113 L14 109Z" fill="#6366f1"/>
      <path d="M42 86 L53 113 L42 109Z" fill="#6366f1"/>
      {/* Stripe */}
      <rect x="14" y="90" width="28" height="7" fill="#818cf8" opacity="0.5"/>
      {/* Nozzle */}
      <ellipse cx="28" cy="124" rx="11" ry="4" fill="#475569"/>
    </svg>
  );
}

function StarField({ active }: { active: boolean }) {
  const stars = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    }))
  ).current;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: 'white',
            opacity: active ? undefined : 0.1,
            animation: active ? `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` : 'none',
            transition: 'opacity 1s ease',
          }}
        />
      ))}
      <style>{`
        @keyframes twinkle {
          0%,100% { opacity:0.2; }
          50%      { opacity:0.9; }
        }
      `}</style>
    </div>
  );
}
