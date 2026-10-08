import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { WorkspaceTabs } from './WorkspaceTabs';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <WorkspaceTabs />
          <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
