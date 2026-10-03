import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Filter,
  RotateCcw,
  ChevronDown,
  X,
  Check,
  Search,
} from 'lucide-react';
import { FilterState, Region, Category, PaymentMethod, DatePreset } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
  availableStates: string[];
  totalFilteredCount: number;
  totalTotalCount: number;
}

const REGIONS: Region[] = ['North', 'South', 'West', 'East'];
const CATEGORIES: Category[] = [
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Books',
  'Grocery',
];
const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'COD',
  'Net Banking',
];

interface MultiSelectDropdownProps<T extends string> {
  label: string;
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
}

function MultiSelectDropdown<T extends string>({
  label,
  options,
  selected,
  onChange,
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (opt: T) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((item) => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const selectAll = () => onChange(options);
  const clearAll = () => onChange([]);

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          selected.length > 0
            ? 'border-amber-500/50 bg-amber-50/50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/20 dark:text-amber-200'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750'
        }`}
      >
        <span>{label}</span>
        {selected.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {options.length > 6 && (
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1 pl-7 pr-2 text-xs text-slate-800 outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
          )}

          <div className="mb-1.5 flex items-center justify-between border-b border-slate-100 pb-1.5 px-1 text-[11px] text-slate-500 dark:border-slate-700/80">
            <button
              type="button"
              onClick={selectAll}
              className="text-amber-600 hover:underline dark:text-amber-400 font-medium"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <p className="p-2 text-center text-xs text-slate-400">No match found</p>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    onClick={() => toggleOption(opt)}
                    className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  >
                    <span className={isChecked ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}>
                      {opt}
                    </span>
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        isChecked
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  availableStates,
  totalFilteredCount,
  totalTotalCount,
}) => {
  const [showCustomDate, setShowCustomDate] = useState(filters.datePreset === 'custom');

  const handlePresetChange = (preset: DatePreset) => {
    let start = '2024-01-01';
    let end = '2025-12-31';

    if (preset === 'last_30_days') {
      start = '2025-12-01';
      end = '2025-12-31';
      setShowCustomDate(false);
    } else if (preset === 'last_quarter') {
      start = '2025-10-01';
      end = '2025-12-31';
      setShowCustomDate(false);
    } else if (preset === 'this_year') {
      start = '2025-01-01';
      end = '2025-12-31';
      setShowCustomDate(false);
    } else if (preset === 'all_time') {
      start = '2024-01-01';
      end = '2025-12-31';
      setShowCustomDate(false);
    } else if (preset === 'custom') {
      setShowCustomDate(true);
      return;
    }

    onChange({
      ...filters,
      datePreset: preset,
      startDate: start,
      endDate: end,
    });
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', val: string) => {
    onChange({
      ...filters,
      datePreset: 'custom',
      [field]: val,
    });
  };

  const hasActiveFilters =
    filters.regions.length > 0 ||
    filters.states.length > 0 ||
    filters.categories.length > 0 ||
    filters.paymentMethods.length > 0 ||
    filters.datePreset !== 'all_time' ||
    Boolean(filters.searchQuery);

  return (
    <div className="sticky top-0 z-30 flex flex-col gap-2.5 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Date presets segmented control */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <Calendar className="ml-1.5 mr-0.5 h-3.5 w-3.5 text-slate-400" />
          <button
            type="button"
            onClick={() => handlePresetChange('last_30_days')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              filters.datePreset === 'last_30_days'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('last_quarter')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              filters.datePreset === 'last_quarter'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Last Quarter
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('this_year')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              filters.datePreset === 'this_year'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            This Year (2025)
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('all_time')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              filters.datePreset === 'all_time'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            type="button"
            onClick={() => handlePresetChange('custom')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              filters.datePreset === 'custom'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Custom date range inputs when active */}
        {showCustomDate && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={filters.startDate}
              min="2024-01-01"
              max={filters.endDate}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={filters.endDate}
              min={filters.startDate}
              max="2025-12-31"
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs"
            />
          </div>
        )}

        {/* Order count metadata */}
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{totalFilteredCount.toLocaleString('en-IN')}</span> of{' '}
          <span className="tabular-nums">{totalTotalCount.toLocaleString('en-IN')}</span> orders
        </div>
      </div>

      {/* Multi-select filter pills and Reset button */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mr-1">
          <Filter className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        <MultiSelectDropdown
          label="Region"
          options={REGIONS}
          selected={filters.regions}
          onChange={(regions) => onChange({ ...filters, regions })}
        />

        <MultiSelectDropdown
          label="State"
          options={availableStates}
          selected={filters.states}
          onChange={(states) => onChange({ ...filters, states })}
        />

        <MultiSelectDropdown
          label="Category"
          options={CATEGORIES}
          selected={filters.categories}
          onChange={(categories) => onChange({ ...filters, categories })}
        />

        <MultiSelectDropdown
          label="Payment"
          options={PAYMENT_METHODS}
          selected={filters.paymentMethods}
          onChange={(paymentMethods) => onChange({ ...filters, paymentMethods })}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors ml-auto"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
