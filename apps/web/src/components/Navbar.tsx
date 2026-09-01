import React, { useState } from 'react';
import { Menu, X, Copy, Check } from 'lucide-react';
import { GithubIcon } from './Icons';

export const Navbar: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('curl -fsSL https://amoeba.run/install.sh | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#08090e]/90 backdrop-blur-xl border-b border-white/10 transition-colors">
      <div className="container-grid px-6 sm:px-12 lg:px-16 flex h-16 items-center justify-between font-mono text-xs uppercase tracking-[0.15em]">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 group text-[#f8fafc] hover:opacity-90 transition-opacity">
            <span className="font-serif-display font-black text-xl tracking-widest text-white group-hover:text-[#00f0ff] transition-colors">
              AMOEBA
            </span>
            <span className="text-[10px] px-2 py-0.5 border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 font-bold">
              CLI
            </span>
          </a>
        </div>

        {/* Center Nav Links */}
        <div className="hidden sm:flex items-center gap-8 text-zinc-400">
          <a href="#install" className="hover:text-[#00f0ff] transition-colors">
            Installation
          </a>
          <a
            href="https://github.com/Sruhvx-jpg/amoeba"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00f0ff] transition-colors"
          >
            Source Code
          </a>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyInstall}
            className="hidden md:inline-flex items-center gap-1.5 border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] text-zinc-300 hover:text-white hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied' : 'curl install'}</span>
          </button>

          <a
            href="https://github.com/Sruhvx-jpg/amoeba"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#f5f5f0] text-[#08090e] px-4 py-1.5 font-bold shadow-[0_2px_10px_rgba(0,0,0,0.5)] hover:bg-[#00f0ff] hover:text-[#08090e] transition-all cursor-pointer"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">GitHub</span>
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 text-zinc-300 border border-white/15 bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0e1017] border-b border-white/15 p-6 flex flex-col gap-4 font-mono text-xs shadow-2xl">
          <a
            href="#install"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 hover:text-[#00f0ff] text-zinc-300"
          >
            → Installation & Source
          </a>
          <a
            href="https://github.com/Sruhvx-jpg/amoeba"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1 hover:text-[#00f0ff] text-zinc-300"
          >
            → GitHub Repository
          </a>
        </div>
      )}
    </nav>
  );
};
