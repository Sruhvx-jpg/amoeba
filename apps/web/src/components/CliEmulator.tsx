import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Play, RotateCcw, Copy, Check, CornerDownLeft, Sparkles, ChevronRight } from 'lucide-react';

const BANNER_ART = `  █████╗ ███╗   ███╗ ██████╗ ███████╗██████╗  █████╗ 
 ██╔══██╗████╗ ████║██╔═══██╗██╔════╝██╔══██╗██╔══██╗
 ███████║██╔████╔██║██║   ██║█████╗  ██████╔╝███████║
 ██╔══██║██║╚██╔╝██║██║   ██║██╔══╝  ██╔══██╗██╔══██║
 ██║  ██║██║ ╚═╝ ██║╚██████╔╝███████╗██████╔╝██║  ██║
 ╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝`;

type Step = 'idle' | 'name' | 'lang' | 'ts_arch' | 'go_db' | 'ts_rest_db' | 'frontend' | 'monorepo_fe' | 'tauri_flavor' | 'scaffolding' | 'done';

interface Config {
  projectName: string;
  lang: 'go' | 'ts';
  arch?: 'rest' | 'trpc';
  db?: 'gorm' | 'mongogo' | 'drizzle' | 'mongoose';
  frontend?: 'nextjs' | 'react' | 'tauri' | 'none';
  tauriFlavor?: 'react' | 'nextjs' | 'vue' | 'svelte';
  monorepoFe?: 'web' | 'tauri' | 'both';
}

