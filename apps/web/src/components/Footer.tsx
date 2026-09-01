import React, { useState } from 'react';
import { GithubIcon } from './Icons';
import { Terminal, Copy, Check, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('curl -fsSL https://amoeba.run/install.sh | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="relative w-full bg-[#06070a] text-white pt-20 pb-12 overflow-hidden border-t border-white/10">
      <div className="container-grid px-6 sm:px-12 lg:px-16 space-y-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-12 border-b border-white/10 font-mono text-xs">
          {/* Col 1: Brand & Tagline (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-serif-display font-black text-2xl tracking-widest text-white">
                AMOEBA
              </span>
              <span className="text-[10px] px-2 py-0.5 border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 font-bold">
                CLI
              </span>
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              High-performance CLI pairing systems speed with line-of-sight Go Fiber v3, modular TypeScript REST, and tRPC monorepos.
            </p>

            <div className="pt-1 flex items-center gap-3">
              <button
                onClick={handleCopyInstall}
                className="inline-flex items-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 hover:border-cyan-500/30 text-zinc-300 hover:text-white px-3 py-2 text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copied ? 'Command Copied' : 'curl -fsSL amoeba.run/install.sh | bash'}</span>
              </button>
            </div>
          </div>

          {/* Col 2: CLI Commands (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              CLI Commands
            </div>
            <ul className="space-y-2.5 text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">$</span>
                <code className="text-zinc-200">amoeba new</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">$</span>
                <code className="text-zinc-200">amoeba new pkg &lt;name&gt;</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">$</span>
                <code className="text-zinc-200">amoeba update</code>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">$</span>
                <code className="text-zinc-200">cargo build --release</code>
              </li>
            </ul>
          </div>

          {/* Col 3: Supported Architectures (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              Architecture
            </div>
            <ul className="space-y-2 text-zinc-400">
              <li>Go (Fiber v3)</li>
              <li>PostgreSQL (GORM)</li>
              <li>Drizzle ORM</li>
              <li>tRPC Monorepos</li>
              <li>Tauri 2.0 Desktop</li>
            </ul>
          </div>

          {/* Col 4: Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              Repository
            </div>
            <ul className="space-y-2.5 text-zinc-400">
              <li>
                <a
                  href="https://github.com/Sruhvx-jpg/amoeba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00f0ff] flex items-center gap-1.5 transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="#install" className="hover:text-[#00f0ff] transition-colors">
                  Installation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sruhvx-jpg/amoeba/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00f0ff] flex items-center gap-1 transition-colors"
                >
                  <span>Documentation</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ghost Wordmark */}
        <div
          aria-hidden="true"
          className="select-none pointer-events-none text-center font-serif-display font-black text-[16vw] leading-none text-white/[0.02] tracking-tighter"
        >
          AMOEBA
        </div>

        {/* Bottom Metadata Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Amoeba CLI</span>
            <span className="text-zinc-600">·</span>
            <span>Systems Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Sruhvx-jpg/amoeba"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Star on GitHub
            </a>
            <span className="text-zinc-600">·</span>
            <span>© 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
