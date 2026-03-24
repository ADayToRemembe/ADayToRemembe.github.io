'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

type GameId = 'snake' | 'frogger' | 'hangman';

export default function DemoGames() {
  const [active, setActive] = useState<GameId | null>(null);

  const games = [
    { id: 'snake' as GameId,   label: 'Snake',    emoji: '🐍', desc: 'W/A/S/D ile yönet, elmayı ye' },
    { id: 'frogger' as GameId, label: 'Frogger',  emoji: '🚗', desc: 'W/S ile geçit yap' },
    { id: 'hangman' as GameId, label: 'Hangman',  emoji: '🔤', desc: 'Kelimeyi tahmin et' },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-2">Python → JS</p>
          <h2 className="text-3xl font-bold text-white">Deneme Oyunları</h2>
          <p className="text-slate-500 text-sm mt-1">Kişisel Python projelerinden tarayıcıya taşınan mini oyunlar</p>
        </div>

        {/* Game selector */}
        <div className="flex flex-wrap gap-3 mb-8">
          {games.map(g => (
            <button
              key={g.id}
              onClick={() => setActive(active === g.id ? null : g.id)}
              className={[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active === g.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900/60 border border-white/10 text-slate-300 hover:border-indigo-500/40 hover:text-white',
              ].join(' ')}
            >
              <span>{g.emoji}</span>
              <span>{g.label}</span>
              <span className="text-xs opacity-60 hidden sm:inline">— {g.desc}</span>
            </button>
          ))}
        </div>

        {/* Game area */}
        {active === 'snake'   && <SnakeGame />}
        {active === 'frogger' && <FroggerGame />}
        {active === 'hangman' && <HangmanGame />}
      </div>
    </section>
  );
}

/* ──────────────────────────── SNAKE ──────────────────────────── */
const CELL = 20;
const COLS = 20;
const ROWS = 20;
const SIZE = CELL * COLS;

