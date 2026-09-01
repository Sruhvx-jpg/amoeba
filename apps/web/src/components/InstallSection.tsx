import React, { useState } from 'react';
import { Terminal, Check, Copy, Code2, GitBranch, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const InstallSection: React.FC = () => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Dynamic host if running in browser
  const getCurlCmd = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `curl -fsSL ${window.location.origin}/install.sh | bash`;
    }
    return 'curl -fsSL https://amoeba.run/install.sh | bash';
  };

  const INSTALL_METHODS = [
    {
      num: '01',
      title: 'Quick Install via Curl',
      badge: 'RECOMMENDED',
      desc: 'Automatic platform detection (Linux / macOS / WSL) that builds or extracts the binary directly into ~/.local/bin.',
      cmd: getCurlCmd(),
      icon: Terminal,
    },
    {
      num: '02',
      title: 'Build From Source',
      badge: 'SOURCE CODE',
      desc: 'Clone the repository and compile the native binary with maximum link-time optimization (LTO).',
      cmd: 'git clone https://github.com/Sruhvx-jpg/amoeba && cd amoeba/apps/cli && cargo build --release',
      icon: Code2,
    },
    {
      num: '03',
      title: 'Cargo Direct Git Install',
      badge: 'CARGO TOOLCHAIN',
      desc: 'Install directly using the official Cargo package manager from the GitHub repository.',
      cmd: 'cargo install --git https://github.com/Sruhvx-jpg/amoeba',
      icon: GitBranch,
    },
  ];

  const handleCopy = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIdx(idx);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#00f0ff', '#3b82f6', '#f5f5f0'],
    });
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <section id="install" className="border-b border-white/10 relative">
      <div className="container-grid px-6 sm:px-12 lg:px-16 py-14 sm:py-20 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase mb-2">
              03 / Installation & Source
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              Get Started with Amoeba
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-400 max-w-sm leading-relaxed">
            Run the automated shell installer or compile from source in seconds with standard toolchains.
          </p>
        </div>

        {/* 3 Real Installation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-y border-white/10 font-mono text-xs">
          {INSTALL_METHODS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 space-y-4 flex flex-col justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-400">{item.num} /</span>
                    <span className="text-[10px] border border-white/15 bg-white/5 px-2 py-0.5 text-cyan-300">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-serif-display font-bold text-xl text-white flex items-center gap-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.title}</span>
                  </h3>

                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between bg-[#08090e] p-2.5 border border-white/10">
                    <code className="text-zinc-200 truncate mr-2 font-bold select-all">{item.cmd}</code>
                    <button
                      onClick={() => handleCopy(item.cmd, idx)}
                      className="shrink-0 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Copy command"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Post-Install Info Banner */}
        <div className="border border-white/15 bg-[#0e1017] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono shadow-md">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 border border-white/10 bg-[#121520] text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">Zero Runtime Dependencies</span>
              <span className="text-zinc-400 text-xs block sm:inline sm:ml-2">— Pure standalone binary. Runs anywhere.</span>
            </div>
          </div>

          <a
            href="https://github.com/Sruhvx-jpg/amoeba"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 bg-[#f5f5f0] text-[#08090e] font-bold text-xs uppercase tracking-wider hover:bg-[#00f0ff] transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>View Source on GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
};
