'use client';
import { useEffect, useRef, useState } from 'react';

export default function RocketLaunch() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-white/5"
      style={{ minHeight: '70vh' }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: "url('/rocket-bg.jpg')",
          backgroundPosition: 'center 40%',
        }}
      />

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.3) 40%, rgba(10,10,15,0.65) 100%)',
        }}
      />

      {/* Text content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
        style={{ minHeight: '70vh' }}
      >
        <p
          className="text-xs font-semibold text-indigo-300 tracking-widest uppercase mb-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s',
          }}
        >
          Engineering in Motion
        </p>

        <h2
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s',
            textShadow: '0 2px 20px rgba(0,0,0,0.8)',
          }}
        >
          Pushing the boundaries<br />of engineering.
        </h2>

        <p
          className="text-slate-300 text-lg max-w-xl leading-relaxed"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.9s ease 0.65s, transform 0.9s ease 0.65s',
            textShadow: '0 1px 10px rgba(0,0,0,0.9)',
          }}
        >
          Research in CFD, turbulence modeling, and eco-friendly HVAC —
          grounded in the governing equations of fluid mechanics.
        </p>
      </div>
    </section>
  );
}