function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 },
    next: { x: 1, y: 0 },
    apple: { x: 5, y: 5 },
    score: 0,
    over: false,
    speed: 100,
  });
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);

  const randApple = () => ({
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS),
  });

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = state.current;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Grid dots
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);

    // Apple
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(s.apple.x * CELL + CELL / 2, s.apple.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake
    s.snake.forEach((seg, i) => {
      const alpha = 1 - (i / s.snake.length) * 0.5;
      ctx.fillStyle = i === 0 ? `rgba(99,102,241,${alpha})` : `rgba(79,82,221,${alpha})`;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });
  }, []);

  const tick = useCallback(() => {
    const s = state.current;
    if (s.over) return;

    s.dir = { ...s.next };
    const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
        s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      s.over = true;
      setOver(true);
      draw();
      return;
    }

    s.snake.unshift(head);
    if (head.x === s.apple.x && head.y === s.apple.y) {
      s.apple = randApple();
      s.score++;
      setScore(s.score);
      if (s.score % 5 === 0) s.speed = Math.max(50, s.speed - 5);
    } else {
      s.snake.pop();
    }

    draw();
    loopRef.current = setTimeout(tick, s.speed);
  }, [draw]);

  const restart = useCallback(() => {
    const s = state.current;
    s.snake = [{ x: 10, y: 10 }];
    s.dir = { x: 1, y: 0 };
    s.next = { x: 1, y: 0 };
    s.apple = randApple();
    s.score = 0;
    s.over = false;
    s.speed = 100;
    setScore(0);
    setOver(false);
    if (loopRef.current) clearTimeout(loopRef.current);
    loopRef.current = setTimeout(tick, s.speed);
  }, [tick]);

  useEffect(() => {
    loopRef.current = setTimeout(tick, 100);
    return () => { if (loopRef.current) clearTimeout(loopRef.current); };
  }, [tick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = state.current;
      const map: Record<string, { x: number; y: number }> = {
        w: { x: 0, y: -1 }, ArrowUp: { x: 0, y: -1 },
        s: { x: 0, y: 1 },  ArrowDown: { x: 0, y: 1 },
        a: { x: -1, y: 0 }, ArrowLeft: { x: -1, y: 0 },
        d: { x: 1, y: 0 },  ArrowRight: { x: 1, y: 0 },
      };
      if (map[e.key]) {
        const nd = map[e.key];
        if (nd.x !== -s.dir.x || nd.y !== -s.dir.y) s.next = nd;
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <GameWrapper title="Snake" score={score} onRestart={restart}>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="rounded-xl" />
      {over && <Overlay text="GAME OVER" sub={`Skor: ${score}`} onRestart={restart} />}
    </GameWrapper>
  );
}

/* ──────────────────────────── FROGGER ──────────────────────────── */
const FR_W = 400, FR_H = 480, FR_CELL = 40;

type Car = { x: number; y: number; w: number; speed: number; color: string };

function FroggerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    frog: { x: FR_W / 2, y: FR_H - FR_CELL / 2 - 4 },
    cars: [] as Car[],
    score: 0,
    over: false,
    frame: 0,
  });
  const animRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
  const LANES = [
    { y: FR_H - FR_CELL * 2, speed: 2.5,  dir: 1 },
    { y: FR_H - FR_CELL * 3, speed: 3.0,  dir: -1 },
    { y: FR_H - FR_CELL * 4, speed: 2.0,  dir: 1 },
    { y: FR_H - FR_CELL * 5, speed: 3.5,  dir: -1 },
    { y: FR_H - FR_CELL * 6, speed: 2.8,  dir: 1 },
    { y: FR_H - FR_CELL * 7, speed: 1.8,  dir: -1 },
    { y: FR_H - FR_CELL * 8, speed: 3.2,  dir: 1 },
    { y: FR_H - FR_CELL * 9, speed: 2.2,  dir: -1 },
  ];

  const spawnCars = useCallback((lvl: number) => {
    const cars: Car[] = [];
    LANES.forEach((lane, li) => {
      const count = 2 + Math.floor(lvl * 0.5);
      for (let i = 0; i < count; i++) {
        cars.push({
          x: (FR_W / count) * i + Math.random() * 20,
          y: lane.y + FR_CELL / 2,
          w: 50 + Math.random() * 30,
          speed: lane.speed * (1 + lvl * 0.1) * lane.dir,
          color: COLORS[li % COLORS.length],
        });
      }
    });
    return cars;
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const s = state.current;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, FR_W, FR_H);

    // Safe zones
    ctx.fillStyle = 'rgba(34,197,94,0.08)';
    ctx.fillRect(0, 0, FR_W, FR_CELL);
    ctx.fillRect(0, FR_H - FR_CELL, FR_W, FR_CELL);

    // Finish line
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, 0, FR_W, 4);
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#22c55e';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', FR_W / 2, 26);

    // Road lanes
    LANES.forEach(lane => {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, lane.y, FR_W, FR_CELL);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(0, lane.y + FR_CELL);
      ctx.lineTo(FR_W, lane.y + FR_CELL);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Cars
    s.cars.forEach(car => {
      ctx.fillStyle = car.color;
      ctx.beginPath();
      ctx.roundRect(car.x - car.w / 2, car.y - FR_CELL * 0.35, car.w, FR_CELL * 0.7, 6);
      ctx.fill();
      // Headlights
      const lx = car.speed > 0 ? car.x + car.w / 2 - 6 : car.x - car.w / 2 + 6;
      ctx.fillStyle = 'rgba(255,255,200,0.7)';
      ctx.beginPath(); ctx.arc(lx, car.y - 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(lx, car.y + 5, 3, 0, Math.PI * 2); ctx.fill();
    });

    // Frog
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(s.frog.x, s.frog.y, FR_CELL * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(s.frog.x - 6, s.frog.y - 4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(s.frog.x + 6, s.frog.y - 4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(s.frog.x - 6, s.frog.y - 4, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.arc(s.frog.x + 6, s.frog.y - 4, 2, 0, Math.PI * 2); ctx.fill();

    // Score
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, FR_H - 30, 100, 22);
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Skor: ${s.score}`, 14, FR_H - 14);
  }, []);

  const loop = useCallback(() => {
    const s = state.current;
    if (s.over) return;

    s.frame++;
    s.cars.forEach(car => {
      car.x += car.speed;
      if (car.x > FR_W + car.w) car.x = -car.w;
      if (car.x < -car.w) car.x = FR_W + car.w;

      const dx = Math.abs(s.frog.x - car.x);
      const dy = Math.abs(s.frog.y - car.y);
      if (dx < car.w / 2 + 8 && dy < FR_CELL * 0.4) {
        s.over = true;
        setOver(true);
        draw();
        return;
      }
    });

    // Check finish
    if (s.frog.y < FR_CELL / 2 + 4) {
      s.score++;
      setScore(s.score);
      s.frog = { x: FR_W / 2, y: FR_H - FR_CELL / 2 - 4 };
      s.cars = spawnCars(s.score);
    }

    draw();
    animRef.current = requestAnimationFrame(loop);
  }, [draw, spawnCars]);

  const restart = useCallback(() => {
    const s = state.current;
    s.frog = { x: FR_W / 2, y: FR_H - FR_CELL / 2 - 4 };
    s.cars = spawnCars(0);
    s.score = 0;
    s.over = false;
    s.frame = 0;
    setScore(0);
    setOver(false);
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(loop);
  }, [loop, spawnCars]);

  useEffect(() => {
    state.current.cars = spawnCars(0);
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [loop, spawnCars]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = state.current;
      if (s.over) return;
      const step = FR_CELL;
      if (e.key === 'w' || e.key === 'ArrowUp')    { s.frog.y -= step; e.preventDefault(); }
      if (e.key === 's' || e.key === 'ArrowDown')  { s.frog.y += step; e.preventDefault(); }
      if (e.key === 'a' || e.key === 'ArrowLeft')  { s.frog.x -= step; e.preventDefault(); }
      if (e.key === 'd' || e.key === 'ArrowRight') { s.frog.x += step; e.preventDefault(); }
      s.frog.x = Math.max(FR_CELL / 2, Math.min(FR_W - FR_CELL / 2, s.frog.x));
      s.frog.y = Math.max(FR_CELL / 2, Math.min(FR_H - FR_CELL / 2, s.frog.y));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <GameWrapper title="Frogger" score={score} onRestart={restart}>
      <canvas ref={canvasRef} width={FR_W} height={FR_H} className="rounded-xl" />
      {over && <Overlay text="EZİLDİN!" sub={`${score} tur geçtin`} onRestart={restart} />}
    </GameWrapper>
  );
}

/* ──────────────────────────── HANGMAN ──────────────────────────── */
const WORDS = [
  'PYTHON', 'ENGINEERING', 'ROCKET', 'TURBULENCE', 'SIMULATION',
  'ALGORITHM', 'VORTEX', 'VELOCITY', 'PRESSURE', 'FLUID',
  'DIFFUSION', 'COMBUSTION', 'PROPULSION', 'TRAJECTORY', 'MATLAB',
  'AIRCRAFT', 'NOZZLE', 'ENTROPY', 'VISCOSITY', 'MECHANICS',
];

function HangmanGame() {
  const [word, setWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [lives, setLives] = useState(6);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);

  const restart = () => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuessed(new Set());
    setLives(6);
    setWon(false);
    setLost(false);
  };

  const guess = (letter: string) => {
    if (guessed.has(letter) || won || lost) return;
    const ng = new Set(guessed);
    ng.add(letter);
    setGuessed(ng);

    if (!word.includes(letter)) {
      const nl = lives - 1;
      setLives(nl);
      if (nl === 0) setLost(true);
    } else {
      if (word.split('').every(c => ng.has(c))) setWon(true);
    }
  };

  const display = word.split('').map(c => (guessed.has(c) ? c : '_'));
  const wrong = [...guessed].filter(c => !word.includes(c));
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <GameWrapper title="Hangman" score={won ? 1 : 0} onRestart={restart} hideScore>
      <div className="w-full max-w-lg mx-auto space-y-6">

        {/* Gallows SVG */}
        <div className="flex justify-center">
          <HangmanSVG lives={lives} />
        </div>

        {/* Category hint */}
        <p className="text-center text-xs text-indigo-400 tracking-widest uppercase">Engineering / Science Term</p>

        {/* Word display */}
        <div className="flex justify-center gap-2 flex-wrap">
          {display.map((c, i) => (
            <div key={i} className={[
              'w-8 h-10 border-b-2 flex items-end justify-center pb-1 font-bold text-lg transition-all',
              c === '_' ? 'border-slate-600 text-transparent' : 'border-indigo-400 text-white'
            ].join(' ')}>
              {c}
            </div>
          ))}
        </div>

        {/* Lives */}
        <div className="flex justify-center gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-indigo-500' : 'bg-slate-800'}`} />
          ))}
          <span className="text-xs text-slate-500 ml-2">{lives} hak kaldı</span>
        </div>

        {/* Wrong guesses */}
        {wrong.length > 0 && (
          <div className="flex justify-center flex-wrap gap-1">
            {wrong.map(c => (
              <span key={c} className="text-xs px-1.5 py-0.5 bg-red-900/40 text-red-400 rounded border border-red-800/40">{c}</span>
            ))}
          </div>
        )}

        {/* Keyboard */}
        {!won && !lost && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {ALPHA.map(c => (
              <button
                key={c}
                onClick={() => guess(c)}
                disabled={guessed.has(c)}
                className={[
                  'w-8 h-8 rounded text-xs font-bold transition-all',
                  guessed.has(c)
                    ? word.includes(c)
                      ? 'bg-indigo-800/60 text-indigo-400 cursor-default'
                      : 'bg-slate-900 text-slate-700 cursor-default'
                    : 'bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white active:scale-95'
                ].join(' ')}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Result */}
        {(won || lost) && (
          <div className={`text-center p-4 rounded-xl border ${won ? 'border-green-500/30 bg-green-900/20' : 'border-red-500/30 bg-red-900/20'}`}>
            <p className={`text-xl font-bold mb-1 ${won ? 'text-green-400' : 'text-red-400'}`}>
              {won ? '🎉 Kazandın!' : '💀 Kaybettin!'}
            </p>
            <p className="text-slate-400 text-sm mb-3">Kelime: <span className="text-white font-mono font-bold">{word}</span></p>
            <button onClick={restart} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
              Tekrar Oyna
            </button>
          </div>
        )}
      </div>
    </GameWrapper>
  );
}

/* ──────────────────────────── HANGMAN SVG ──────────────────────────── */
function HangmanSVG({ lives }: { lives: number }) {
  const parts = 6 - lives;
  return (
    <svg width="140" height="150" viewBox="0 0 140 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gallows */}
      <line x1="10" y1="145" x2="130" y2="145" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="145" x2="30" y2="10" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="10" x2="90" y2="10" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      <line x1="90" y1="10" x2="90" y2="28" stroke="#475569" strokeWidth="3" strokeLinecap="round"/>
      {/* Head */}
      {parts >= 1 && <circle cx="90" cy="40" r="12" stroke="#f87171" strokeWidth="2.5" fill="none"/>}
      {/* Body */}
      {parts >= 2 && <line x1="90" y1="52" x2="90" y2="95" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>}
      {/* Left arm */}
      {parts >= 3 && <line x1="90" y1="62" x2="68" y2="80" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>}
      {/* Right arm */}
      {parts >= 4 && <line x1="90" y1="62" x2="112" y2="80" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>}
      {/* Left leg */}
      {parts >= 5 && <line x1="90" y1="95" x2="68" y2="118" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>}
      {/* Right leg */}
      {parts >= 6 && <line x1="90" y1="95" x2="112" y2="118" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"/>}
    </svg>
  );
}

/* ──────────────────────────── SHARED ──────────────────────────── */
function GameWrapper({
  title, score, onRestart, hideScore, children
}: {
  title: string; score: number; onRestart: () => void; hideScore?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-950/80 border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
        <span className="font-semibold text-white text-sm">{title}</span>
        <div className="flex items-center gap-4">
          {!hideScore && <span className="text-xs text-slate-400 font-mono">Skor: {score}</span>}
          <button
            onClick={onRestart}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            Yeniden Başlat
          </button>
        </div>
      </div>
      <div className="relative flex justify-center p-4">
        {children}
      </div>
      <p className="text-center text-xs text-slate-600 pb-3">W / A / S / D  veya  ↑ ↓ ← → ile oyna</p>
    </div>
  );
}

function Overlay({ text, sub, onRestart }: { text: string; sub: string; onRestart: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl backdrop-blur-sm">
      <p className="text-2xl font-bold text-white mb-1">{text}</p>
      <p className="text-slate-400 text-sm mb-4">{sub}</p>
      <button onClick={onRestart} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
        Tekrar Oyna
      </button>
    </div>
  );
}
