import React, { useEffect, useRef } from 'react';

interface LogicStreamProps {
  logs: string[];
}

const LogicStream = ({ logs }: LogicStreamProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col relative bg-[#0a0f1c]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-red/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-accent-green/80"></div>
        </div>
        <span className="text-[10px] font-bold text-white/90 tracking-widest uppercase">
          X-Ray Logic Stream
        </span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed space-y-1 custom-scrollbar shadow-inner"
      >
        {logs.map((log, idx) => {
          let colorClass = "text-white/70";
          if (log.startsWith("[LOGIC]")) colorClass = "text-accent-cyan font-bold";
          if (log.startsWith("[SEARCH]")) colorClass = "text-[#a855f7]";
          if (log.startsWith("[CSP]")) colorClass = "text-accent-green font-bold";
          if (log.startsWith("[WARNING]")) colorClass = "text-accent-red font-bold";
          
          return (
            <div key={idx} className={`${colorClass} animate-fade-in`}>
              {log}
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-white/30 italic">Awaiting telemetry data...</div>
        )}
      </div>
    </div>
  );
};

export default LogicStream;
