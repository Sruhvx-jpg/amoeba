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
      {/* Navigation */}
      <Navbar />

      {/* Hero Section (Left-aligned Hermes Editorial + Right ASCII Visuals) */}
      <Hero />

      {/* WeMakeDevs 4-Column Impact Metrics Bar */}
      <MetricsBar />

      {/* Pattern Divider */}
      <div className="grid-divider-pattern" />

      {/* Section 02: Interactive CLI Emulator (Real Inquire CLI Flow) */}
      <CliEmulator />

      {/* Pattern Divider */}
      <div className="grid-divider-pattern" />

      {/* Section 03: Installation & Source (Real Working Methods: curl, git clone, cargo) */}
      <InstallSection />

      {/* Section 04: Minimal Clean Footer */}
      <Footer />
    </div>
  );
}
