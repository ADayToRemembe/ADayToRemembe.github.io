'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

/*
  TWO-PHASE scroll-driven rocket launch — v3
  ──────────────────────────────────────────
  Phase 1 (0 → 0.45)  Vertical launch
    • Rocket rises straight up
    • Long exhaust trail from ground to rocket
    • Heavy smoke cloud at base, building up
    • Stars stream DOWNWARD (parallax of going up)

  Phase 2 (0.45 → 1.0)  30° cruise
    • Rocket rotates +30° (nose tilts right)
    • Fire + smoke inside rotated wrapper → aligned at rocket's rear (30°)
    • Stars stream at 30° angle (upper-right → lower-left)
    • Text on right, smoke fills lower screen
    • Locked position until page end; reverses on scroll-up
*/

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a: number, b: number, t: number)    { return a + (b - a) * clamp(t, 0, 1); }

const P1_END     = 0.45;
const TURN_END   = 0.65;
const CRUISE_DEG = 30;   // final rocket tilt (clockwise from vertical)

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

  // ── sub-progress ─────────────────────────────────────────────────────────
  const launchP = clamp(progress / P1_END,                              0, 1);
  const turnP   = clamp((progress - P1_END)  / (TURN_END - P1_END),    0, 1);
  const cruiseP = clamp((progress - TURN_END) / (1 - TURN_END),        0, 1);
  const inCruise = progress >= TURN_END;

  // ── rocket position / rotation ───────────────────────────────────────────
  // Phase 1: top 88vh → 10vh  (rises)
  // Transition: 10vh → 47vh and left 50% → 20%
  const rocketTop  = inCruise ? 47 : lerp(lerp(88, 10, launchP), 47, turnP);
  const rocketLeft = inCruise ? 20 : lerp(50, 20, turnP);
  const angle      = inCruise ? CRUISE_DEG : lerp(0, CRUISE_DEG, turnP);

  // ── phase-1 ground exhaust trail (fully gone by end of turn) ────────────
  const trailH  = `${Math.max(0, rocketTop - 5)}vh`;   // from ground to rocket
  const trailOp = launchP > 0.04 ? clamp(launchP * 3, 0, 1) * (1 - turnP) : 0;

  // ── ground smoke (phase 1 only, fully gone by end of turn) ───────────────
  const groundSmokeOp = clamp(launchP * 2.5, 0, 1) * (1 - turnP);
  const groundSmokeH  = lerp(0, 38, launchP);          // vh

  // ── local fire/smoke opacity (inside wrapper) ────────────────────────────
  const localFireLen  = lerp(55, 130, launchP) + cruiseP * 30;  // px — starts bigger
  const localFireOp   = launchP > 0.04 ? 1 : 0;
  const localSmokeOp  = clamp(launchP * 3, 0, 1);

  // ── downward streaming stars (phase 1) ───────────────────────────────────
  const downStarsOp   = clamp(launchP * 3, 0, 1) * (1 - turnP);

  // ── angled streaming stars (phase 2) ─────────────────────────────────────
  const cruiseStarsOp = turnP;

  // ── text ──────────────────────────────────────────────────────────────────
  const textOp = clamp((progress - TURN_END - 0.05) / 0.15, 0, 1);

  return (
    <section
      ref={sectionRef}
      className="border-b border-white/5"
      style={{ height: '500vh', position: 'relative' }}
    >
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden', background: '#0a0a0f',
      }}>
        {/* ── ambient bg stars (subtle parallax up in phase 1) ── */}
        <BgStars shift={launchP * -18} />

        {/* ── downward streaming stars (phase 1 only) ── */}
        <div style={{ opacity: downStarsOp, transition: 'none', pointerEvents: 'none' }}>
          {downStars.map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              left:  `${s.left}%`,
              top:   `${s.top}%`,
              width: 1.5,
              height: s.len,
              background: 'linear-gradient(to bottom, transparent, rgba(200,210,255,0.85), transparent)',
              borderRadius: 1,
              animation: `streamDown ${s.dur}s linear ${s.delay}s infinite`,
              zIndex: 2,
            }} />
          ))}
        </div>

        {/* ── ground exhaust trail (phase 1) ── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 54, height: trailH,
          background: 'linear-gradient(to top,#fef08a 0%,#fb923c 18%,#ef4444 42%,rgba(99,102,241,0.45) 72%,transparent 100%)',
          filter: 'blur(7px)',
          opacity: trailOp,
          zIndex: 3, pointerEvents: 'none', transition: 'none',
        }} />

        {/* ── ground smoke (phase 1, heavy) ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${groundSmokeH}vh`,
          background: 'radial-gradient(ellipse at 50% 100%,rgba(220,225,245,0.95) 0%,rgba(165,185,220,0.65) 38%,rgba(90,110,155,0.25) 68%,transparent 90%)',
          filter: 'blur(26px)',
          opacity: groundSmokeOp,
          zIndex: 3, pointerEvents: 'none', transition: 'none',
        }} />

{/* ── angled streaming stars (phase 2, at CRUISE_DEG) ── */}
        <div
          style={{ opacity: cruiseStarsOp, transition: 'none', pointerEvents: 'none',
            transform: `rotate(${CRUISE_DEG}deg)`,
            transformOrigin: 'center center',
          }}
        >
          {cruiseStars.map((s, i) => (
            <div key={i} style={{
              position: 'absolute',
              left:  `${s.left}%`,
              top:   `${s.top}%`,
              width: 1.5,
              height: s.len,
              background: 'linear-gradient(to bottom, transparent, #818cf8, transparent)',
              borderRadius: 1,
              animation: `streamDown ${s.dur}s linear ${s.delay}s infinite`,
              zIndex: 3,
            }} />
          ))}
        </div>

        {/* ── ROCKET + local fire + local smoke (all rotate together) ── */}
        <div style={{
          position: 'absolute',
          top:  `${rocketTop}vh`,
          left: `${rocketLeft}%`,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          zIndex: 4, transition: 'none', willChange: 'top,left,transform',
        }}>
          {/* Local smoke puff at nozzle — moves WITH rocket, aligned at angle */}
          <div style={{
            position: 'absolute',
            top: '85%', left: '50%',
            transform: 'translate(-50%, 0)',
            width: 110, height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse,rgba(215,225,245,0.9) 0%,rgba(160,185,225,0.55) 50%,transparent 80%)',
            filter: 'blur(16px)',
            opacity: localSmokeOp * 0.95,
            pointerEvents: 'none',
          }} />

          {/* Secondary smoke — wider, softer */}
          <div style={{
            position: 'absolute',
            top: '95%', left: '50%',
            transform: 'translateX(-50%)',
            width: 160, height: 90,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse,rgba(190,205,240,0.7) 0%,rgba(130,155,210,0.3) 55%,transparent 85%)',
            filter: 'blur(22px)',
            opacity: localSmokeOp * 0.8,
            pointerEvents: 'none',
          }} />

          {/* Fire — outer glow */}
          <div style={{
            position: 'absolute',
            top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            transformOrigin: 'top center',
            width: 64,
            height: localFireLen,
            borderRadius: '0 0 50% 50%',
            background: 'linear-gradient(to bottom,#fff176 0%,#ff6d00 18%,#d32f2f 48%,rgba(80,60,180,0.55) 78%,transparent 100%)',
            filter: 'blur(6px)',
            opacity: localFireOp,
            pointerEvents: 'none',
          }} />
          {/* Fire — mid layer */}
          <div style={{
            position: 'absolute',
            top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            transformOrigin: 'top center',
            width: 34,
            height: localFireLen * 0.7,
            borderRadius: '0 0 50% 50%',
            background: 'linear-gradient(to bottom,#ffffff 0%,#ffe57f 12%,#ff9800 40%,rgba(230,80,30,0.6) 72%,transparent 100%)',
            filter: 'blur(3px)',
            opacity: localFireOp,
            pointerEvents: 'none',
          }} />
          {/* Fire — bright inner core */}
          <div style={{
            position: 'absolute',
            top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            transformOrigin: 'top center',
            width: 16,
            height: localFireLen * 0.42,
            borderRadius: '0 0 50% 50%',
            background: 'linear-gradient(to bottom,#ffffff 0%,#fffde7 30%,#ffd54f 65%,transparent 100%)',
            filter: 'blur(1.5px)',
            opacity: localFireOp,
            pointerEvents: 'none',
          }} />

          <RocketSVG />
        </div>

        {/* ── Text (cruise, right side) ── */}
        <div style={{
          position: 'absolute',
          top: '50%', right: '5%',
          transform: 'translateY(-50%)',
          textAlign: 'right', maxWidth: '38vw',
          opacity: textOp, zIndex: 5,
          pointerEvents: textOp > 0 ? 'auto' : 'none',
          transition: 'none',
        }}>
          <p style={{
            fontSize: '0.62rem', fontWeight: 700, color: '#818cf8',
            letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.85rem',
          }}>Engineering in Motion</p>
          <h2 style={{
            fontSize: 'clamp(1.6rem,3.5vw,3rem)', fontWeight: 700, color: '#fff',
            lineHeight: 1.15, marginBottom: '1rem',
            textShadow: '0 2px 24px rgba(99,102,241,0.5)',
          }}>
            Pushing the boundaries<br />of engineering.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.65 }}>
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
          @keyframes streamDown {
            0%   { transform: translateY(-20vh); opacity:0; }
            8%   { opacity:1; }
            92%  { opacity:1; }
            100% { transform: translateY(120vh);  opacity:0; }
          }
        `}</style>
      </div>
    </section>
  );
}

/* ── Ambient background stars ────────────────────────────────────────── */
const bgStarData = Array.from({ length: 65 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
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

/* ── Static star configs (avoid re-generating on each render) ────────── */
const downStars = Array.from({ length: 35 }, (_, i) => ({
  left:  2 + (i * 11) % 96,
  top:   (i * 17)     % 50,   // start in upper half
  len:   18 + (i % 5) * 10,
  dur:   0.55 + (i % 4) * 0.2,
  delay: -((i * 0.28) % 2.2),
}));

const cruiseStars = Array.from({ length: 30 }, (_, i) => ({
  left:  5 + (i * 13) % 90,
  top:   5 + (i * 17) % 90,
  len:   20 + (i % 5) * 12,
  dur:   0.6 + (i % 4) * 0.25,
  delay: -((i * 0.31) % 2.5),
}));

/* ── Rocket SVG — white body + dark-blue palette ─────────────────────── */
function RocketSVG() {
  return (
    <svg width="88" viewBox="0 0 154.1 259.1" xmlns="http://www.w3.org/2000/svg">
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
