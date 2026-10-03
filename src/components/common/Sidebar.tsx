import React from 'react';
import {
  LayoutDashboard,
  Users,
  Truck,
  Sparkles,
  TableProperties,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 'overview' | 'customers' | 'operations' | 'ai' | 'explorer' | 'about';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const companyName = user?.companyName || 'KartKing';

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="h-4 w-4" />,
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: <Truck className="h-4 w-4" />,
    },
    {
      id: 'ai',
      label: 'AI Insights',
      icon: <Sparkles className="h-4 w-4 text-amber-500" />,
      badge: 'Gemini',
    },
    {
      id: 'explorer',
      label: 'Data Explorer',
      icon: <TableProperties className="h-4 w-4" />,
    },
    {
      id: 'about',
      label: 'About & Metrics',
      icon: <Info className="h-4 w-4" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-60 flex-col justify-between border-r border-slate-200/80 bg-white p-3.5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-1">
          <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Analytics
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-700 font-semibold dark:bg-amber-500/15 dark:text-amber-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Portfolio Author Footnote */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
            {companyName} Workspace
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            E-Commerce Analytics & RFM Modeling
          </p>
          <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
            Real-Time BI · Recharts · Gemini AI
          </div>
        </div>
      </aside>
    </>
  );
};
