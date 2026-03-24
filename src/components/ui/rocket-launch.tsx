'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

/*
  Scroll-driven full-screen rocket launch.
  - Section is 260vh tall; a sticky 100vh viewport pins while the user scrolls.
  - scroll progress 0→1 drives every animation value directly, so scrolling
    back up fully reverses the animation.
  - Rocket moves from bottom → top as progress increases.
  - Exhaust trail grows upward from the bottom of the page.
  - Smoke cloud billows at the base.
  - Text fades in at ~65% progress.
*/

export default function RocketLaunch() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0 – 1

  const onScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect        = el.getBoundingClientRect();
    const scrollable  = el.offsetHeight - window.innerHeight; // total scrollable px
    const scrolled    = -rect.top;                            // how far scrolled in
    setProgress(Math.max(0, Math.min(1, scrolled / scrollable)));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set initial value
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // ── derived values ──────────────────────────────────────────────────────────
  const launched     = progress > 0.05;
  const showText     = progress > 0.65;

  // Rocket: starts at 15% from bottom, rises to 85% from bottom (70vh travel)
  const rocketBottom = 15 + progress * 70;          // % of viewport height
  const rocketOpacity= progress < 0.95 ? 1 : Math.max(0, 1 - (progress - 0.95) / 0.05);

  // Exhaust trail: grows from 0 to rocketBottom%
  const trailHeight  = launched ? `${rocketBottom}vh` : '0px';
  const trailOpacity = launched ? Math.min(progress * 4, 1) : 0;

  // Smoke width broadens as launch progresses
  const smokeWidth   = 20 + progress * 60;          // 20vw → 80vw
  const smokeOpacity = launched ? Math.min(progress * 3, 0.95) : 0;

  // Stars parallax (move slightly opposite to rocket)
  const starShift    = progress * -15;              // px upward

  // Text
  const textOpacity  = showText ? Math.min((progress - 0.65) / 0.15, 1) : 0;

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/5"
      style={{ height: '260vh', position: 'relative' }}
    >
      {/* ── sticky viewport ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: '#0a0a0f',
        }}
      >
        {/* Ambient background stars */}
        <BgStars shift={starShift} />

        {/* ── Exhaust / fire trail ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 52,
            height: trailHeight,
            background:
              'linear-gradient(to top, #fef08a 0%, #fb923c 18%, #ef4444 42%, rgba(99,102,241,0.45) 72%, transparent 100%)',
            filter: 'blur(6px)',
            opacity: trailOpacity,
            zIndex: 2,
            transition: 'opacity 0.2s ease',
          }}
        />

        {/* ── Smoke cloud at page base ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width:  `${smokeWidth}vw`,
            height: '22vh',
            background:
              'radial-gradient(ellipse at 50% 100%, rgba(210,220,240,0.85) 0%, rgba(160,180,210,0.5) 45%, transparent 80%)',
            filter: 'blur(22px)',
            opacity: smokeOpacity,
            zIndex: 3,
            transition: 'none',
          }}
        />

        {/* ── Secondary smoke puffs ── */}
        {[
          { left: '30%', delay: 0.1, scale: 0.7 },
          { left: '70%', delay: 0.2, scale: 0.6 },
          { left: '20%', delay: 0.3, scale: 0.5 },
          { left: '80%', delay: 0.4, scale: 0.55 },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: `${4 + i * 2}vh`,
              left: p.left,
              transform: `translateX(-50%) scale(${1 + progress * p.scale})`,
              width: '14vw',
              height: '10vh',
              background:
                'radial-gradient(ellipse, rgba(200,215,235,0.6) 0%, transparent 70%)',
              filter: 'blur(14px)',
              opacity: smokeOpacity * (0.6 + i * 0.1),
              zIndex: 3,
              transition: 'none',
            }}
          />
        ))}

        {/* ── Rocket ── */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: `${rocketBottom}vh`,
            transform: 'translateX(-50%)',
            opacity: rocketOpacity,
            zIndex: 4,
            willChange: 'bottom',
          }}
        >
          <RocketSVG />
        </div>

        {/* ── Text overlay (appears at ~65% scroll) ── */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 5,
            opacity: textOpacity,
            pointerEvents: textOpacity > 0 ? 'auto' : 'none',
            padding: '0 1.5rem',
            width: '100%',
            maxWidth: '640px',
          }}
        >
          <p
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: '#818cf8',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Engineering in Motion
          </p>
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              textShadow: '0 2px 24px rgba(99,102,241,0.4)',
            }}
          >
            Pushing the boundaries<br />of engineering.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.65 }}>
            Research in CFD, turbulence modelling, and eco-friendly HVAC —
            grounded in the governing equations of fluid mechanics.
          </p>
        </div>

        {/* ── Scroll hint (visible at start) ── */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#475569',
            fontSize: '0.65rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            opacity: progress < 0.08 ? 1 - progress / 0.08 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 10,
          }}
        >
          SCROLL
        </div>

        <style>{`
          @keyframes bgTwinkle {
            0%,100% { opacity: 0.12; }
            50%      { opacity: 0.65; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ── Background stars with optional parallax shift ── */
function BgStars({ shift }: { shift: number }) {
  const stars = useRef(
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: 0.5 + Math.random() * 1.8,
      d: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    }))
  ).current;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ transform: `translateY(${shift}px)`, transition: 'none' }}
    >
      {stars.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            borderRadius: '50%',
            background: 'white',
            animation: `bgTwinkle ${s.dur}s ease-in-out ${s.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Original CodePen rocket SVG — white body + dark-blue palette ── */
function RocketSVG() {
  return (
    <svg width="90" viewBox="0 0 154.1 259.1" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .st0{fill:#1d4ed8;}
        .st1{fill:#f0f4ff;}
        .st5{opacity:0.55;fill:#bfdbfe;}
        .st6{opacity:0.7;fill:#1e3a8a;}
        .st10{fill:#eff6ff;}
        .st11{fill:#1e3a8a;}
        .st12{fill:#3b82f6;}
      `}</style>
      <path className="st0" d="M97.4 236.1c0 2.6-5.2 4.7-11.7 4.7H70.3c-6.4 0-11.7-2.1-11.7-4.7v-4.5c0-2.6 5.2-4.7 11.7-4.7h15.4c6.4 0 11.7 2.1 11.7 4.7v4.5zM37.1 137.4s-28 19.2-28 32v59.3l30-30-2-61.3zM117.5 137.4s28 19.2 28 32v59.3l-30-30 2-61.3z"/>
      <path className="st1" d="M29.6 140.5c.3 36.4 8.3 69.6 21.3 95.3 8.6-2.8 17.7-4.4 27.2-4.4 9.5-.1 18.6 1.3 27.3 4 12.5-25.9 19.9-59.3 19.6-95.6-.6-57.8-20.4-107.7-48.8-132-28.1 24.8-47.1 75-46.6 132.7z"/>
      <path className="st5" d="M60.2 233.7l12-1.9c-18.3-108.4-8.6-169-8.6-169l-11.4.4c-22 76.5 8 170.5 8 170.5z"/>
      <path className="st6" d="M41.5 64l-2.1 6.7s40.7-5 75.7.1l-3.2-7.4c-.1 0-47.1-5.4-70.4.6z"/>
      <path className="st0" d="M41.5 64c11.4-.9 23.2-1.4 35.2-1.5 12-.1 23.7.2 35.2.9-8.6-23.7-21-43-35.6-55.6C61.7 20.6 49.7 40.2 41.5 64z"/>
      <path className="st10" d="M63.6 62.7C65.7 35.3 76.2 7.8 76.2 7.8c-18.9 24.2-24 55.3-24 55.3l11.4-.4z"/>
      <path className="st11" d="M75.9 78.3c-14.8.1-26.7 12.2-26.6 27 .1 14.8 12.2 26.7 27 26.6 14.8-.1 26.7-12.2 26.5-27-.1-14.9-12.2-26.8-26.9-26.6z"/>
      <path className="st12" d="M75.9 86.4c-10.3.1-18.5 8.5-18.5 18.8.1 10.3 8.5 18.5 18.8 18.4 10.3-.1 18.5-8.5 18.4-18.8 0-10.2-8.4-18.5-18.7-18.4z"/>
      <path className="st0" d="M68.6 122.1c2.3 1 4.9 1.6 7.7 1.6 10.3-.1 18.5-8.5 18.4-18.8 0-3.6-1.1-7-3-9.9-.3.3-.7.5-1 .8-8.1 6.6-18.2 15.6-22.1 26.3z"/>
      <path className="st11" d="M79 139.9c-11.1.1-20 9.2-19.9 20.3.1 11.1 9.2 20 20.3 19.9 11.1-.1 20-9.2 19.9-20.3-.1-11-9.2-20-20.3-19.9z"/>
      <path className="st12" d="M79.1 146.1c-7.7.1-13.9 6.4-13.8 14.1.1 7.7 6.4 13.9 14.1 13.8 7.7-.1 13.9-6.4 13.8-14.1-.1-7.7-6.4-13.9-14.1-13.8z"/>
      <path className="st0" d="M73.5 172.8c1.8.8 3.7 1.2 5.8 1.2 7.7-.1 13.9-6.4 13.8-14.1 0-2.7-.8-5.3-2.2-7.4-.3.2-.5.4-.8.6-6 4.9-13.6 11.7-16.6 19.7z"/>
      <path className="st11" d="M81.5 187.9c-7.8.1-14.1 6.5-14 14.3.1 7.8 6.5 14.1 14.3 14.1 7.8-.1 14.1-6.5 14-14.3-.1-7.8-6.5-14.2-14.3-14.1z"/>
      <path className="st12" d="M81.5 192.2c-5.4 0-9.8 4.5-9.8 9.9s4.5 9.8 9.9 9.8 9.8-4.5 9.8-9.9-4.5-9.8-9.9-9.8z"/>
      <path className="st0" d="M77.6 211.1c1.2.5 2.6.9 4.1.8 5.4 0 9.8-4.5 9.8-9.9 0-1.9-.6-3.7-1.6-5.2-.2.1-.4.3-.5.4-4.3 3.5-9.7 8.3-11.8 13.9z"/>
    </svg>
  );
}
