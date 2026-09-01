import React from 'react';
import { GithubIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="relative w-full bg-[#06070a] text-white pt-16 pb-12 overflow-hidden border-t border-white/10">
      <div className="container-grid px-6 sm:px-12 lg:px-16 space-y-12">
        {/* Centered CTA */}
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <p className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase">
            04 / Outlaw Systems Standard
          </p>

          <h2 className="font-serif-display text-4xl sm:text-6xl font-light tracking-[0.02em] leading-none text-white">
            Amoeba CLI
          </h2>

          <p className="font-mono text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Blazing-fast CLI pairing systems speed with clean line-of-sight code.
          </p>

          <div className="pt-2">
            <a
              href="https://github.com/Sruhvx-jpg/amoeba"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f5f5f0] text-[#08090e] inline-flex items-center gap-2.5 px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-wider shadow-[0_4px_14px_rgba(0,0,0,0.6)] hover:bg-[#00f0ff] hover:text-[#08090e] transition-all cursor-pointer"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>

        {/* Ghost Wordmark */}
        <div
          aria-hidden="true"
          className="select-none pointer-events-none text-center font-serif-display font-black text-[16vw] leading-none text-white/[0.02] tracking-tighter"
        >
          AMOEBA
        </div>

        {/* Bottom Row */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
          <div>
            <p>Amoeba CLI</p>
          </div>
          <div className="flex items-center gap-3">
            <span>Zero Fluff Guarantee</span>
            <span>·</span>
            <span>MIT License · 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
