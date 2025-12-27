import React from "react";

export default function QuantaLogo({ size = 180 }) {
  // Rotation speeds (seconds)
  const speeds = [12, 16, 20, 18];
  // Rotation directions
  const dirs = [1, -1, 1, -1];
  // Ball colors
  const colors = ["#e53935", "#8bc34a", "#ffb300"];
  // Ball delays
  const delays = ["0s", "1s", "2s"];
  // Ellipse path data (front/back split)
  const ellipses = [
    {
      back: "M 80 300 a 220 120 0 1 1 440 0",
      front: "M 520 300 a 220 120 0 1 1 -440 0",
      ballPath: "M 80 300 a 220 120 0 1 0 440 0 a 220 120 0 1 0 -440 0"
    },
    {
      back: "M 300 80 a 120 220 0 1 1 0 440",
      front: "M 300 520 a 120 220 0 1 1 0 -440",
      ballPath: "M 300 80 a 120 220 0 1 0 0 440 a 120 220 0 1 0 0 -440",
      transform: "rotate(30 300 300)"
    },
    {
      back: "M 300 80 a 120 220 0 1 1 0 440",
      front: "M 300 520 a 120 220 0 1 1 0 -440",
      ballPath: "M 300 80 a 120 220 0 1 0 0 440 a 120 220 0 1 0 0 -440",
      transform: "rotate(-30 300 300)"
    },
    {
      back: "M 300 110 a 190 190 0 1 1 0 380",
      front: "M 300 490 a 190 190 0 1 1 0 -380",
      ballPath: "M 300 110 a 190 190 0 1 0 0 380 a 190 190 0 1 0 0 -380"
    }
  ];

  // Electric arc paths
  const electricArcs = [
    "M 300 200 Q 350 250 400 300 Q 450 350 500 300",
    "M 200 300 Q 250 250 300 200 Q 350 150 400 200",
    "M 300 400 Q 250 350 200 300 Q 150 250 100 300",
    "M 400 300 Q 350 350 300 400 Q 250 450 200 400"
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 600 650"
      style={{ display: "block" }}
    >
      <defs>
        {/* Drop shadow filter for ellipses */}
        <filter id="ellipseShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#1976d2" floodOpacity="0.25" />
        </filter>
        <filter id="electricGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="electricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" stopOpacity="0"/>
          <stop offset="50%" stopColor="#00ffff" stopOpacity="1"/>
          <stop offset="100%" stopColor="#00ffff" stopOpacity="0"/>
        </linearGradient>
      </defs>
      
      {/* Electric arcs that appear and disappear */}
      {electricArcs.map((arc, i) => (
        <path
          key={`electric-${i}`}
          d={arc}
          stroke="url(#electricGradient)"
          strokeWidth="2"
          fill="none"
          filter="url(#electricGlow)"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="2s"
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}

      {/* Four animated ellipse groups, but only three with balls */}
      {ellipses.map((el, i) => (
        <g key={i}>
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 300 300`}
              to={`${360 * dirs[i]} 300 300`}
              dur={`${speeds[i]}s`}
              repeatCount="indefinite"
            />
            {/* Back half */}
            <path
              d={el.back}
              stroke="#4fc3f7"
              strokeWidth="22"
              fill="none"
              filter="url(#ellipseShadow)"
              {...(el.transform ? { transform: el.transform } : {})}
            />
            {/* Ball - only show for first 3 ellipses */}
            {i < 3 && (
              <circle r="25" fill={colors[i]} stroke="#fff" strokeWidth="8">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  rotate="auto"
                  begin={delays[i]}
                >
                  <mpath xlinkHref={`#ballPath${i}`} />
                </animateMotion>
              </circle>
            )}
            {/* Front half */}
            <path
              d={el.front}
              stroke="#4fc3f7"
              strokeWidth="22"
              fill="none"
              filter="url(#ellipseShadow)"
              {...(el.transform ? { transform: el.transform } : {})}
            />
            {/* Ball path for animateMotion (hidden) - only for first 3 ellipses */}
            {i < 3 && (
              <path
                id={`ballPath${i}`}
                d={el.ballPath}
                fill="none"
                style={{ display: "none" }}
                {...(el.transform ? { transform: el.transform } : {})}
              />
            )}
          </g>
        </g>
      ))}
    </svg>
  );
} 