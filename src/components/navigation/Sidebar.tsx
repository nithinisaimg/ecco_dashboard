import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Box,
  Truck,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { healthService } from '../../services/health-service';
import { API_BASE_URL } from '../../services/api-client';
import type { HealthStatus } from '../../types/api';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        setIsChecking(true);
        const res = await healthService.checkHealth();
        if (isMounted) setHealth(res);
      } catch {
        if (isMounted) setHealth({ status: 'offline', database: 'unknown', service: 'FastAPI' });
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    check();
    const interval = setInterval(check, 30000); // 30s ping
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Commodities', path: '/commodities', icon: Layers },
    { name: 'SKUs & BOM', path: '/skus', icon: Box },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Purchases', path: '/purchases', icon: ShoppingCart },
    { name: 'Forecasts', path: '/forecasts', icon: TrendingUp },
    { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { name: 'API Diagnostics', path: '/diagnostics', icon: Activity },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div
          className={`h-16 flex items-center border-b border-slate-800/80 transition-all ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              className="group relative flex items-center justify-center p-1 rounded-xl hover:bg-slate-900 transition-colors focus:outline-none"
              title="Expand sidebar"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-lg shadow-md shrink-0 transition-transform group-hover:scale-105">
                E
              </div>
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 shadow group-hover:text-amber-400 group-hover:border-amber-500/50 transition-colors">
                <ChevronRight className="w-3 h-3" />
              </span>
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-lg shadow-md shrink-0">
                  E
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm tracking-wider text-white uppercase font-sans">
                    ECCO SHOES
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-medium tracking-tight truncate">
                    Raw Material Optimization
                  </span>
                </div>
              </div>
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.path} className="relative group flex items-center">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl text-xs font-medium transition-all w-full ${
                      isCollapsed ? 'justify-center p-3 h-11' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>

                {/* Modern Flyout Tooltip to the right when Collapsed */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-medium shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 whitespace-nowrap z-50">
                    <span>{item.name}</span>
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Backend Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        {!isCollapsed ? (
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                FastAPI Backend
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isChecking
                    ? 'bg-amber-400 animate-ping'
                    : health?.status === 'healthy'
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    : 'bg-red-500'
                }`}
                title={health?.status || 'checking'}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono truncate">
              <span>{API_BASE_URL.replace(/^https?:\/\//, '')}</span>
              <span
                className={`font-semibold capitalize ${
                  health?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {health?.status || 'offline'}
              </span>
            </div>
          </div>
        ) : (
          <div className="relative group flex justify-center py-1">
            <span
              className={`w-3 h-3 rounded-full cursor-pointer transition-transform group-hover:scale-125 ${
                health?.status === 'healthy'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                  : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
              }`}
            />
            {/* Flyout tooltip for backend status in collapsed mode */}
            <div className="pointer-events-none absolute left-full ml-3 bottom-0 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono shadow-xl opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 whitespace-nowrap z-50">
              FastAPI: {health?.status || 'offline'}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
