import React, { Suspense } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { Header, AppFooter } from "../components/layout";
import { Copy, Plus, Activity, ImageIcon, Type } from "lucide-react";
import WorkbenchDashboard from "./dashboard/WorkbenchDashboard";

// Lazy-load job runners
const NewTextJob = React.lazy(() => import("./jobs/text/NewTextJob"));

interface WorkbenchLayoutProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function WorkbenchLayout({ isDark, onToggleTheme }: WorkbenchLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      <Header isDark={isDark} onToggleTheme={onToggleTheme} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <Suspense fallback={<div className="p-8 text-center text-stone-500">Loading Workbench...</div>}>
          <Routes>
            <Route path="/" element={<WorkbenchDashboard />} />
            {/* New Job Runner Flows */}
            <Route path="/jobs/new/text" element={<NewTextJob />} />
            {/* <Route path="/jobs/new/image" element={<NewImageJob />} /> */}
            
            <Route path="*" element={<Navigate to="/workbench" replace />} />
          </Routes>
        </Suspense>
      </main>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
         <AppFooter />
      </div>
    </div>
  );
}
