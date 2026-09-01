import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MetricsBar } from './components/MetricsBar';
import { InstallSection } from './components/InstallSection';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#08090e] text-[#f8fafc] relative selection:bg-[#00f0ff] selection:text-[#08090e] overflow-x-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section (Left Editorial + Right Amoeba ASCII Art & Banner) */}
      <Hero />

      {/* Impact Metrics Bar */}
      <MetricsBar />

      {/* Diagonal Pattern Divider */}
      <div className="grid-divider-pattern" />

      {/* Section 02: Installation & Source (Real Working Methods: curl, git clone, cargo) */}
      <InstallSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
