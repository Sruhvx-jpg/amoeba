import React, { useState } from 'react';
import { GithubIcon } from './Icons';
import { Copy, Check, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('curl -fsSL https://amoeba.run/install.sh | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-white/10 bg-[#06070a] py-14 font-mono text-xs">
      <div className="container-grid px-6 sm:px-12 lg:px-16 space-y-8">
        {/* Main Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/10">
          {/* Brand & Mission */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-serif-display font-black text-2xl tracking-widest text-white">
                AMOEBA
              </span>
              <span className="text-[10px] px-2 py-0.5 border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 font-bold">
                CLI
              </span>
            </div>
            <p className="text-zinc-400 text-xs max-w-md leading-relaxed">
              Systems-speed fullstack scaffolding for Go Fiber v3, modular TypeScript REST, and tRPC monorepos.
            </p>
          </div>

          {/* Quick Install Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={handleCopyInstall}
              className="inline-flex items-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 hover:border-cyan-500/30 text-zinc-300 hover:text-white px-3.5 py-2 transition-all cursor-pointer text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="text-zinc-200">{copied ? 'Copied' : 'curl install'}</span>
            </button>

            <a
              href="https://github.com/Sruhvx-jpg/amoeba"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#f5f5f0] text-[#08090e] px-4 py-2 font-bold hover:bg-[#00f0ff] transition-all cursor-pointer text-xs shadow-sm"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>Amoeba CLI</span>
            <span className="text-zinc-700">·</span>
            <span>Go & TypeScript Scaffolding</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#install" className="hover:text-cyan-400 transition-colors">
              Installation
            </a>
            <a
              href="https://github.com/Sruhvx-jpg/amoeba/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              Documentation
            </a>
            <span className="text-zinc-600">© 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
