import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Shield, ExternalLink, Heart } from 'lucide-react';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Institutional Responsive Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6 lg:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <img
                src="/images/iiitbh_logo.png"
                alt="IIIT Bhagalpur Emblem"
                className="w-5 h-5 object-contain shrink-0 hidden sm:inline-block"
                width="20"
                height="20"
                loading="lazy"
              />
              <span>
                © {new Date().getFullYear()} <strong>Indian Institute of Information Technology Bhagalpur</strong>. Intranet Community Portal.
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium">
              <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms & Regulations
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link to="/vision" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Vision & Leadership
              </Link>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <Link to="/contacts" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Emergency Contacts
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