export const CliEmulator: React.FC = () => {
  const [step, setStep] = useState<Step>('idle');
  const [inputVal, setInputVal] = useState('my-app');
  const [logs, setLogs] = useState<Array<{ text: string; color?: string; bold?: boolean }>>([]);
  const [config, setConfig] = useState<Config>({
    projectName: 'my-app',
    lang: 'go',
  });
  const [copied, setCopied] = useState(false);
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  const scrollInternalTerminal = () => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollInternalTerminal();
  }, [logs, step]);

  const startCli = () => {
    setLogs([
      { text: BANNER_ART, color: 'text-cyan-400', bold: true },
      { text: '  Amoeba Framework — Blazing Fullstack Scaffolding for Go & TypeScript\n', color: 'text-zinc-400' },
    ]);
    setInputVal('my-app');
    setStep('name');
  };

  const handleNameSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = inputVal.trim() || 'my-app';
    setConfig((prev) => ({ ...prev, projectName: name }));
    setLogs((prev) => [
      ...prev,
      { text: `✔ Project Name: ${name}`, color: 'text-emerald-400', bold: true },
      { text: '\n[1/4] Choose backend language:', color: 'text-cyan-400', bold: true },
    ]);
    setStep('lang');
  };

  const selectOption = (type: Step, optIndex: number) => {
    if (type === 'lang') {
      const isGo = optIndex === 0;
      const langChoice = isGo ? 'Go (Fiber v3)' : 'TypeScript';
      setConfig((prev) => ({ ...prev, lang: isGo ? 'go' : 'ts' }));
      setLogs((prev) => [
        ...prev,
        { text: `✔ Backend Language: ${langChoice}`, color: 'text-emerald-400', bold: true },
      ]);

      if (isGo) {
        setLogs((prev) => [
          ...prev,
          { text: '\n[2/4] Choose database engine:', color: 'text-cyan-400', bold: true },
        ]);
        setStep('go_db');
      } else {
        setLogs((prev) => [
          ...prev,
          { text: '\n[2/4] Choose TypeScript architecture:', color: 'text-cyan-400', bold: true },
        ]);
        setStep('ts_arch');
      }
    } else if (type === 'go_db') {
      const isGorm = optIndex === 0;
      const dbChoice = isGorm ? 'PostgreSQL (GORM ORM)' : 'MongoDB (Official Go Driver v2)';
      setConfig((prev) => ({ ...prev, db: isGorm ? 'gorm' : 'mongogo' }));
      setLogs((prev) => [
        ...prev,
        { text: `✔ Database: ${dbChoice}`, color: 'text-emerald-400', bold: true },
        { text: '\n[3/4] Choose frontend application:', color: 'text-cyan-400', bold: true },
      ]);
      setStep('frontend');
    } else if (type === 'ts_arch') {
      const isRest = optIndex === 0;
      const archChoice = isRest ? 'Standard REST API (Modular Express)' : 'tRPC Monorepo (Turborepo + pnpm workspaces)';
      setConfig((prev) => ({ ...prev, arch: isRest ? 'rest' : 'trpc' }));
      setLogs((prev) => [
        ...prev,
        { text: `✔ Architecture: ${archChoice}`, color: 'text-emerald-400', bold: true },
      ]);

      if (isRest) {
        setLogs((prev) => [
          ...prev,
          { text: '\n[3/4] Choose database ORM setup:', color: 'text-cyan-400', bold: true },
        ]);
        setStep('ts_rest_db');
      } else {
        setLogs((prev) => [
          ...prev,
          { text: '\n[3/4] Choose frontend application(s) for tRPC monorepo:', color: 'text-cyan-400', bold: true },
        ]);
        setStep('monorepo_fe');
      }
    } else if (type === 'ts_rest_db') {
      const isDrizzle = optIndex === 0;
      const dbChoice = isDrizzle ? 'PostgreSQL (Drizzle ORM + pg driver)' : 'MongoDB (Mongoose ODM)';
      setConfig((prev) => ({ ...prev, db: isDrizzle ? 'drizzle' : 'mongoose' }));
      setLogs((prev) => [
        ...prev,
        { text: `✔ Database: ${dbChoice}`, color: 'text-emerald-400', bold: true },
        { text: '\n[4/4] Choose frontend application:', color: 'text-cyan-400', bold: true },
      ]);
      setStep('frontend');
    } else if (type === 'frontend') {
      const feOptions = ['nextjs', 'react', 'tauri', 'none'] as const;
      const feLabels = ['Next.js 15 (App Router)', 'React (Vite)', 'Tauri 2.0 (Desktop)', 'API Only (No Frontend)'];
      const feChoice = feOptions[optIndex];
      setConfig((prev) => ({ ...prev, frontend: feChoice }));
      setLogs((prev) => [
        ...prev,
        { text: `✔ Frontend: ${feLabels[optIndex]}`, color: 'text-emerald-400', bold: true },
      ]);

      if (feChoice === 'tauri') {
        setLogs((prev) => [
          ...prev,
          { text: '\nChoose desktop UI framework:', color: 'text-cyan-400', bold: true },
        ]);
        setStep('tauri_flavor');
      } else {
        triggerScaffold();
      }
    } else if (type === 'tauri_flavor') {
      const tfOptions = ['react', 'nextjs', 'vue', 'svelte'] as const;
      const tfLabels = ['React (Vite)', 'Next.js 15 (SSG)', 'Vue 3', 'Svelte 5'];
      setConfig((prev) => ({ ...prev, tauriFlavor: tfOptions[optIndex] }));
      setLogs((prev) => [
        ...prev,
        { text: `✔ Tauri Flavor: ${tfLabels[optIndex]}`, color: 'text-emerald-400', bold: true },
      ]);
      triggerScaffold();
    } else if (type === 'monorepo_fe') {
      const monoOptions = ['web', 'tauri', 'both'] as const;
      const monoLabels = ['Web App (Next.js)', 'Tauri Desktop App', 'Both (Next.js web + Tauri desktop)'];
      setConfig((prev) => ({ ...prev, monorepoFe: monoOptions[optIndex] }));
      setLogs((prev) => [
        ...prev,
        { text: `✔ Monorepo Target: ${monoLabels[optIndex]}`, color: 'text-emerald-400', bold: true },
      ]);
      triggerScaffold();
    }
  };

  const triggerScaffold = () => {
    setStep('scaffolding');
    setTimeout(() => {
      setStep('done');
    }, 450);
  };

  const resetTerminal = () => {
    setLogs([]);
    setStep('idle');
  };

  const getCliOneLiner = () => {
    let cmd = `amoeba new ${config.projectName} --lang ${config.lang}`;
    if (config.lang === 'ts') {
      cmd += ` --arch ${config.arch || 'rest'}`;
      if (config.arch === 'trpc') {
        cmd += ` --monorepo-fe ${config.monorepoFe || 'both'}`;
        return cmd;
      }
    }
    if (config.db) cmd += ` --db ${config.db}`;
    if (config.frontend) cmd += ` --frontend ${config.frontend}`;
    return cmd;
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(getCliOneLiner());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="emulator" className="border-b border-white/10 relative">
      <div className="container-grid px-6 sm:px-12 lg:px-16 py-16 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase mb-2">
              02 / Interactive Emulator
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight">
              Amoeba CLI Simulator
            </h2>
          </div>
          <p className="font-mono text-xs text-zinc-400 max-w-sm leading-relaxed">
            Experience the interactive terminal prompt directly in your browser.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="border border-white/15 bg-[#0a0c13] shadow-2xl overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0e1018] border-b border-white/10 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-zinc-300 font-bold ml-2">amoeba new</span>
            </div>

            <div className="flex items-center gap-2">
              {step !== 'idle' && (
                <button
                  type="button"
                  onClick={resetTerminal}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2.5 py-1 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restart</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyCmd}
                className="flex items-center gap-1 text-[11px] text-[#08090e] bg-[#f5f5f0] hover:bg-[#00f0ff] px-3 py-1 font-bold transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Flag'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div
            ref={terminalBodyRef}
            className="p-6 md:p-8 font-mono text-xs sm:text-sm text-zinc-200 min-h-[340px] max-h-[460px] overflow-y-auto space-y-4 leading-relaxed"
          >
            {/* Step: Idle */}
            {step === 'idle' && (
              <div className="space-y-6 py-6 text-center sm:text-left">
                <div className="space-y-2 max-w-xl">
                  <div className="text-white font-bold text-base">Interactive Scaffolding Session</div>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    Step through the native CLI wizard: select language, database, and frontend target in real time.
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={startCli}
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#f5f5f0] text-[#08090e] font-bold text-xs uppercase tracking-wider hover:bg-[#00f0ff] transition-all cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run amoeba new</span>
                  </button>
                </div>
              </div>
            )}

            {/* Printed Logs */}
            {logs.map((log, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-wrap ${log.color || 'text-zinc-300'} ${log.bold ? 'font-bold' : ''}`}
              >
                {log.text}
              </div>
            ))}

            {/* Step: Name Prompt */}
            {step === 'name' && (
              <form onSubmit={handleNameSubmit} className="space-y-3 pt-2">
                <div className="text-cyan-300 font-bold">
                  <span>? What is the name of your project?</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">›</span>
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    className="bg-transparent border-b border-cyan-400 text-white font-mono text-sm px-1 py-0.5 outline-none w-64"
                    placeholder="my-app"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1 bg-[#f5f5f0] text-[#08090e] text-xs font-bold hover:bg-[#00f0ff] cursor-pointer ml-2 flex items-center gap-1"
                  >
                    <span>Next</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}

            {/* Step: Backend Language Selection */}
            {step === 'lang' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { label: 'Go (Fiber v3)', desc: 'Pure line-of-sight sound backend' },
                  { label: 'TypeScript', desc: 'Modular Express REST or tRPC Monorepo' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOption('lang', idx)}
                    className="p-3 border border-white/10 hover:border-cyan-400 bg-white/5 hover:bg-cyan-950/30 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step: Go Database Selection */}
            {step === 'go_db' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { label: 'PostgreSQL (GORM)', desc: 'Official Postgres GORM driver' },
                  { label: 'MongoDB (Go Driver v2)', desc: 'Official Mongo Go driver v2' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOption('go_db', idx)}
                    className="p-3 border border-white/10 hover:border-cyan-400 bg-white/5 hover:bg-cyan-950/30 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step: TS Architecture Selection */}
            {step === 'ts_arch' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { label: 'Standard REST API', desc: 'Express + BaseDto + ApiError' },
                  { label: 'tRPC Monorepo', desc: 'Turborepo + pnpm workspaces' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOption('ts_arch', idx)}
                    className="p-3 border border-white/10 hover:border-cyan-400 bg-white/5 hover:bg-cyan-950/30 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step: TS REST Database Selection */}
            {step === 'ts_rest_db' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { label: 'PostgreSQL (Drizzle ORM)', desc: 'Drizzle + pg driver' },
                  { label: 'MongoDB (Mongoose)', desc: 'Schema-backed Mongoose' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOption('ts_rest_db', idx)}
                    className="p-3 border border-white/10 hover:border-cyan-400 bg-white/5 hover:bg-cyan-950/30 text-left transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step: Standard Frontend Selection */}
            {step === 'frontend' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {[
                  { label: 'Next.js 15', desc: 'App Router' },
                  { label: 'React', desc: 'Vite SPA' },
                  { label: 'Tauri 2.0', desc: 'Desktop' },
                  { label: 'API Only', desc: 'No Frontend' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOption('frontend', idx)}
                    className="p-3 border border-white/10 hover:border-cyan-400 bg-white/5 hover:bg-cyan-950/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step: Tauri Flavor Selection */}
            {step === 'tauri_flavor' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {[
                  { label: 'React (Vite)', desc: 'SPA Desktop' },
                  { label: 'Next.js 15', desc: 'Static SSG' },
                  { label: 'Vue 3', desc: 'Vite Desktop' },
                  { label: 'Svelte 5', desc: 'Runes Desktop' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOption('tauri_flavor', idx)}
                    className="p-3 border border-white/10 hover:border-cyan-400 bg-white/5 hover:bg-cyan-950/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Step: Monorepo Frontend Selection */}
            {step === 'monorepo_fe' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {[
                  { label: 'Web App Only', desc: 'Next.js web client' },
                  { label: 'Tauri App Only', desc: 'Desktop client' },
                  { label: 'Both (Web + Tauri)', desc: 'Unified monorepo' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOption('monorepo_fe', idx)}
                    className="p-3 border border-white/10 hover:border-cyan-400 bg-white/5 hover:bg-cyan-950/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="font-bold text-white group-hover:text-cyan-300">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Scaffolding Notice */}
            {step === 'scaffolding' && (
              <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 space-y-1">
                <div className="font-bold">⚡ Scaffolding project...</div>
                <div className="text-emerald-400">Writing line-of-sight sound files...</div>
              </div>
            )}

            {/* Step: Done */}
            {step === 'done' && (
              <div className="space-y-4 pt-2">
                <div className="p-4 border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 space-y-1.5">
                  <div className="font-bold text-base flex items-center gap-2 text-emerald-400">
                    <Check className="w-5 h-5" />
                    <span>Project Ready!</span>
                  </div>
                  <div className="text-xs text-zinc-300">
                    Location: <code className="text-cyan-300">/home/user/{config.projectName}</code>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-white">⚡ Next Steps:</div>
                  <div className="bg-[#04060a] p-3.5 border border-white/10 space-y-1 text-zinc-300 font-mono">
                    <div>cd <span className="text-cyan-400 font-bold">{config.projectName}</span></div>
                    {config.lang === 'go' ? (
                      <div>cd apps/api && go run ./cmd/server/main.go</div>
                    ) : config.arch === 'trpc' ? (
                      <>
                        <div>pnpm install</div>
                        <div>pnpm dev</div>
                      </>
                    ) : (
                      <div>cd apps/api && pnpm install && pnpm dev</div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={startCli}
                    className="px-4 py-2 bg-[#f5f5f0] text-[#08090e] font-bold text-xs uppercase hover:bg-[#00f0ff] transition-colors cursor-pointer"
                  >
                    Scaffold Another Project
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Bottom Command Output */}
          <div className="px-4 py-3 bg-[#08090e] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs">
            <div className="text-zinc-400 flex items-center gap-2">
              <span className="text-zinc-500">CLI FLAG:</span>
              <code className="text-cyan-400 bg-white/5 px-2 py-0.5 border border-white/5 select-all">
                {getCliOneLiner()}
              </code>
            </div>

            <div className="text-zinc-500 text-[11px]">
              SUB-MILLISECOND EXECUTION
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
