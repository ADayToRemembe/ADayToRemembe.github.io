'use client';
import { useEffect, useRef, useState } from 'react';

export default function RocketLaunch() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [launched, setLaunched] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !launched) {
          setLaunched(true);
          setTimeout(() => setSettled(true), 2200);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [launched]);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden border-b border-white/5"
      style={{ background: 'linear-gradient(to bottom, #0a0a0f 0%, #0d0f23 60%, #0a0a0f 100%)' }}
    >
      {/* Background stars */}
      <Stars />

      {/* Title */}
      <div className="relative z-10 text-center mb-16">
        <p className="text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-3">
          Engineering in Motion
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Pushing the boundaries of engineering.
        </h2>
      </div>

      {/* Rocket scene */}
      <div className="relative z-10 flex justify-center">
        <div className="relative" style={{ width: 120, height: 420 }}>

          {/* Speed lines (visible during launch) */}
          {launched && !settled && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-indigo-400/20 rounded-full animate-speed-line"
                  style={{
                    width: 2,
                    height: 40 + Math.random() * 60,
                    left: `${10 + i * 12}%`,
                    top: `${20 + (i % 3) * 15}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.4s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Rocket body */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: launched ? (settled ? 120 : undefined) : 0,
              top: launched && !settled ? undefined : undefined,
              transform: `translateX(-50%)`,
              transition: launched
                ? settled
                  ? 'none'
                  : 'bottom 2s cubic-bezier(0.2, 0, 0.1, 1)'
                : 'none',
              animation: launched && !settled ? 'rocketRise 2s cubic-bezier(0.2,0,0.1,1) forwards' : 'none',
            }}
          >
            <RocketSVG settled={settled} launched={launched} />
          </div>

          {/* Smoke clouds at base */}
          {launched && <SmokeEffect settled={settled} />}
        </div>
      </div>

      <style>{`
        @keyframes rocketRise {
          0%   { transform: translateX(-50%) translateY(0px); }
          30%  { transform: translateX(-50%) translateY(-60px); }
          60%  { transform: translateX(-50%) translateY(-160px); }
          85%  { transform: translateX(-50%) translateY(-230px); }
          100% { transform: translateX(-50%) translateY(-250px); }
        }
        @keyframes flamePulse {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 1; }
          25%       { transform: scaleY(1.3) scaleX(0.85); opacity: 0.95; }
          50%       { transform: scaleY(0.85) scaleX(1.1); opacity: 1; }
          75%       { transform: scaleY(1.15) scaleX(0.9); opacity: 0.9; }
        }
        @keyframes flameInner {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          33%       { transform: scaleY(1.4) scaleX(0.8); }
          66%       { transform: scaleY(0.8) scaleX(1.2); }
        }
        @keyframes smokeDrift {
          0%   { transform: translateY(0) translateX(0) scale(0.4); opacity: 0.7; }
          50%  { opacity: 0.4; }
          100% { transform: translateY(60px) translateX(var(--dx, 20px)) scale(2.5); opacity: 0; }
        }
        @keyframes rocketHover {
          0%, 100% { transform: translateX(-50%) translateY(-250px); }
          50%       { transform: translateX(-50%) translateY(-256px); }
        }
        @keyframes speedLine {
          0%   { opacity: 0.6; transform: translateY(-20px); }
          100% { opacity: 0; transform: translateY(60px); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        .animate-speed-line {
          animation: speedLine 0.4s ease-in infinite;
        }
      `}</style>
    </section>
  );
}

function RocketSVG({ settled, launched }: { settled: boolean; launched: boolean }) {
  return (
    <div
      style={{
        animation: settled ? 'rocketHover 3s ease-in-out infinite' : 'none',
        transform: 'translateX(-50%)',
        position: 'relative',
        width: 70,
      }}
    >
      <svg width="70" height="180" viewBox="0 0 70 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Nose cone */}
        <path d="M35 10 C25 30 20 55 18 75 L52 75 C50 55 45 30 35 10Z" fill="#e2e8f0" />
        {/* Body */}
        <rect x="18" y="75" width="34" height="70" rx="3" fill="#cbd5e1" />
        {/* Window */}
        <circle cx="35" cy="100" r="8" fill="#1e293b" />
        <circle cx="35" cy="100" r="6" fill="#3b82f6" opacity="0.6" />
        <circle cx="33" cy="98" r="2" fill="white" opacity="0.5" />
        {/* Engine bottom */}
        <path d="M18 145 L14 158 L56 158 L52 145Z" fill="#94a3b8" />
        {/* Left fin */}
        <path d="M18 110 L4 145 L18 140Z" fill="#6366f1" />
        {/* Right fin */}
        <path d="M52 110 L66 145 L52 140Z" fill="#6366f1" />
        {/* Stripe */}
        <rect x="18" y="115" width="34" height="8" fill="#6366f1" opacity="0.6" />
        {/* Nozzle */}
        <ellipse cx="35" cy="158" rx="14" ry="5" fill="#475569" />
      </svg>

      {/* Flame */}
      {launched && (
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            transformOrigin: 'top center',
          }}
        >
          {/* Outer flame */}
          <div
            style={{
              width: 28,
              height: 55,
              background: 'radial-gradient(ellipse at 50% 0%, #f97316 0%, #dc2626 45%, #7c2d12 85%, transparent 100%)',
              borderRadius: '0 0 60% 60%',
              transformOrigin: 'top center',
              animation: 'flamePulse 0.15s ease-in-out infinite',
              filter: 'blur(1px)',
            }}
          />
          {/* Inner core */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 14,
              height: 40,
              background: 'radial-gradient(ellipse at 50% 0%, #fef08a 0%, #fbbf24 40%, #f97316 80%, transparent 100%)',
              borderRadius: '0 0 60% 60%',
              transformOrigin: 'top center',
              animation: 'flameInner 0.12s ease-in-out infinite',
            }}
          />
          {/* Bright core tip */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 6,
              height: 18,
              background: 'radial-gradient(ellipse at 50% 0%, white 0%, #fef9c3 60%, transparent 100%)',
              borderRadius: '0 0 50% 50%',
              transformOrigin: 'top center',
            }}
          />
        </div>
      )}
    </div>
  );
}

function SmokeEffect({ settled }: { settled: boolean }) {
  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      dx: (Math.random() - 0.5) * 80,
      size: 20 + Math.random() * 30,
      delay: Math.random() * 1.2,
      duration: 1.5 + Math.random() * 1.5,
      x: 40 + (Math.random() - 0.5) * 30,
    }))
  ).current;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 200,
        height: 120,
        pointerEvents: 'none',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: 10,
            left: p.x,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(148,163,184,0.5) 0%, rgba(100,116,139,0.2) 60%, transparent 100%)',
            animation: `smokeDrift ${p.duration}s ease-out ${p.delay}s infinite`,
            '--dx': `${p.dx}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function Stars() {
  const stars = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
    }))
  ).current;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
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
            animation: `starTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
