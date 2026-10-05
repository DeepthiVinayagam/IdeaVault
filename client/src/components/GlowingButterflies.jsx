import React, { useMemo } from 'react';

/**
 * Animated Glowing Butterflies and Twinkling Stars Component
 * Creates a dreamy night-sky atmosphere with softly floating, glowing butterflies.
 */
export default function GlowingButterflies() {
  // Generate random twinkling stars
  const stars = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2.5 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 4}s`,
      opacity: Math.random() * 0.7 + 0.3
    }));
  }, []);

  // Defined butterfly positions and animation paths (concentrated on left & top-left away from the login form)
  const butterflies = [
    {
      id: 1,
      top: '22%',
      left: '12%',
      size: 34,
      color: '#42D6E8', // Cyan
      secondaryColor: '#8B5CF6', // Violet
      animDuration: '7s',
      flapSpeed: '0.4s',
      pathClass: 'animate-[float_7s_ease-in-out_infinite]',
      glowColor: 'rgba(66, 214, 232, 0.7)'
    },
    {
      id: 2,
      top: '48%',
      left: '28%',
      size: 28,
      color: '#A78BFA', // Light Violet
      secondaryColor: '#42D6E8',
      animDuration: '9s',
      flapSpeed: '0.35s',
      pathClass: 'animate-[float_9s_ease-in-out_infinite_1.5s]',
      glowColor: 'rgba(167, 139, 250, 0.7)'
    },
    {
      id: 3,
      top: '70%',
      left: '16%',
      size: 30,
      color: '#42D6E8',
      secondaryColor: '#C084FC',
      animDuration: '8s',
      flapSpeed: '0.45s',
      pathClass: 'animate-[float_8s_ease-in-out_infinite_3s]',
      glowColor: 'rgba(66, 214, 232, 0.6)'
    },
    {
      id: 4,
      top: '12%',
      left: '38%',
      size: 22,
      color: '#8B5CF6',
      secondaryColor: '#67E8F9',
      animDuration: '6.5s',
      flapSpeed: '0.3s',
      pathClass: 'animate-[float_6.5s_ease-in-out_infinite_2s]',
      glowColor: 'rgba(139, 92, 246, 0.7)'
    }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep Night-Sky Radial Gradients */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-vault-violet/20 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-vault-cyan/15 rounded-full blur-[120px]" />
      <div className="absolute -bottom-20 right-10 w-[500px] h-[500px] bg-vault-violetDark/25 rounded-full blur-[150px]" />

      {/* Twinkling Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            '--duration': star.duration,
            '--delay': star.delay,
            boxShadow: `0 0 6px rgba(255, 255, 255, 0.8)`
          }}
        />
      ))}

      {/* Softly Animated Glowing Butterflies */}
      {butterflies.map((b) => (
        <div
          key={b.id}
          className={`absolute ${b.pathClass}`}
          style={{
            top: b.top,
            left: b.left,
            filter: `drop-shadow(0 0 12px ${b.glowColor})`
          }}
        >
          <div className="relative flex items-center justify-center">
            {/* Left Wing */}
            <svg
              width={b.size}
              height={b.size}
              viewBox="0 0 24 24"
              className="origin-right"
              style={{
                animation: `butterfly-flap-left ${b.flapSpeed} ease-in-out infinite alternate`
              }}
            >
              <path
                d="M12 12 C8 3, 2 4, 3 10 C3.5 13, 7 15, 12 14 C7 16, 4 20, 7 22 C10 23, 11 18, 12 14 Z"
                fill={b.color}
                fillOpacity="0.85"
              />
              <path
                d="M12 12 C9 6, 5 7, 6 10 C6.5 12, 9 13, 12 13 Z"
                fill={b.secondaryColor}
                fillOpacity="0.95"
              />
            </svg>

            {/* Butterfly Slender Body */}
            <div
              className="w-[2px] h-[16px] rounded-full bg-white z-10"
              style={{ boxShadow: `0 0 8px ${b.color}` }}
            />

            {/* Right Wing */}
            <svg
              width={b.size}
              height={b.size}
              viewBox="0 0 24 24"
              className="origin-left"
              style={{
                animation: `butterfly-flap-right ${b.flapSpeed} ease-in-out infinite alternate`
              }}
            >
              <path
                d="M12 12 C16 3, 22 4, 21 10 C20.5 13, 17 15, 12 14 C17 16, 20 20, 17 22 C14 23, 13 18, 12 14 Z"
                fill={b.color}
                fillOpacity="0.85"
              />
              <path
                d="M12 12 C15 6, 19 7, 18 10 C17.5 12, 15 13, 12 13 Z"
                fill={b.secondaryColor}
                fillOpacity="0.95"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
