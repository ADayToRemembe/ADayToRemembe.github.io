'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

/*
  TWO-PHASE scroll-driven full-screen rocket launch
  ─────────────────────────────────────────────────
  Phase 1 (0 → 0.45)  Vertical launch
    • Rocket rises from bottom to top
    • Exhaust trail grows from ground up
    • Smoke cloud builds and fills screen from bottom

  Phase 2 (0.45 → 1.0)  Horizontal cruise
    • Rocket rotates −90° and settles at center-left
    • Horizontal fire trail extends to the left
    • Stars stream from right to left (parallel to flight)
    • Text fades in on the right side
    • Everything freezes in place — scroll only changes density/opacity
    • Reversible on scroll-up
*/

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp(t, 0, 1);
}

// Breakpoints
const P1_END   = 0.45; // vertical launch done
const TURN_END = 0.65; // rotation / reposition done
// cruise   = TURN_END → 1.0

export default function RocketLaunch() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    const scrolled   = -el.getBoundingClientRect().top;
    setProgress(clamp(scrolled / scrollable, 0, 1));
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  // ── Sub-progress per phase ───────────────────────────────────────────────
  const launchP = clamp(progress / P1_END, 0, 1);
  const turnP   = clamp((progress - P1_END)  / (TURN_END - P1_END), 0, 1);
  const cruiseP = clamp((progress - TURN_END) / (1 - TURN_END),     0, 1);

  const inCruise = progress >= TURN_END;

  // ── Rocket transform ─────────────────────────────────────────────────────
  // Phase 1: top goes from 88vh → 10vh (rocket rises)
  // Transition: top 10% → 47%; left 50% → 15%; rotation 0 → -90deg
  // Cruise: locked at top 47%, left 15%, rotation -90deg
  const rocketTop  = inCruise ? 47 : lerp(lerp(88, 10, launchP), 47, turnP);
  const rocketLeft = inCruise ? 15 : lerp(50, 15, turnP);
  const rotation   = inCruise ? -90 : lerp(0, -90, turnP);

  // ── Vertical exhaust (phase 1) ───────────────────────────────────────────
  const v_trailH   = `${lerp(0, rocketTop, launchP)}vh`;
  const v_trailOp  = launchP > 0.05 ? clamp(launchP * 3, 0, 1) : 0;

  // ── Smoke (builds through phase 1, fills screen in cruise) ───────────────
  const smokeBase  = clamp(launchP * 1.4, 0, 1);           // dense by launch end
  const smokeFull  = lerp(smokeBase, 1, turnP + cruiseP * 0.6); // fills screen in phase 2
  const smokeH     = lerp(20, 65, smokeFull);               // vh of smoke height

  // ── Horizontal exhaust (cruise) ──────────────────────────────────────────
  const h_trailW   = inCruise ? `${lerp(0, 35, clamp(turnP * 2, 0, 1))}vw` : '0';
  const h_trailOp  = turnP;

  // ── Streaming stars (cruise) ─────────────────────────────────────────────
  const starsOp    = turnP;

  // ── Text ─────────────────────────────────────────────────────────────────
  const textOp     = clamp((progress - TURN_END - 0.05) / 0.15, 0, 1);

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/5"
      style={{ height: '290vh', position: 'relative' }}
    >
      {/* ── sticky viewport ──────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden', background: '#0a0a0f',
      }}>
        {/* Background stars — parallax in cruise */}
        <BgStars shift={launchP * -20} />

        {/* ── Vertical exhaust trail (phase 1) ── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 56, height: v_trailH,
          background: 'linear-gradient(to top,#fef08a 0%,#fb923c 18%,#ef4444 42%,rgba(99,102,241,0.45) 72%,transparent 100%)',
          filter: 'blur(7px)',
          opacity: v_trailOp,
          zIndex: 2,
          transition: 'none',
          pointerEvents: 'none',
        }} />

        {/* ── Smoke — bottom-up fill ── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: `${smokeH}vh`,
          background: 'radial-gradient(ellipse at 50% 100%, rgba(210,220,240,0.9) 0%, rgba(150,175,215,0.55) 40%, rgba(80,100,140,0.2) 70%, transparent 90%)',
          filter: 'blur(24px)',
          opacity: smokeFull * 0.92,
          zIndex: 3,
          pointerEvents: 'none',
          transition: 'none',
        }} />

        {/* ── Horizontal exhaust trail (cruise) ── */}
        <div style={{
          position: 'absolute',
          top: `${rocketTop}vh`,
          left: 0,
          width: h_trailW,
          height: 48,
          transform: 'translateY(-50%)',
          background: 'linear-gradient(to right, transparent 0%, rgba(99,102,241,0.4) 30%, #ef4444 65%, #fb923c 82%, #fef08a 100%)',
          filter: 'blur(6px)',
          opacity: h_trailOp,
          zIndex: 2,
          pointerEvents: 'none',
          transition: 'none',
        }} />

        {/* ── Rocket ── */}
        <div style={{
          position: 'absolute',
          top:  `${rocketTop}vh`,
          left: `${rocketLeft}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          zIndex: 4,
          willChange: 'top,left,transform',
          transition: 'none',
        }}>
          <RocketSVG />
        </div>

        {/* ── Streaming stars (cruise) ── */}
        <div style={{ opacity: starsOp, transition: 'none', pointerEvents: 'none' }}>
          {streamingStars.map((s, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top:  `${s.top}%`,
                left: `${s.left}%`,
                width: s.len,
                height: 1.5,
                background: 'linear-gradient(to left, #818cf8, transparent)',
                borderRadius: 1,
                zIndex: 3,
                animation: `streamLeft ${s.dur}s linear ${s.delay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* ── Text (cruise, right half) ── */}
        <div style={{
          position: 'absolute',
          top: '50%', right: '6%',
          transform: 'translateY(-50%)',
          textAlign: 'right',
          maxWidth: '38vw',
          opacity: textOp,
          zIndex: 5,
          pointerEvents: textOp > 0 ? 'auto' : 'none',
          transition: 'none',
        }}>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, color: '#818cf8',
            letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.9rem',
          }}>
            Engineering in Motion
          </p>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 3rem)', fontWeight: 700,
            color: '#fff', lineHeight: 1.15, marginBottom: '1rem',
            textShadow: '0 2px 24px rgba(99,102,241,0.5)',
          }}>
            Pushing the boundaries<br />of engineering.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.65 }}>
            Research in CFD, turbulence modelling, and eco-friendly HVAC —
            grounded in the governing equations of fluid mechanics.
          </p>
        </div>

        {/* ── Scroll hint ── */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          color: '#475569', fontSize: '0.62rem',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          opacity: progress < 0.06 ? 1 - progress / 0.06 : 0,
          zIndex: 10,
        }}>SCROLL</div>

        <style>{`
          @keyframes bgTwinkle {
            0%,100% { opacity:0.1; } 50% { opacity:0.6; }
          }
          @keyframes streamLeft {
            0%   { transform: translateX(0vw);    opacity: 0; }
            8%   { opacity: 1; }
            92%  { opacity: 1; }
            100% { transform: translateX(-120vw); opacity: 0; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ── Background ambient stars ─────────────────────────────────────────── */
const bgStarData = Array.from({ length: 65 }, (_, i) => ({
  id: i,
  x: Math.random() * 100, y: Math.random() * 100,
  s: 0.5 + Math.random() * 1.8,
  d: Math.random() * 5, dur: 2 + Math.random() * 3,
}));

function BgStars({ shift }: { shift: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{ transform: `translateY(${shift}px)`, transition: 'none' }}>
      {bgStarData.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: s.s, height: s.s, borderRadius: '50%', background: 'white',
          animation: `bgTwinkle ${s.dur}s ease-in-out ${s.d}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ── Pre-generated streaming star config (stable across renders) ─────── */
const streamingStars = Array.from({ length: 30 }, (_, i) => ({
  top:   5 + (i * 13) % 90,
  left:  60 + (i * 7)  % 40,    // start on right side
  len:   20 + (i % 5) * 12,
  dur:   0.6 + (i % 4) * 0.25,
  delay: -((i * 0.31) % 2.5),
}));

/* ── Rocket SVG — original CodePen shape, white + dark-blue palette ──── */
function RocketSVG() {
  return (
    <svg width="90" viewBox="0 0 154.1 259.1" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .st0{fill:#1d4ed8;} .st1{fill:#f0f4ff;} .st5{opacity:0.55;fill:#bfdbfe;}
        .st6{opacity:0.7;fill:#1e3a8a;} .st10{fill:#eff6ff;}
        .st11{fill:#1e3a8a;} .st12{fill:#3b82f6;}
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
