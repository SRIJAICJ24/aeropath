import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MapViewProps {
  points: Point[];
  obstacles: Obstacle[];
  onAddPoint: (p: Point) => void;
  onAddObstacle: (o: Obstacle) => void;
  algorithmA: { path: number[]; distance: number };
  algorithmB: { path: number[]; distance: number };
  isAnimating: boolean;
  onAnimationComplete: () => void;
  currentFrontier?: number[];
  isGlitching?: boolean;
  isCalculating?: boolean;
}

const MapView = ({
  points,
  obstacles,
  onAddPoint,
  onAddObstacle,
  algorithmA,
  algorithmB,
  isAnimating,
  onAnimationComplete,
  currentFrontier = [],
  isGlitching = false,
  isCalculating = false
}: MapViewProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<Point | null>(null);
  const [currentRect, setCurrentRect] = useState<Obstacle | null>(null);
  const [drawMode, setDrawMode] = useState<'POINT' | 'OBSTACLE'>('POINT');
  const [telemetry, setTelemetry] = useState({ x: 0, y: 0, h: 0 });

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: x - rect.left,
      y: y - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getPos(e);
    if (!pos) return;

    if (drawMode === 'OBSTACLE') {
      setIsDrawing(true);
      setStartPos(pos);
      setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    } else {
      onAddPoint(pos);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPos) return;
    const pos = getPos(e);
    if (!pos) return;

    const x = Math.min(startPos.x, pos.x);
    const y = Math.min(startPos.y, pos.y);
    const width = Math.abs(startPos.x - pos.x);
    const height = Math.abs(startPos.y - pos.y);
    setCurrentRect({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentRect && currentRect.width > 5 && currentRect.height > 5) {
      onAddObstacle(currentRect);
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentRect(null);
  };

  // Simulate telemetry updates if animating
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setTelemetry({
          x: Math.floor(Math.random() * 500),
          y: Math.floor(Math.random() * 500),
          h: +(Math.random() * 100).toFixed(2)
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const renderPathA = (pathIdxs: number[]) => {
    if (pathIdxs.length < 2) return null;
    const d = pathIdxs.map((idx, i) => {
      const p = points[idx];
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }).join(' ') + ` L ${points[pathIdxs[0]].x} ${points[pathIdxs[0]].y}`;

    return (
      <motion.path
        d={d}
        fill="none"
        stroke="#f87171"
        strokeWidth="3"
        strokeDasharray="8,8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] filter drop-shadow-lg"
      />
    );
  };

  const renderPathB = (pathIdxs: number[]) => {
    if (pathIdxs.length < 2) return null;
    const d = pathIdxs.map((idx, i) => {
      const p = points[idx];
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }).join(' ') + ` L ${points[pathIdxs[0]].x} ${points[pathIdxs[0]].y}`;

    return (
      <motion.path
        d={d}
        fill="none"
        stroke="#4ade80"
        strokeWidth="4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="drop-shadow-[0_0_15px_rgba(74,222,128,0.9)] filter brightness-110"
      />
    );
  };

  // Drone path for animation
  const dronePathPoints = isAnimating && algorithmB.path.length > 0 
    ? [...algorithmB.path.map(idx => points[idx]), points[algorithmB.path[0]]]
    : [];

  return (
    <div className={`relative flex-1 overflow-hidden transition-colors duration-300 w-full h-full ${isGlitching ? 'bg-red-950/40' : 'bg-transparent'}`}>
      
      {/* City Grid overlays (Topographical / Tactical rings) */}
      <div className="absolute inset-0 bg-topo-pattern opacity-30 pointer-events-none mix-blend-screen" />

      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 z-20 glass-card p-1.5 rounded-xl border border-white/10 shadow-lg">
        <button
          onClick={() => setDrawMode('POINT')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all ${drawMode === 'POINT' ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-white/40 hover:text-white/80'}`}
        >
          Waypoints
        </button>
        <button
          onClick={() => setDrawMode('OBSTACLE')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all ${drawMode === 'OBSTACLE' ? 'bg-accent-red/20 text-accent-red border border-accent-red/50 shadow-[0_0_10px_rgba(248,113,113,0.2)]' : 'text-white/40 hover:text-white/80'}`}
        >
          No-Fly Zones
        </button>
      </div>

      <svg
        ref={svgRef}
        className={`w-full h-full cursor-crosshair relative z-10 ${isGlitching ? 'animate-glitch' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#f87171" strokeWidth="2" strokeOpacity="0.4" />
          </pattern>
        </defs>

        {/* Paths */}
        {renderPathA(algorithmA.path)}
        {renderPathB(algorithmB.path)}

        {/* Obstacles (Red Zones) */}
        {obstacles.map((obs, i) => (
          <g key={`obs-${i}`}>
            <rect
              x={obs.x}
              y={obs.y}
              width={obs.width}
              height={obs.height}
              fill="url(#diagonalHatch)"
              stroke="#f87171"
              strokeWidth="2"
              className="drop-shadow-[0_0_10px_rgba(248,113,113,0.3)] opacity-80"
            />
            <rect
              x={obs.x}
              y={obs.y}
              width={obs.width}
              height={obs.height}
              fill="rgba(248, 113, 113, 0.1)"
            />
          </g>
        ))}

        {/* Current drawing obstacle */}
        {currentRect && (
          <rect
            x={currentRect.x}
            y={currentRect.y}
            width={currentRect.width}
            height={currentRect.height}
            fill="rgba(248, 113, 113, 0.2)"
            stroke="#f87171"
            className="border-dashed"
            strokeDasharray="4"
          />
        )}

        {/* Search Frontier Glows */}
        {currentFrontier.map((idx) => {
          const p = points[idx];
          if (!p) return null;
          return (
            <circle
              key={`frontier-${idx}`}
              cx={p.x}
              cy={p.y}
              r="16"
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              className="drop-shadow-[0_0_12px_#a855f7] opacity-80"
            />
          );
        })}

        {/* Waypoints */}
        {points.map((p, i) => (
          <g key={`point-${i}`}>
            {i === 0 && isCalculating && (
               <circle cx={p.x} cy={p.y} r="24" fill="none" stroke="#22d3ee" strokeWidth="2" className="animate-radar opacity-70" />
            )}
            
            {/* Center dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={i === 0 ? "8" : "6"}
              fill={i === 0 ? "#22d3ee" : "#22d3ee"}
              className={i === 0 ? "drop-shadow-[0_0_15px_#22d3ee]" : "drop-shadow-[0_0_10px_#22d3ee]"}
            />
            
            {/* Outer ring for points */}
            {i !== 0 && (
               <circle cx={p.x} cy={p.y} r="10" fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.5" />
            )}

            {/* Labels */}
            {i === 0 ? (
              <text x={p.x + 18} y={p.y + 4} className="text-[11px] fill-accent-cyan font-bold uppercase tracking-widest drop-shadow-md">
                Hub Base
              </text>
            ) : null}
          </g>
        ))}

        {/* Drone Animation with Telemetry */}
        <AnimatePresence>
          {isAnimating && dronePathPoints.length > 0 && (
            <motion.g
              initial={false}
              animate={{
                x: dronePathPoints.map(p => p.x),
                y: dronePathPoints.map(p => p.y),
              }}
              transition={{
                duration: Math.max(2, dronePathPoints.length * 0.6),
                ease: "linear",
                times: dronePathPoints.map((_, i) => i / (dronePathPoints.length - 1)),
              }}
              onAnimationComplete={onAnimationComplete}
            >
              <circle r="14" fill="rgba(74, 222, 128, 0.2)" stroke="#4ade80" strokeWidth="2" className="drop-shadow-[0_0_10px_#4ade80]" />
              <Plane className="w-6 h-6 -translate-x-1/2 -translate-y-1/2 text-accent-green fill-accent-green" />
              
              {/* Floating HUD Box */}
              <g className="translate-x-6 -translate-y-12">
                <rect width="100" height="34" rx="4" fill="rgba(15,23,42,0.8)" stroke="rgba(74,222,128,0.5)" strokeWidth="1" />
                <text x="6" y="14" fill="#4ade80" className="text-[9px] font-mono tracking-wider font-bold">
                  S(x,y): {telemetry.x}, {telemetry.y}
                </text>
                <text x="6" y="26" fill="rgba(255,255,255,0.7)" className="text-[9px] font-mono tracking-wider">
                  h(n) cost: {telemetry.h}
                </text>
              </g>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default MapView;
