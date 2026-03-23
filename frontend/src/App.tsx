import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import BriefingCards from './components/BriefingCards';
import LogicStream from './components/LogicStream';
import { Plane } from 'lucide-react';

const API_URL = 'http://localhost:8000';

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

interface AlgoResult {
  path: number[];
  distance: number;
  time: number;
}

function App() {
  const [points, setPoints] = useState<Point[]>([{ x: 100, y: 100 }]); // Hub at (100,100)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [algoA, setAlgoA] = useState<AlgoResult>({ path: [], distance: 0, time: 0 });
  const [algoB, setAlgoB] = useState<AlgoResult>({ path: [], distance: 0, time: 0 });
  const [isSolving, setIsSolving] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // States for Logic Streaming
  const [logs, setLogs] = useState<string[]>([]);
  const [streamedLogs, setStreamedLogs] = useState<string[]>([]);
  const [frontierHistory, setFrontierHistory] = useState<number[][]>([]);
  const [currentFrontier, setCurrentFrontier] = useState<number[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const addPoint = (p: Point) => {
    if (isAnimating || isSimulating) return;
    setPoints(prev => [...prev, p]);
  };

  const addObstacle = (o: Obstacle) => {
    if (isAnimating || isSimulating) return;
    setObstacles(prev => [...prev, o]);
  };

  const handleSolve = async () => {
    if (points.length < 2) return;
    setIsSolving(true);
    setStreamedLogs([]);
    setCurrentFrontier([]);
    setAlgoA({ path: [], distance: 0, time: 0 });
    setAlgoB({ path: [], distance: 0, time: 0 });
    
    try {
      const response = await axios.post(`${API_URL}/solve`, {
        points,
        obstacles
      });
      setAlgoA(response.data.algorithm_a);
      setAlgoB(response.data.algorithm_b);
      setLogs(response.data.logs || []);
      setFrontierHistory(response.data.frontier_history || []);
      setIsSimulating(true);
    } catch (error) {
      console.error("Error solving TSP:", error);
      alert("Backend not reachable. Ensure FastAPI is running on port 8000.");
    } finally {
      setIsSolving(false);
    }
  };

  // Playback logic for the logic stream and frontier
  useEffect(() => {
    if (isSimulating && streamedLogs.length < logs.length) {
      const timer = setTimeout(() => {
        setStreamedLogs(prev => [...prev, logs[prev.length]]);
        
        // Sync frontier visualization
        const progress = streamedLogs.length / logs.length;
        const frontierIndex = Math.floor(progress * frontierHistory.length);
        if (frontierHistory[frontierIndex]) {
           setCurrentFrontier(frontierHistory[frontierIndex]);
        }
      }, 50); // fast stream
      return () => clearTimeout(timer);
    } else if (isSimulating && streamedLogs.length >= logs.length) {
      setIsSimulating(false);
      setCurrentFrontier([]);
    }
  }, [isSimulating, streamedLogs, logs, frontierHistory]);

  const clearMap = () => {
    setPoints([{ x: 100, y: 100 }]);
    setObstacles([]);
    setAlgoA({ path: [], distance: 0, time: 0 });
    setAlgoB({ path: [], distance: 0, time: 0 });
    setLogs([]);
    setStreamedLogs([]);
    setFrontierHistory([]);
    setCurrentFrontier([]);
    setIsAnimating(false);
    setIsSimulating(false);
  };

  const isGlitching = streamedLogs[streamedLogs.length - 1]?.includes("[CSP] Constraint Violation");

  return (
    <div className="h-screen w-screen bg-background text-white flex overflow-hidden selection:bg-accent-cyan/30 font-sans">
      
      {/* Left Panel: Dashboard controls & logic */}
      <div className="w-[360px] flex flex-col h-full border-r border-white/5 bg-[#080d1a] z-20 flex-shrink-0 shadow-2xl">
        
        {/* Header / Logo */}
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-gradient-to-b from-white/[0.02] to-transparent">
           <div className="relative">
             <div className="absolute inset-0 bg-accent-cyan blur-md opacity-30 animate-pulse-slow"></div>
             <Plane className="w-8 h-8 text-accent-cyan relative z-10" />
           </div>
           <div>
             <h1 className="text-[22px] leading-none font-bold tracking-[0.15em] text-white">AEROPATH</h1>
             <p className="text-[10px] text-accent-cyan/80 mt-1 tracking-[0.2em] font-medium uppercase">Tactical Command</p>
           </div>
        </div>
        
        {/* Sidebar Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Sidebar 
            onSolve={handleSolve}
            onClear={clearMap}
            onPlay={() => setIsAnimating(true)}
            isSolving={isSolving || isSimulating}
            hasResult={algoB.path.length > 0 && !isSimulating}
            nodeCount={points.length}
            stats={{
              algoA: { dist: algoA.distance, time: algoA.time },
              algoB: { dist: algoB.distance, time: algoB.time }
            }}
          />
        </div>

        {/* Logic Stream Area (Fixed height at bottom) */}
        <div className="h-[280px] border-t border-white/5">
          <LogicStream logs={streamedLogs} />
        </div>
      </div>

      {/* Right Panel: Map & Briefing */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-grid-pattern">
        
        {/* Map View Area */}
        <div className="flex-1 relative">
          <MapView
            points={points}
            obstacles={obstacles}
            onAddPoint={addPoint}
            onAddObstacle={addObstacle}
            algorithmA={isSimulating ? {path: [], distance: 0} : algoA}
            algorithmB={isSimulating ? {path: [], distance: 0} : algoB}
            isAnimating={isAnimating}
            onAnimationComplete={() => setIsAnimating(false)}
            currentFrontier={currentFrontier}
            isGlitching={isGlitching}
            isCalculating={isSolving || isSimulating}
          />
          
          {/* Copyright overlay bottom left of map */}
          <div className="absolute bottom-6 left-6 text-white/40 text-[10px] uppercase font-bold tracking-widest z-10 pointer-events-none drop-shadow-md">
            &copy; 2026 AeroPath Tactical Command. AI Search & Logistics Optimizer.
          </div>
        </div>

        {/* Briefing Cards Area (Bottom 32%) */}
        <div className="h-[32vh] min-h-[260px] border-t border-white/10 bg-[#0a0f1c]/90 backdrop-blur-xl flex flex-col z-10 relative">
          {/* Subtle top inner shadow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-b from-black/20 to-transparent"></div>
          <BriefingCards />
        </div>
        
      </div>
    </div>
  );
}

export default App;
