import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

const BANNER_LINES = [
  "  █████╗ ███╗   ███╗ ██████╗ ███████╗██████╗  █████╗ ",
  " ██╔══██╗████╗ ████║██╔═══██╗██╔════╝██╔══██╗██╔══██╗",
  " ███████║██╔████╔██║██║   ██║█████╗  ██████╔╝███████║",
  " ██╔══██║██║╚██╔╝██║██║   ██║██╔══╝  ██╔══██╗██╔══██║",
  " ██║  ██║██║ ╚═╝ ██║╚██████╔╝███████╗██████╔╝██║  ██║",
  " ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝"
];

export const AsciiBanner: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BANNER_LINES.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full overflow-x-auto border border-white/15 bg-[#0e1017] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3.5 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <strong className="text-zinc-200 tracking-wider">AMOEBA_ASCII</strong>
          <span className="text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 border border-cyan-500/20 text-[10px]">CLI</span>
        </div>
        <button
          onClick={handleCopy}
          className="hover:text-white flex items-center gap-1 text-[11px] bg-white/5 hover:bg-white/10 px-2.5 py-1 border border-white/10 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{copied ? 'COPIED' : 'COPY'}</span>
        </button>
      </div>

      <pre className="font-mono text-[9px] xs:text-[10px] sm:text-xs md:text-[13px] leading-tight select-none overflow-x-auto text-center font-bold">
        {BANNER_LINES.map((line, idx) => {
          let colorClass = "text-cyan-400";
          if (idx >= 2 && idx < 4) colorClass = "text-blue-400";
          if (idx >= 4) colorClass = "text-indigo-300";
          
          return (
            <div key={idx} className={`${colorClass} tracking-widest`}>
              {line}
            </div>
          );
        })}
      </pre>

      <div className="mt-3.5 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2 text-[11px]">
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span className="text-zinc-300 font-medium">Amoeba Framework</span>
          <span className="text-zinc-600">—</span>
          <span className="text-cyan-400 italic">Go & TypeScript</span>
        </div>
        <div className="text-[10px] text-zinc-500">
          STRICT SOUND TYPES · LINE-OF-SIGHT
        </div>
      </div>
    </div>
  );
};
