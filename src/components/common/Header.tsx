import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Moon,
  Sun,
  Upload,
  Download,
  Menu,
  X,
  FileSpreadsheet,
  LogOut,
  Shield,
  ChevronDown,
  Pencil,
  Building2,
} from 'lucide-react';
import { downloadSampleCsv } from '../../utils/csvHandler';
import { useAuth } from '../../context/AuthContext';
import { CompanySettingsModal } from './CompanySettingsModal';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenUploadModal: () => void;
  isCustomDataLoaded: boolean;
  onResetToSyntheticData: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenUploadModal,
  isCustomDataLoaded,
  onResetToSyntheticData,
  sidebarOpen,
  onToggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const companyName = user?.companyName || 'KartKing';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
        {/* Left: Mobile menu toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-xs shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setCompanyModalOpen(true)}
                  className="group flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 -mx-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  title="Click to change your company or brand name"
                >
                  <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 max-w-[160px] sm:max-w-[220px] truncate">
                    {companyName}
                  </span>
                  <Pencil className="h-3 w-3 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-amber-600 transition-all shrink-0" />
                </button>
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded dark:bg-amber-950/40 dark:text-amber-300 shrink-0">
                  India BI
                </span>
                {user?.isDemo && (
                  <span className="hidden xs:flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 shrink-0">
                    <Shield className="h-3 w-3" />
                    <span>Demo</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                Sales & Customer Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Right: Data Source Actions + Dark Mode + User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dataset state indicator */}
          {isCustomDataLoaded ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Active:</span>
              <span className="font-semibold">Custom CSV</span>
              <button
                type="button"
                onClick={onResetToSyntheticData}
                className="ml-1 text-[11px] underline hover:text-emerald-950 dark:hover:text-white cursor-pointer"
                title="Reset to 3,000 synthetic orders"
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>3,000 Synthetic Orders (2024–2025)</span>
            </div>
          )}

          {/* Download Sample CSV */}
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            title="Download schema sample CSV template"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Sample CSV</span>
          </button>

          {/* Upload Custom CSV */}
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-amber-700 transition-colors cursor-pointer"
            title={user?.isDemo ? 'Upload custom CSV for current session' : 'Upload custom CSV'}
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Upload CSV</span>
          </button>

          {/* Dark/Light mode toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* User avatar menu */}
          {user && (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-1 pl-1.5 text-left text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 transition-all cursor-pointer"
                aria-label="User account menu"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-7 w-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 font-bold text-amber-700 dark:bg-amber-400/20 dark:text-amber-300 text-xs">
                    {getInitials(user.displayName)}
                  </div>
                )}
                <span className="hidden md:inline font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                  {user.displayName || 'User'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 mr-1" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 z-50 mt-1.5 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="border-b border-slate-100 p-2.5 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {user.displayName}
                      </p>
                      {user.isDemo && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400 truncate font-mono">
                      {user.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1 text-[11px] text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                      <Building2 className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="truncate">{companyName}</span>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {/* Switch/Edit Company Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setCompanyModalOpen(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Building2 className="h-3.5 w-3.5 text-slate-500" />
                      <span>Edit Company / Brand</span>
                    </button>

                    {/* Log out */}
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Company / Workspace Switcher Modal */}
      <CompanySettingsModal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
      />
    </>
  );
};
