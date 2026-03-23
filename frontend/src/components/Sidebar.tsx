import React, { useMemo } from 'react';
import { Play, RotateCcw, Activity } from 'lucide-react';

interface SidebarProps {
  onSolve: () => void;
  onClear: () => void;
  onPlay: () => void;
  stats: {
    algoA: { dist: number; time: number };
    algoB: { dist: number; time: number };
  };
  isSolving: boolean;
  hasResult: boolean;
  nodeCount?: number;
}

const Sidebar = ({ onSolve, onClear, onPlay, stats, isSolving, hasResult, nodeCount = 1 }: SidebarProps) => {

  const stateSpaceStr = useMemo(() => {
    if (nodeCount <= 2) return "O(1)";
    if (nodeCount > 10) return "O(N!) -> >3.6 Million";
    let f = 1;
    for(let i=2; i<=nodeCount; i++) f*=i;
    return `O(${nodeCount}!) -> ${f.toLocaleString()}`;
  }, [nodeCount]);

  return (
    <div className="w-full flex flex-col gap-6 p-6">
      
      {/* MISSION CONTROLS */}
      <div className="glass-card rounded-xl p-4 flex flex-col gap-4">
         <h2 className="text-sm font-bold tracking-widest uppercase text-white/90">Mission Controls</h2>
         
         <div className="flex items-center justify-between opacity-60">
            {/* Simple decorative graph to match the aesthetic */}
            <div className="flex items-end gap-1 h-10">
               <div className="w-2 bg-accent-cyan h-3"></div>
               <div className="w-2 bg-accent-cyan h-6"></div>
               <div className="w-2 bg-accent-cyan h-4"></div>
               <div className="w-2 bg-accent-cyan h-8"></div>
               <div className="w-2 bg-accent-cyan h-5"></div>
               <div className="w-2 bg-accent-cyan h-10"></div>
            </div>
            <Activity className="w-8 h-8 text-accent-cyan stroke-1" />
         </div>

         <div className="grid grid-cols-2 gap-3 mt-2">
            <button
               onClick={onSolve}
               disabled={isSolving}
               className="py-2.5 px-4 bg-accent-cyan hover:bg-cyan-400 text-black rounded-lg flex items-center justify-center gap-2 transition-all font-bold disabled:opacity-50 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
            >
               <Play className="w-4 h-4 fill-current" />
               {isSolving ? "Opt..." : "Optimize"}
            </button>
            
            <button
               onClick={onClear}
               className="py-2.5 px-4 bg-accent-purple/20 hover:bg-accent-purple/30 border border-accent-purple/50 text-accent-purple rounded-lg flex items-center justify-center gap-2 transition-all font-bold disabled:opacity-50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            >
               <RotateCcw className="w-4 h-4" />
               Clear
            </button>
         </div>
         
         <button
            onClick={onPlay}
            disabled={!hasResult}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-30 text-xs font-bold uppercase tracking-wider mt-1"
          >
            <Play className="w-3 h-3 text-accent-green" />
            Play Drone Animation
          </button>
      </div>

      {/* STATE SPACE COMPLEXITY */}
      <div className="glass-card rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 rounded-full blur-3xl -mx-10 -my-10 pointer-events-none"></div>
         
         <h2 className="text-sm font-bold tracking-widest uppercase text-white/90">State Space Complexity</h2>
         
         <div className="relative h-20 w-full mt-2">
           {/* Stylized SVG Curve */}
           <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
             <path d="M 0 100 Q 50 100 100 0" fill="none" stroke="url(#cyanGlow)" strokeWidth="3" />
             <path d="M 0 100 Q 50 100 100 0 L 100 100 L 0 100 Z" fill="url(#cyanFade)" opacity="0.3" />
             <defs>
               <linearGradient id="cyanGlow" x1="0" y1="1" x2="1" y2="0">
                 <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                 <stop offset="100%" stopColor="#22d3ee" stopOpacity="1" />
               </linearGradient>
               <linearGradient id="cyanFade" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                 <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
               </linearGradient>
             </defs>
           </svg>
         </div>
         
         <div className="flex justify-between items-center z-10 font-mono text-sm font-bold drop-shadow-md">
            <span>O(1)</span>
            <span>O(N!) perm.</span>
         </div>
         <div className="text-[10px] text-accent-cyan text-right uppercase tracking-widest opacity-80 z-10">
            {stateSpaceStr}
         </div>
      </div>

      {/* RESULTS / ALGORITHMS */}
      <div className="glass-card rounded-xl p-4 flex flex-col gap-5">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-accent-red accent-glow-red"></div>
             <div>
               <div className="text-xs font-bold text-white/90">Algorithm A (Greedy)</div>
               <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Distance {stats.algoA.dist} KM</div>
             </div>
           </div>
         </div>
         
         <div className="h-px bg-white/5 w-full"></div>

         <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-accent-green accent-glow-green"></div>
             <div>
               <div className="text-xs font-bold text-white/90">Algorithm B (A* Heuristic)</div>
               <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Distance {stats.algoB.dist} KM</div>
             </div>
           </div>
         </div>
      </div>

    </div>
  );
};

export default Sidebar;
