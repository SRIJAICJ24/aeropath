import React from 'react';
import { Target, Search, ShieldAlert } from 'lucide-react';

const BriefingCards = () => {
  const cards = [
    {
      unit: "Unit 1: Problem Formulation",
      title: "State Space & Goal Test",
      icon: <Target className="w-5 h-5 text-white" />,
      content: "As seen in Unit 1, the state space $S$ consists of all possible permutations of the $N$ delivery coordinates. The initial state is the $(0,0)$ $S$, and the goal is satisfied when drone returns to the base. With 10 points, the AI evaluates over 3.6 million possible routes."
    },
    {
      unit: "Unit 2: Heuristic Search",
      title: "Informed Search & Function",
      icon: <Search className="w-5 h-5 text-white" />,
      content: "Defining the cost function $f(n) = g(n) + h(n)$. We use Euclidean distance as a 'relaxed problem' heuristic $h(n)$. While Algorithm A (Greedy) is fast, it often falls into local optima. Algorithm B uses cost calculation (Simulated Annealing) to ensure an optimized flight path."
    },
    {
      unit: "Unit 3: Constraint Satisfaction",
      title: "No-Fly Zones (Binary Constraints)",
      icon: <ShieldAlert className="w-5 h-5 text-white" />,
      content: "Dynamic obstacles act as hard binary constraints that must satisfy. This transforms the TSP into a Constraint Satisfaction Problem (CSP). The drone cannot take the shortest valid segment that avoids the Red 'No-Fly Zones'."
    }
  ];

  return (
    <section className="h-full px-6 py-4 flex flex-col overflow-hidden max-w-[1600px] w-full mx-auto">
      <h2 className="text-lg font-bold text-white mb-3 uppercase tracking-widest drop-shadow-md">Professor's Briefing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full flex-1">
        {cards.map((card, idx) => (
          <div key={idx} className="glass-card rounded-xl p-5 flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                {card.icon}
              </div>
              <span className="text-[11px] font-bold tracking-widest text-white/80">{card.unit}</span>
            </div>
            <h3 className="text-[15px] font-bold text-white drop-shadow-sm">{card.title}</h3>
            <p className="text-white/70 leading-relaxed text-[12px] font-medium">
              {card.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BriefingCards;
