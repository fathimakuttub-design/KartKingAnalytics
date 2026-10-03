import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { AnalyticsSummary, AiInsightsResponse, AiInsight, AiRecommendation } from '../../types';
import { ChartCard } from '../common/ChartCard';
import { formatINR } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface AiInsightsPageProps {
  summary: AnalyticsSummary;
  isFilteredEmpty: boolean;
}

export const AiInsightsPage: React.FC<AiInsightsPageProps> = ({ summary, isFilteredEmpty }) => {
  const { user } = useAuth();
  const companyName = user?.companyName || 'KartKing';

  const [insightsData, setInsightsData] = useState<AiInsightsResponse | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Q&A state
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string; time: string }>>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const sampleQuestions = [
    `Which merchandise category should ${companyName} discount before Diwali to maximize net margins?`,
    `Why is Fashion experiencing elevated return rates at ${companyName}, and what operational steps can reduce reverse logistics?`,
    'How does delivery delay impact our 5-star customer ratings across regional zones?',
    'What strategy will convert our "At Risk" customers back into "Loyal" or "Champions"?',
  ];

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true);
    setInsightsError(null);

    try {
      const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, companyName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with HTTP ${response.status}`);
      }

      const data: AiInsightsResponse = await response.json();
      setInsightsData(data);
    } catch (err: any) {
      console.error('Failed to fetch AI insights:', err);
      setInsightsError(
        err.message ||
          'Failed to connect to the Gemini intelligence service. Ensure GEMINI_API_KEY is configured.'
      );
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleAskQuestion = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const targetQuestion = (customQuestion || query).trim();
    if (!targetQuestion || isAsking) return;

    setIsAsking(true);
    setAskError(null);

    try {
      const response = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQuestion, summary, companyName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      setChatHistory((prev) => [
        {
          q: targetQuestion,
          a: data.answer || 'No analysis available for this inquiry.',
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
      setQuery('');
    } catch (err: any) {
      console.error('Failed to answer question:', err);
      setAskError(err.message || 'Unable to analyze question with Gemini API.');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-amber-50/40 to-white p-6 dark:border-amber-900/50 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Executive AI Intelligence Engine
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Powered by <span className="font-semibold text-slate-800 dark:text-slate-200">Gemini 3.8 Flash</span>. Generates strategic insights and actionable recommendations synthesized directly from current filtered KPI aggregations (no raw rows transmitted).
            </p>
          </div>

          <button
            type="button"
            disabled={isLoadingInsights || isFilteredEmpty}
            onClick={handleGenerateInsights}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:from-amber-700 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {isLoadingInsights ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Synthesizing Insights...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Executive Insights</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Error state if any */}
      {insightsError && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">AI Generation Notice</p>
            <p className="mt-0.5">{insightsError}</p>
          </div>
        </div>
      )}

      {/* 3. Generated Insights Display */}
      {insightsData && (
        <div className="space-y-6">
          {/* Executive Summary */}
          {insightsData.executiveSummary && (
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Executive Synthesis
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {insightsData.executiveSummary}
              </p>
            </div>
          )}

          {/* 5 Business Insights */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                5 Key Analytical Insights
              </h3>
              <span className="text-xs text-slate-400">Grounded in filtered transactions</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {insightsData.insights?.map((item: AiInsight, idx: number) => {
                const isWarning = item.severity === 'warning';
                const isPositive = item.severity === 'positive';
                const borderClass = isWarning
                  ? 'border-amber-200 dark:border-amber-900/40'
                  : isPositive
                  ? 'border-emerald-200 dark:border-emerald-900/40'
                  : 'border-slate-200/80 dark:border-slate-800';

                return (
                  <div
                    key={idx}
                    className={`flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-all dark:bg-slate-900 ${borderClass}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Insight 0{idx + 1}
                        </span>
                        {item.metric && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.metric}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.observation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 Recommended Actions */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                3 Strategic Recommended Actions
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {insightsData.recommendations?.map((rec: AiRecommendation, idx: number) => {
                const priorityBadge =
                  rec.priority === 'High'
                    ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300'
                    : rec.priority === 'Medium'
                    ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300';

                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${priorityBadge}`}>
                          {rec.priority} Priority
                        </span>
                        <span className="text-[11px] text-slate-400">Action 0{idx + 1}</span>
                      </div>
                      <h4 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                        {rec.action}
                      </h4>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Expected Impact:</span>{' '}
                        {rec.impact}
                      </p>
                    </div>
                    {rec.timeline && (
                      <div className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-400 dark:border-slate-800 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Timeline: {rec.timeline}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Natural Language Q&A Chat Console */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Analytical Q&A Assistant
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Ask any freeform question about KartKing's commercial health, festive trends, or returns. Answers are grounded in the aggregated data above.
          </p>
        </div>

        {/* Preset sample questions */}
        <div className="mb-4 flex flex-wrap gap-2">
          {sampleQuestions.map((qText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAskQuestion(undefined, qText)}
              className="rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-left text-xs text-slate-700 hover:border-amber-400 hover:bg-amber-50/40 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-amber-500 transition-colors"
            >
              "{qText}"
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleAskQuestion} className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question (e.g., Which category should we discount before Diwali?)..."
            disabled={isAsking}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-4 pr-12 text-xs text-slate-900 outline-none focus:border-amber-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:border-amber-400 transition-colors"
          />
          <button
            type="submit"
            disabled={!query.trim() || isAsking}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 transition-colors"
          >
            {isAsking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>

        {askError && (
          <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{askError}</p>
        )}

        {/* History responses */}
        {chatHistory.length > 0 && (
          <div className="mt-6 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            {chatHistory.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800/60 dark:bg-slate-800/30 text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Q: {item.q}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{item.time}</span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-200/50 pt-2 dark:border-slate-700/50">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
