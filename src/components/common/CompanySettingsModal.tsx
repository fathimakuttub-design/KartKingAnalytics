import React, { useState, useEffect } from 'react';
import { X, Building2, Check, Sparkles, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_COMPANIES = [
  { company: 'KartKing', site: 'KartKing Analytics' },
  { company: 'Nykaa', site: 'Nykaa Commercial Intelligence' },
  { company: 'Zomato', site: 'Zomato Commerce BI' },
  { company: 'MyStore', site: 'MyStore Retail Analytics' },
  { company: 'Flipkart Seller', site: 'Flipkart Marketplace BI' },
  { company: 'Zara India', site: 'Zara Retail Analytics' },
];

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateCompanyName, websiteName, updateWebsiteName } = useAuth();
  const [company, setCompany] = useState(user?.companyName || 'KartKing');
  const [siteName, setSiteName] = useState(websiteName || 'KartKing Analytics');
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCompany(user?.companyName || 'KartKing');
      setSiteName(websiteName || 'KartKing Analytics');
      setSavedToast(false);
    }
  }, [isOpen, user?.companyName, websiteName]);

  if (!isOpen) return null;

  const handleCompanyChange = (val: string) => {
    setCompany(val);
    // Suggest website name if user hasn't heavily customized it
    if (!siteName || siteName.endsWith('Analytics') || siteName === 'KartKing Analytics') {
      setSiteName(`${val.trim() || 'KartKing'} Analytics`);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalCompany = company.trim() || 'KartKing';
    const finalSite = siteName.trim() || `${finalCompany} Analytics`;

    updateCompanyName(finalCompany);
    updateWebsiteName(finalSite);
    setSavedToast(true);

    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 600);
  };

  const handleSelectPreset = (preset: { company: string; site: string }) => {
    setCompany(preset.company);
    setSiteName(preset.site);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 id="company-settings-title" className="text-base font-bold text-slate-900 dark:text-white">
                Website & Brand Name Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rename the website title and your company workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {/* Website / Platform Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="website-name-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Website / Platform Name
            </label>
            <input
              id="website-name-input"
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. Zara Retail Intelligence, Nykaa Analytics, Apex BI"
              autoFocus
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-400"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Updates your browser tab title, login headers, and global system branding.
            </p>
          </div>

          {/* Company / Brand Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="company-name-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Company / Brand Workspace
            </label>
            <input
              id="company-name-input"
              type="text"
              value={company}
              onChange={(e) => handleCompanyChange(e.target.value)}
              placeholder="e.g. Nykaa, Zomato, MyStore, Fathima Retail"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-400"
            />
          </div>

          {/* Quick preset suggestions */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COMPANIES.map((preset) => {
                const isActive = company.toLowerCase() === preset.company.toLowerCase();
                return (
                  <button
                    key={preset.company}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'
                    }`}
                  >
                    {preset.company}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200 flex items-start gap-2">
            <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              Live preview in tab: <strong className="font-semibold text-amber-950 dark:text-amber-100">{siteName || 'Analytics'}</strong>
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition-colors cursor-pointer"
            >
              {savedToast ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Updated!</span>
                </>
              ) : (
                <span>Save & Apply Name</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
