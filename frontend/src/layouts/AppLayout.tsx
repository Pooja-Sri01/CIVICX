import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bot, Sparkles } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DemoBanner } from '../components/layout/DemoBanner';
import { CivicXCopilotPanel } from '../components/copilot/CivicXCopilotPanel';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isMap = location.pathname === '/map';
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#EDEEF5] text-slate-900 antialiased selection:bg-civic-dark selection:text-white relative">
      <DemoBanner />
      <Navbar onOpenCopilot={() => setCopilotOpen(true)} />
      <main className="flex-1 w-full bg-[#EDEEF5]">
        <Outlet />
      </main>
      {!isMap && <Footer />}

      {/* Global Floating Copilot Trigger (Hidden on Landing page) */}
      {!isLanding && (
        <div className="fixed bottom-6 right-6 z-40 no-print">
          <button
            onClick={() => setCopilotOpen(true)}
            className="group px-4 py-2.5 rounded-2xl bg-civic-dark text-white shadow-elevated hover:bg-zinc-800 transition-all flex items-center gap-2 border border-white/20 hover:scale-105 font-mono text-xs font-bold"
          >
            <div className="w-5 h-5 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/10">
              <Bot className="w-3.5 h-3.5 text-lime" />
            </div>
            <span>CivicX Copilot</span>
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
          </button>
        </div>
      )}

      {/* Global Slide-out Copilot Panel */}
      <CivicXCopilotPanel
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </div>
  );
};

