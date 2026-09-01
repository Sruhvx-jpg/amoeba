import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MetricsBar } from './components/MetricsBar';
import { CliEmulator } from './components/CliEmulator';
import { InstallSection } from './components/InstallSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#08090e] text-[#f8fafc] relative selection:bg-[#00f0ff] selection:text-[#08090e] overflow-x-hidden">
      {/* Subtle Viewport Outer Frame */}
      <div className="amoeba-frame hidden lg:block" aria-hidden="true" />

      {/* Procedural Micro-Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none amoeba-grain opacity-20 z-0" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Impact Metrics Bar */}
      <MetricsBar />

      {/* Diagonal Pattern Divider */}
      <div className="grid-divider-pattern" />

      {/* Interactive Amoeba CLI Emulator */}
      <CliEmulator />

      {/* Diagonal Pattern Divider */}
      <div className="grid-divider-pattern" />

      {/* Installation & Source Section */}
      <InstallSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
