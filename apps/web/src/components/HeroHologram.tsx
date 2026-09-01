import React, { useEffect, useState } from 'react';

// ASCII Art Organism & Hologram Figure
const SCULPTURE_FRAMES = [
  `
         .---.
       .'     '.
      /  .--.   \\
     |  /    \\   |     .-------------------.
     |  \\    /   |    /   AMOEBA CLI        |
      \\  '--'   /    <    SYSTEMS SCAFFOLD  |
       '.     .'      '-------------------'
         '---'
       /       \\       .::.       .::.
     .'  .---.  '.    :    :     :    :
    /   /     \\   \\    '::'       '::'
   |   |   @   |   |     .-'""'-.
   |   |  / \\  |   |   .'        '.
    \\   \\     /   /   /   .--.     \\
     '.  '---'  .'   |   /    \\     |
       '.......'     |   \\    /     |
      /         \\     \\   '--'     /
     /  .-''''-. \\     '.        .'
    |  /  ( )   \\ |      '-....-'
    | |   / \\    ||
    |  \\        / |      _.._
     \\  '-....-' /     .' .  '.
      '.        .'    /  / \\   \\
        '-....-'     |  |   |   |
                     |   \\ /    |
                      \\   '    /
                       '.    .'
                         '..'
`,
  `
         .---.
       .'  @  '.
      /  .--.   \\
     |  /  . \\   |     .-------------------.
     |  \\  ' /   |    /   AMOEBA CLI        |
      \\  '--'   /    <    SYSTEMS SCAFFOLD  |
       '.     .'      '-------------------'
         '---'
       /   .   \\       .::.       .::.
     .'  .---.  '.    : @@ :     : @@ :
    /   /     \\   \\    '::'       '::'
   |   |  @@@  |   |     .-'""'-.
   |   |  / \\  |   |   .'  ..    '.
    \\   \\     /   /   /   .--.     \\
     '.  '---'  .'   |   / @@ \\     |
       '.......'     |   \\ @@ /     |
      /    .    \\     \\   '--'     /
     /  .-''''-. \\     '.   ..   .'
    |  /  ( )   \\ |      '-....-'
    | |   / \\    ||
    |  \\   .    / |      _.._
     \\  '-....-' /     .' .  '.
      '.        .'    /  / \\   \\
        '-....-'     |  | @ |   |
                     |   \\ /    |
                      \\   '    /
                       '.    .'
                         '..'
`
];

export const HeroHologram: React.FC = () => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % SCULPTURE_FRAMES.length);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative select-none flex flex-col items-center justify-center group">
      {/* ASCII Hologram Container */}
      <div className="w-full border border-white/15 bg-[#0e1017] p-6 md:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-4 font-mono text-[10px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            <strong className="text-zinc-200">ORGANISM_FIGURE.RAW</strong>
          </span>
          <span className="text-cyan-400 bg-cyan-950/40 px-2 py-0.5 border border-cyan-500/20">CELLULAR_MATRIX</span>
        </div>

        {/* ASCII Rendering */}
        <pre className="font-mono text-[9px] xs:text-[11px] sm:text-[12px] md:text-[13px] leading-tight text-cyan-300 font-bold text-center tracking-widest overflow-x-auto whitespace-pre drop-shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          {SCULPTURE_FRAMES[frameIndex]}
        </pre>

        {/* Bottom Banner */}
        <div className="mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-zinc-500">
          <span>MEMBRANE: <strong className="text-emerald-400">ACTIVE</strong></span>
          <span>LINE-OF-SIGHT: <strong className="text-cyan-400">100%</strong></span>
        </div>
      </div>

      {/* Floating coordinates badge */}
      <div className="mt-2.5 font-mono text-[10px] tracking-widest text-zinc-500 flex items-center gap-3">
        <span>LOC: [45.109, -93.284]</span>
        <span>·</span>
        <span>SEED: 0x88F92</span>
      </div>
    </div>
  );
};
