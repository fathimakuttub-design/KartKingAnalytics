import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  Loader2,
} from 'lucide-react';
import { parseUploadedCsv, downloadSampleCsv, ParseResult } from '../../utils/csvHandler';
import { Order } from '../../types';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (orders: Order[], filename: string) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setParseResult({
        orders: [],
        errors: ['Please upload a valid .csv file.'],
        warnings: [],
        totalRows: 0,
      });
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    try {
      const result = await parseUploadedCsv(selectedFile);
      setParseResult(result);
    } catch (err: any) {
      setParseResult({
        orders: [],
        errors: [`Unexpected parsing error: ${err.message}`],
        warnings: [],
        totalRows: 0,
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (parseResult && parseResult.orders.length > 0) {
      onDataLoaded(parseResult.orders, file?.name || 'custom_dataset.csv');
      onClose();
    }
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Upload Custom Orders CSV
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Analyze your own store's transactions in real-time
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 dark:border-slate-700 dark:bg-slate-850 dark:hover:bg-slate-800'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <FileText className="h-6 w-6 text-amber-600" />
                <span className="font-semibold text-sm">{file.name}</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Drag and drop your CSV file here, or{' '}
                  <span className="text-amber-600 dark:text-amber-400 underline">browse</span>
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  Must follow KartKing order schema (order_id, order_date, customer_id, etc.)
                </p>
              </>
            )}
          </div>

          {/* Loading state */}
          {isParsing && (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-600 dark:text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              <span>Parsing and validating CSV schema...</span>
            </div>
          )}

          {/* Errors & Validation feedback */}
          {parseResult && (
            <div className="space-y-2">
              {parseResult.errors.length > 0 ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Unable to process CSV</p>
                      <ul className="mt-1 list-disc list-inside space-y-0.5">
                        {parseResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-semibold">CSV Validated Successfully!</p>
                      <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                        Found <span className="font-bold">{parseResult.orders.length}</span> orders. Ready to update the entire dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {parseResult.warnings.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                  <p className="font-medium">Data Warnings:</p>
                  <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                    {parseResult.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Sample template download link */}
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
            <span className="text-slate-600 dark:text-slate-400">
              Need a schema reference to format your data?
            </span>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="flex items-center gap-1 font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Sample CSV</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!parseResult || parseResult.orders.length === 0}
            onClick={handleApply}
            className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Load into Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
