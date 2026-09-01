import React, { useState } from 'react';
import { HeroHologram } from './HeroHologram';
import { AsciiBanner } from './AsciiBanner';
import { Terminal, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Hero: React.FC = () => {
  const [copiedTerminal, setCopiedTerminal] = useState(false);
  const [copiedBtn, setCopiedBtn] = useState(false);
  const [method, setMethod] = useState<'curl' | 'git' | 'cargo'>('curl');

  const getCurlCmd = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `curl -fsSL ${window.location.origin}/install.sh | bash`;
    }
    return 'curl -fsSL https://amoeba.run/install.sh | bash';
  };

  const COMMANDS = {
    curl: getCurlCmd(),
    git: 'git clone https://github.com/Sruhvx-jpg/amoeba && cd amoeba/apps/cli && cargo build --release',
    cargo: 'cargo install --git https://github.com/Sruhvx-jpg/amoeba',
  };

  const handleCopyCmd = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedTerminal(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#3b82f6', '#f5f5f0', '#ffffff'],
    });
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  const handleCopyMain = () => {
    navigator.clipboard.writeText(getCurlCmd());
    setCopiedBtn(true);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#f5f5f0'],
    });
    setTimeout(() => setCopiedBtn(false), 2000);
  };

  return (
    <header className="relative w-full pt-12 md:pt-16 pb-16 px-6 sm:px-12 md:px-16 overflow-hidden">
      <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
        {/* Left Column: Editorial Content */}
        <div className="lg:col-span-7 space-y-8 flex flex-col justify-between z-10">
          <div className="space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 font-mono text-xs sm:text-sm tracking-[0.2em] text-zinc-300 border border-white/15 px-3.5 py-1.5 bg-[#121520]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
              <span>Open Source • MIT License</span>
            </div>

            {/* Solid, Crystal-Clear White Headline (No broken gradient blackouts) */}
            <h1 className="font-serif-display text-5xl sm:text-7xl md:text-8xl xl:text-[6rem] font-light leading-[0.9] tracking-[0.01em] text-white">
              <span className="block font-light text-white">The CLI</span>
              <span className="block font-normal text-white">That Scaffolds</span>
              <span className="block italic font-light text-zinc-300">With You</span>
            </h1>

            {/* Monospace Subtitle */}
            <p className="font-mono text-xs sm:text-sm md:text-base text-zinc-300 max-w-2xl leading-[1.7]">
              A high-performance CLI built in Rust pairing systems speed with modern frontend and backend architectures.
              Zero-divergence line-of-sight Go Fiber v3, modular TypeScript REST, and end-to-end type-sound tRPC monorepos.
            </p>
          </div>

          {/* Action Sections */}
          <div className="space-y-6 pt-2 max-w-xl">
            {/* Section 1: One-Click Quick Command */}
            <div className="space-y-2">
              <p className="font-mono text-xs tracking-[0.14em] text-zinc-300">
                Quick Install via Shell
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCopyMain}
                  className="group bg-[#f5f5f0] text-[#08090e] inline-flex items-center gap-3 px-6 py-3.5 shadow-lg hover:bg-[#00f0ff] hover:text-[#08090e] transition-all font-mono text-xs sm:text-sm font-bold tracking-wider cursor-pointer"
                >
                  {copiedBtn ? <Check className="w-4 h-4 text-emerald-600" /> : <Terminal className="w-4 h-4" />}
                  <span>{copiedBtn ? 'Command Copied to Clipboard!' : 'Copy Install Command (curl)'}</span>
                </button>
              </div>
            </div>

            {/* Section 2: Terminal Install Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs tracking-[0.14em] text-zinc-300">
                <span>Terminal Installation</span>
                <div className="flex items-center gap-2 text-[10px]">
                  {[
                    { id: 'curl', label: 'curl (sh)' },
                    { id: 'git', label: 'git clone' },
                    { id: 'cargo', label: 'cargo git' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMethod(item.id as any)}
                      className={`px-2 py-0.5 border cursor-pointer transition-colors ${
                        method === item.id
                          ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/40'
                          : 'border-transparent text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#0e1017] border border-white/20 p-3.5 sm:p-4 shadow-md">
                <div className="flex items-center gap-2.5 overflow-x-auto mr-3">
                  <span className="font-mono text-cyan-400 font-bold select-none">$</span>
                  <code className="font-mono text-xs sm:text-sm text-zinc-100 font-bold whitespace-nowrap">
                    {COMMANDS[method]}
                  </code>
                </div>

                <button
                  onClick={() => handleCopyCmd(COMMANDS[method])}
                  className="shrink-0 flex items-center gap-1.5 bg-[#f5f5f0] text-[#08090e] px-3.5 py-1.5 font-mono text-xs font-bold hover:bg-[#00f0ff] transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copiedTerminal ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTerminal ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Line */}
          <div className="pt-4 flex flex-wrap items-center gap-6 font-mono text-xs text-zinc-400 border-t border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
              <span>Instant Execution</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
              <span>Line-of-Sight Go Fiber v3</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>Zero Boilerplate Mocks</span>
            </div>
          </div>
        </div>

        {/* Right Column: ASCII Sculpture & Organism Figures */}
        <div className="lg:col-span-5 flex flex-col gap-6 z-10">
          <HeroHologram />
          <AsciiBanner />
        </div>
      </div>
    </header>
  );
};
