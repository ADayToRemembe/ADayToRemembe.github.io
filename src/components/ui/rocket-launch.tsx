'use client';
import { useEffect, useRef, useState } from 'react';

export default function RocketLaunch() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-white/5"
      style={{ minHeight: '100vh' }}
    >
      {/* ── Space sky extension at top ── */}
      <div
        className="absolute inset-x-0 top-0 z-10 pointer-events-none"
        style={{
          height: '35%',
          background: 'linear-gradient(to bottom, #020510 0%, #050d1f 40%, #0a1535 75%, transparent 100%)',
        }}
      />

      {/* ── Stars in top area ── */}
      <Stars />

      {/* ── Main rocket image ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/rocket-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 55%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* ── Flame extension at bottom ── */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
        style={{ height: '45%' }}
      >
        {/* Smoke/cloud layer */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: '70%',
            background: 'radial-gradient(ellipse 120% 60% at 50% 100%, rgba(80,60,40,0.85) 0%, rgba(50,35,20,0.6) 40%, transparent 75%)',
          }}
        />

        {/* Outer flame glow */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 flame-outer"
          style={{
            width: '40%',
            maxWidth: 280,
            height: 220,
            background: 'radial-gradient(ellipse 50% 100% at 50% 100%, rgba(255,100,0,0.75) 0%, rgba(220,60,0,0.5) 35%, rgba(180,30,0,0.25) 60%, transparent 80%)',
            filter: 'blur(8px)',
            transformOrigin: 'bottom center',
          }}
        />

        {/* Mid flame */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 flame-mid"
          style={{
            width: '22%',
            maxWidth: 160,
            height: 260,
            background: 'radial-gradient(ellipse 50% 100% at 50% 100%, rgba(255,200,50,0.9) 0%, rgba(255,120,0,0.75) 30%, rgba(220,50,0,0.5) 60%, transparent 85%)',
            filter: 'blur(4px)',
            transformOrigin: 'bottom center',
          }}
        />

        {/* Inner core flame */}
        <div
          className="absolute left-1/2 bottom-0 -translate-x-1/2 flame-core"
          style={{
            width: '10%',
            maxWidth: 80,
            height: 200,
            background: 'radial-gradient(ellipse 50% 100% at 50% 100%, #fff 0%, #fef08a 20%, #fbbf24 45%, #f97316 70%, transparent 90%)',
            filter: 'blur(2px)',
            transformOrigin: 'bottom center',
          }}
        />

        {/* Spark particles */}
        <Sparks />
      </div>

      {/* ── Bottom ground fade ── */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
        style={{
          height: '12%',
          background: 'linear-gradient(to top, #020510 0%, transparent 100%)',
        }}
      />

      {/* ── Text overlay ── */}
      <div
        className="relative z-30 flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '10rem' }}
      >
        <p
          className="text-xs font-semibold text-indigo-300 tracking-widest uppercase mb-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
          }}
        >
          Engineering in Motion
        </p>

        <h2
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s',
            textShadow: '0 2px 30px rgba(0,0,0,0.9), 0 0 60px rgba(0,0,0,0.7)',
          }}
        >
          Pushing the boundaries<br />of engineering.
        </h2>

        <p
          className="text-slate-300 text-lg max-w-xl leading-relaxed"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.9s ease 0.75s, transform 0.9s ease 0.75s',
            textShadow: '0 1px 12px rgba(0,0,0,1)',
          }}
        >
          Research in CFD, turbulence modeling, and eco-friendly HVAC —
          grounded in the governing equations of fluid mechanics.
        </p>
      </div>

      <style>{`
        @keyframes flameOuter {
          0%,100% { transform: translateX(-50%) scaleY(1)   scaleX(1);   opacity: 0.9; }
          20%      { transform: translateX(-50%) scaleY(1.1) scaleX(0.9); opacity: 1;   }
          40%      { transform: translateX(-50%) scaleY(0.9) scaleX(1.1); opacity: 0.85;}
          60%      { transform: translateX(-50%) scaleY(1.15)scaleX(0.88);opacity: 1;   }
          80%      { transform: translateX(-50%) scaleY(0.95)scaleX(1.05);opacity: 0.9; }
        }
        @keyframes flameMid {
          0%,100% { transform: translateX(-50%) scaleY(1)   scaleX(1);   }
          25%      { transform: translateX(-50%) scaleY(1.2) scaleX(0.85);}
          50%      { transform: translateX(-50%) scaleY(0.85)scaleX(1.15);}
          75%      { transform: translateX(-50%) scaleY(1.1) scaleX(0.9); }
        }
        @keyframes flameCore {
          0%,100% { transform: translateX(-50%) scaleY(1)   scaleX(1);   }
          33%      { transform: translateX(-50%) scaleY(1.3) scaleX(0.8); }
          66%      { transform: translateX(-50%) scaleY(0.8) scaleX(1.2); }
        }
        .flame-outer { animation: flameOuter 0.18s ease-in-out infinite; }
        .flame-mid   { animation: flameMid   0.13s ease-in-out infinite; }
        .flame-core  { animation: flameCore  0.10s ease-in-out infinite; }

        @keyframes sparkFly {
          0%   { transform: translate(0,0) scale(1);   opacity: 1; }
          100% { transform: translate(var(--sx),var(--sy)) scale(0); opacity: 0; }
        }
        @keyframes starPulse {
          0%,100% { opacity: 0.3; }
          50%      { opacity: 0.9; }
        }
      `}</style>
    </section>
  );
}

function Sparks() {
  const sparks = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      sx: `${(Math.random() - 0.5) * 120}px`,
      sy: `${-40 - Math.random() * 80}px`,
      left: `${40 + (Math.random() - 0.5) * 20}%`,
      bottom: `${30 + Math.random() * 30}%`,
      delay: Math.random() * 1.2,
      dur: 0.6 + Math.random() * 0.8,
      size: 2 + Math.random() * 4,
      color: Math.random() > 0.5 ? '#fbbf24' : '#f97316',
    }))
  ).current;

  return (
    <>
      {sparks.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: s.left,
            bottom: s.bottom,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: s.color,
            '--sx': s.sx,
            '--sy': s.sy,
            animation: `sparkFly ${s.dur}s ease-out ${s.delay}s infinite`,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

function Stars() {
  const stars = useRef(
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 45,
      size: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    }))
  ).current;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
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
            animation: `starPulse ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
