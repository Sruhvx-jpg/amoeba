import React, { useState } from 'react';
import { GithubIcon } from './Icons';
import { Copy, Check, ArrowUpRight, ArrowUp, Terminal, Layers, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const getCurlCmd = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `curl -fsSL ${window.location.origin}/install.sh | bash`;
    }
    return 'curl -fsSL https://amoeba.run/install.sh | bash';
  };

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(getCurlCmd());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-white/10 bg-[#06070a] font-mono text-xs">
      <div className="container-grid px-6 sm:px-12 lg:px-16 pt-14 pb-10 space-y-12">
        {/* Top Multi-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand & Description - 4 cols */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-serif-display font-black text-2xl tracking-widest text-white">
                AMOEBA
              </span>
              <span className="text-[10px] px-2 py-0.5 border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 font-bold tracking-wider">
                CLI
              </span>
              <span className="text-[10px] px-2 py-0.5 border border-white/10 bg-white/5 text-zinc-400">
                v0.2.1 · Proteus
              </span>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm normal-case">
              High-performance fullstack scaffolding for Go Fiber v3, modular TypeScript REST, and type-sound tRPC monorepos. Native Rust binary with zero runtime overhead.
            </p>

            {/* Quick Install Widget */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Quick Install</span>
                <span className="text-cyan-400">cURL / Shell</span>
              </div>
              <div className="flex items-center justify-between bg-[#0e1017] border border-white/15 p-2 max-w-sm">
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <span className="text-cyan-400 font-bold select-none font-mono">$</span>
                  <code className="text-zinc-300 text-[11px] truncate font-mono select-all normal-case">
                    {getCurlCmd()}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyInstall}
                  className="shrink-0 flex items-center gap-1.5 bg-[#f5f5f0] text-[#08090e] px-2.5 py-1 text-[11px] font-bold hover:bg-[#00f0ff] transition-all cursor-pointer shadow-sm"
                  title="Copy command"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Architecture Matrix - 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              <Layers className="w-3.5 h-3.5" />
              <span>Architectures</span>
            </div>
            <ul className="space-y-2.5 text-zinc-400 text-xs normal-case">
              <li className="flex items-center gap-2 hover:text-zinc-200 transition-colors">
                <span className="w-1.5 h-1.5 bg-cyan-400 inline-block" />
                <span>Go Fiber v3 <span className="text-zinc-500 text-[11px]">(GORM / Mongo)</span></span>
              </li>
              <li className="flex items-center gap-2 hover:text-zinc-200 transition-colors">
                <span className="w-1.5 h-1.5 bg-cyan-400 inline-block" />
                <span>TypeScript REST <span className="text-zinc-500 text-[11px]">(Drizzle / Mongo)</span></span>
              </li>
              <li className="flex items-center gap-2 hover:text-zinc-200 transition-colors">
                <span className="w-1.5 h-1.5 bg-cyan-400 inline-block" />
                <span>tRPC Turborepo <span className="text-zinc-500 text-[11px]">(pnpm workspace)</span></span>
              </li>
              <li className="flex items-center gap-2 hover:text-zinc-200 transition-colors">
                <span className="w-1.5 h-1.5 bg-cyan-400 inline-block" />
                <span>Next.js 15 & React <span className="text-zinc-500 text-[11px]">(Vite frontend)</span></span>
              </li>
              <li className="flex items-center gap-2 hover:text-zinc-200 transition-colors">
                <span className="w-1.5 h-1.5 bg-cyan-400 inline-block" />
                <span>Tauri 2.0 <span className="text-zinc-500 text-[11px]">(Native desktop app)</span></span>
              </li>
            </ul>
          </div>

          {/* CLI Commands - 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              <Terminal className="w-3.5 h-3.5" />
              <span>CLI Commands</span>
            </div>
            <ul className="space-y-2.5 text-zinc-400 text-xs">
              <li className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <span className="text-cyan-400 select-none">$</span>
                  <code>amoeba new</code>
                </div>
                <p className="text-[11px] text-zinc-500 pl-4 normal-case">Interactive project scaffolding wizard</p>
              </li>
              <li className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <span className="text-cyan-400 select-none">$</span>
                  <code>amoeba start [--only-api|--only-frontend]</code>
                </div>
                <p className="text-[11px] text-zinc-500 pl-4 normal-case">Start API and frontend server engines</p>
              </li>
              <li className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <span className="text-cyan-400 select-none">$</span>
                  <code>amoeba build [--only-api|--only-frontend]</code>
                </div>
                <p className="text-[11px] text-zinc-500 pl-4 normal-case">Compile services & production bundles</p>
              </li>
              <li className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <span className="text-cyan-400 select-none">$</span>
                  <code>amoeba new pkg &lt;name&gt;</code>
                </div>
                <p className="text-[11px] text-zinc-500 pl-4 normal-case">Create internal monorepo package</p>
              </li>
              <li className="space-y-0.5">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <span className="text-cyan-400 select-none">$</span>
                  <code>amoeba update</code>
                </div>
                <p className="text-[11px] text-zinc-500 pl-4 normal-case">Self-update binary to latest release</p>
              </li>
            </ul>
          </div>

          {/* Links & Resources - 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Resources</span>
            </div>
            <ul className="space-y-2.5 text-zinc-400 text-xs">
              <li>
                <a
                  href="#install"
                  className="hover:text-cyan-400 flex items-center justify-between group transition-colors"
                >
                  <span>Installation</span>
                  <span className="text-zinc-600 group-hover:text-cyan-400">→</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sruhvx-jpg/amoeba"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00f0ff] flex items-center justify-between group transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <GithubIcon className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sruhvx-jpg/amoeba/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00f0ff] flex items-center justify-between group transition-colors"
                >
                  <span>Documentation</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sruhvx-jpg/amoeba/blob/main/docs/MODULES_GUIDE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00f0ff] flex items-center justify-between group transition-colors"
                >
                  <span>Modules Guide</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sruhvx-jpg/amoeba/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00f0ff] flex items-center justify-between group transition-colors"
                >
                  <span>Report Issue</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Status & Copyright Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          {/* Status Indicator */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-zinc-400 font-semibold">ALL SYSTEMS NOMINAL</span>
            <span className="text-zinc-700">·</span>
            <span className="text-zinc-500 hidden md:inline">STANDALONE RUST BINARY</span>
          </div>

          {/* Copyright & Back to Top */}
          <div className="flex items-center gap-6">
            <span>© 2026 AMOEBA · MIT LICENSE</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <span>TOP</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
