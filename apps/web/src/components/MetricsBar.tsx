import React from 'react';

const METRICS = [
  { value: '< 1ms', label: 'CLI Startup Latency', tag: 'COMPILED SPEED' },
  { value: '0 MB', label: 'Runtime Overhead', tag: 'ZERO NODE_MODULES' },
  { value: '100%', label: 'Compile-Time Sound', tag: 'TYPE PURITY' },
  { value: '0', label: 'Fake Mock Sludge', tag: 'LINE OF SIGHT' },
];

export const MetricsBar: React.FC = () => {
  return (
    <div className="border-y border-white/10 bg-[#0c0e15] font-mono">
      <div className="container-grid">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {METRICS.map((m, idx) => (
            <div key={idx} className="p-6 sm:p-8 flex flex-col gap-1.5 text-center sm:text-left hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-serif-display">
                  {m.value}
                </span>
                <span className="text-[9px] text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 bg-cyan-950/20 hidden sm:inline">
                  {m.tag}
                </span>
              </div>
              <div className="text-xs text-zinc-400 tracking-wider uppercase">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
