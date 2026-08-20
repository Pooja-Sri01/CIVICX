import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DemoBanner } from '../components/layout/DemoBanner';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isMap = location.pathname === '/map';

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-civic-dark antialiased">
      <DemoBanner />
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      {!isMap && <Footer />}
    </div>
  );
};
