'use client';

import React, { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react';
import SuperviseurSidebar from './SuperviseurSidebar';

const COLORS = {
  midnight: '#1e3a8a',
};

export default function SuperviseurLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <SuperviseurSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600">
            <Menu size={22} />
          </button>
          <span className="font-semibold" style={{ color: COLORS.midnight }}>
            Espace Superviseur
          </span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
