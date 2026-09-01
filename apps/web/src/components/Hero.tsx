import React, { useState } from 'react';
import { AsciiBanner } from './AsciiBanner';
import { Terminal, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const getCurlCmd = () => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return `curl -fsSL ${window.location.origin}/install.sh | bash`;
    }
    return 'curl -fsSL https://amoeba.run/install.sh | bash';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurlCmd());
    setCopied(true);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#3b82f6', '#ffffff'],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="relative w-full pt-16 md:pt-24 pb-20 px-6 sm:px-12 lg:px-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Editorial Content */}
        <div className="lg:col-span-6 space-y-8 z-10">
          <div className="space-y-6">
            {/* Headline */}
            <h1 className="font-serif-display text-5xl sm:text-7xl lg:text-7xl xl:text-8xl font-light leading-[0.9] tracking-[0.01em] text-white">
              <span className="block font-light text-white">The CLI</span>
              <span className="block font-normal text-white">That Scaffolds</span>
              <span className="block italic font-light text-zinc-300">With You</span>
            </h1>

            {/* Subtitle */}
            <p className="font-mono text-xs sm:text-sm md:text-base text-zinc-400 max-w-xl leading-[1.8]">
              A high-performance CLI built in Rust pairing systems speed with modern architectures.
              Line-of-sight Go Fiber v3, modular TypeScript REST, and type-sound tRPC monorepos.
            </p>
          </div>

          {/* Unified Clean Install Bar */}
          <div className="pt-2 max-w-lg space-y-3">
            <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
              <span>Install via Terminal</span>
              <span className="text-[11px] text-cyan-400">cURL / Shell</span>
            </div>

            <div className="flex items-center justify-between bg-[#0e1017] border border-white/15 p-3.5 shadow-lg">
              <div className="flex items-center gap-2.5 overflow-x-auto mr-3">
                <span className="font-mono text-cyan-400 font-bold select-none">$</span>
                <code className="font-mono text-xs sm:text-sm text-zinc-100 font-bold whitespace-nowrap">
                  {getCurlCmd()}
                </code>
              </div>

              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1.5 bg-[#f5f5f0] text-[#08090e] px-4 py-2 font-mono text-xs font-bold hover:bg-[#00f0ff] transition-colors cursor-pointer"
                title="Copy command"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Single Crisp ASCII Banner Box (Clean, Uncluttered) */}
        <div className="lg:col-span-6 flex flex-col justify-center z-10">
          <AsciiBanner />
        </div>
      </div>
    </header>
  );
};
