'use client';

import type React from 'react';
import { useEffect } from 'react';
import { Sidebar } from '../sidebar/Sidebar.dashboard';
import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
  const { pathname } = useLocation();
  
  // Reset scroll position on route change
  useEffect(() => {
    const mainContent = document.querySelector('.dashboard-main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [pathname]);
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <motion.div
        className="flex-1 overflow-auto dashboard-main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;
