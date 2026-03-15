import React from "react";
import { NavLink, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { FlaskConical, Layers, Settings2, History, ChevronLeft, LayoutDashboard, Building2, Sun, Moon } from "lucide-react";
import { ThemeToggleButton } from "../components/common/UI";
import { cn } from "../lib/utils";
import StudioHome from "./StudioHome.tsx";
import PatternList from "./patterns/PatternList.tsx";
import EntityList from "./entities/EntityList.tsx";
import ConfigList from "./configurations/ConfigList.tsx";
import JobList from "./jobs/JobList.tsx";

interface StudioLayoutProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/studio", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/studio/patterns", label: "Patterns", icon: FlaskConical },
  { to: "/studio/entities", label: "Entities", icon: Building2 },
  { to: "/studio/configurations", label: "Configurations", icon: Settings2 },
  { to: "/studio/jobs", label: "Job History", icon: History },
];

export default function StudioLayout({ isDark, onToggleTheme }: StudioLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 font-sans text-stone-900">
      {/* Sidebar */}
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-stone-200 bg-white">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-stone-100 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Layers className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 leading-none">Studio</p>
            <p className="text-[10px] text-stone-400 mt-0.5">Obsura</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Studio navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-stone-100 p-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to app
          </button>
          <ThemeToggleButton
            isDark={isDark}
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </ThemeToggleButton>
        </div>
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Routes>
          <Route index element={<StudioHome />} />
          <Route path="patterns/*" element={<PatternList />} />
          <Route path="entities/*" element={<EntityList />} />
          <Route path="configurations/*" element={<ConfigList />} />
          <Route path="jobs/*" element={<JobList />} />
          <Route path="*" element={<Navigate to="/studio" replace />} />
        </Routes>
      </div>
    </div>
  );
}
