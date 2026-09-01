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
    <div className="w-full border border-white/15 bg-[#0e1017] p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <strong className="text-zinc-200 tracking-wider">AMOEBA_CLI</strong>
        </div>
        <button
          onClick={handleCopy}
          className="hover:text-white flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 px-3 py-1 border border-white/10 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{copied ? 'COPIED' : 'COPY ART'}</span>
        </button>
      </div>

      <pre className="font-mono text-[10px] sm:text-xs md:text-sm leading-tight select-none overflow-x-auto text-center font-bold py-2">
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

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-zinc-300 font-medium">Amoeba Framework</span>
          <span className="text-zinc-600">—</span>
          <span className="text-cyan-400">Go & TypeScript</span>
        </div>
        <div className="text-[11px] text-zinc-500 hidden sm:block">
          LINE-OF-SIGHT CODE
        </div>
      </div>
    </div>
  );
};
