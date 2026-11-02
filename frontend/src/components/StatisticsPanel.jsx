import { useState, useMemo } from "react";
import {
  Activity,
  Sigma,
  BarChart3,
  Database,
  TrendingUp,
  Layers3,
  Table as TableIcon,
  Binary,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import BarChartComponent from "./charts/BarChartComponent";
import PieChartComponent from "./charts/PieChartComponent";
import ScatterChartComponent from "./charts/ScatterChartComponent";
import GraphEnclosure from "./UI/graphModal";
import { useAIContext } from "../context/AIContext";
import AIInsightCard from "./common/AIInsightCard";
import InfoTooltip from "./UI/InfoTooltip";
import { getTooltipContent } from "../utils/tooltipContent";
import { StatusBadge, MetricStatCard, SearchInput, FilterButtonGroup } from "./common";

// Safely format a numeric value to fixed decimal places.
const safeFixed = (val, n = 2) =>
  val != null && Number.isFinite(Number(val)) ? Number(val).toFixed(n) : "N/A";

/**
 * Enterprise StatisticsPanel Component
 * Comprehensive descriptive statistics laboratory displaying feature scorecards,
 * central tendency distributions, categorical frequency profiles, and bivariate Pearson correlations.
 */
const StatisticsPanel = ({ statistics }) => {
  const {
    explanations,
    loadingExplanations,
    explanationsError,
    explanationsCacheUsed,
    fetchAIExplanations,
  } = useAIContext();

  const [activeTab, setActiveTab] = useState("numerical"); // 'numerical' | 'categorical' | 'correlation'
  const [searchQuery, setSearchQuery] = useState("");
  const [skewFilter, setSkewFilter] = useState("all"); // 'all' | 'high' | 'moderate' | 'symmetric'
  const [sortField, setSortField] = useState("column");
  const [sortDirection, setSortDirection] = useState("asc");

  const numerical = useMemo(() => statistics?.numerical || [], [statistics?.numerical]);
  const categorical = useMemo(() => statistics?.categorical || [], [statistics?.categorical]);
  const correlation = useMemo(() => statistics?.correlation || [], [statistics?.correlation]);

  const qualityExplanation =
    explanations?.summary_explanations?.quality_ai_explanation ||
    explanations?.quality_ai_explanation;

  const totalNumeric = numerical.length;
  const totalCategorical = categorical.length;
  const totalDimensions = totalNumeric + totalCategorical;

  // Chart transformations (unconditionally declared hooks)
  const meanData = useMemo(() => {
    return numerical.map((item) => ({
      column: item.column,
      mean: Number(safeFixed(item.mean, 2)),
    }));
  }, [numerical]);

  const schemaPie = useMemo(() => {
    return [
      { name: "Numerical", value: totalNumeric },
      { name: "Categorical", value: totalCategorical },
    ];
  }, [totalNumeric, totalCategorical]);

  const correlationData = useMemo(() => {
    return correlation
      .filter((item) => item.x !== item.y)
      .slice(0, 60)
      .map((item, idx) => ({
        x: idx,
        y: item.value,
        pair: `${item.x} × ${item.y}`,
      }));
  }, [correlation]);

  // Top strongest non-identical correlation pairs
  const topCorrelations = useMemo(() => {
    const uniquePairs = new Map();
    correlation.forEach((item) => {
      if (item.x === item.y) return;
      const key = [item.x, item.y].sort().join("___");
      if (!uniquePairs.has(key)) {
        uniquePairs.set(key, { ...item, absVal: Math.abs(item.value) });
      }
    });
    return Array.from(uniquePairs.values())
      .sort((a, b) => b.absVal - a.absVal)
      .slice(0, 6);
  }, [correlation]);

  // Filtering & Sorting for Numerical Features Table
  const filteredNumerical = useMemo(() => {
    let result = numerical.filter((item) =>
      item.column.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    if (skewFilter === "high") {
      result = result.filter((item) => item.skew != null && Math.abs(item.skew) > 1);
    } else if (skewFilter === "moderate") {
      result = result.filter(
        (item) => item.skew != null && Math.abs(item.skew) >= 0.5 && Math.abs(item.skew) <= 1
      );
    } else if (skewFilter === "symmetric") {
      result = result.filter((item) => item.skew != null && Math.abs(item.skew) < 0.5);
    }

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [numerical, searchQuery, skewFilter, sortField, sortDirection]);

  // Filtering for Categorical Features
  const filteredCategorical = useMemo(() => {
    return categorical.filter((item) =>
      item.column.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [categorical, searchQuery]);

  // Standby Empty State
  if (!statistics || (!numerical.length && !categorical.length)) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-10 text-center font-mono">
        <Activity size={32} className="mx-auto text-slate-400 mb-3" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Statistical Diagnostics Standby
        </h4>
        <p className="mt-1 text-xs text-slate-500 font-sans max-w-sm mx-auto">
          No statistical distributions computed yet. Ingest a dataset to generate mean, median, skewness, and correlation matrices.
        </p>
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={11} className="opacity-40" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp size={12} className="text-indigo-600 dark:text-indigo-400" />
    ) : (
      <ChevronDown size={12} className="text-indigo-600 dark:text-indigo-400" />
    );
  };

  return (
    <div className="space-y-6 antialiased text-slate-800 dark:text-slate-100 font-sans max-w-[1600px] mx-auto pb-10">
      
      {/* ================================================= */}
      {/* 1. ANALYTIC OVERVIEW SCORECARDS */}
      {/* ================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStatCard
          label="Quantitative Features"
          value={totalNumeric}
          subValue={`${totalDimensions > 0 ? Math.round((totalNumeric / totalDimensions) * 100) : 0}% of schema`}
          icon={Sigma}
          color="indigo"
          tooltipKey="numericalFeatures"
        />
        <MetricStatCard
          label="Categorical Features"
          value={totalCategorical}
          subValue={`${totalDimensions > 0 ? Math.round((totalCategorical / totalDimensions) * 100) : 0}% of schema`}
          icon={Database}
          color="blue"
          tooltipKey="categoricalFeatures"
        />
        <MetricStatCard
          label="Correlation Pairs"
          value={correlation.length}
          subValue="Bivariate Pearson associations"
          icon={TrendingUp}
          color="emerald"
          tooltipKey="correlationPairs"
        />
        <MetricStatCard
          label="Total Dimensions"
          value={totalDimensions}
          subValue="Active schema columns"
          icon={Layers3}
          color="slate"
          tooltipKey="totalDimensions"
        />
      </div>

      {/* ================================================= */}
      {/* 1.5. AI DATASET QUALITY OVERVIEW INSIGHT */}
      {/* ================================================= */}
      {qualityExplanation && (
        <AIInsightCard
          title="AI Dataset Descriptive Overview"
          explanation={qualityExplanation}
          loading={loadingExplanations}
          error={explanationsError}
          cacheUsed={explanationsCacheUsed}
          onRefresh={fetchAIExplanations}
          confidence="High"
          recommendation="Evaluate feature correlation distributions and run cleaning pipelines on high missing-rate columns."
        />
      )}

      {/* ================================================= */}
      {/* 2. CORE DISTRIBUTION ANALYTICS IN ENCLOSURES */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* VARIABLE CENTRAL TENDENCY BAR ENCLOSURE */}
        <div className="lg:col-span-8">
          <GraphEnclosure
            title="Variable Central Tendency (Arithmetic Mean)"
            subtitle="Central location metrics overview across active quantitative profiles"
            tooltip={getTooltipContent("mean")}
            icon={BarChart3}
            hasData={meanData && meanData.length > 0}
          >
            <div className="h-[380px] w-full overflow-hidden pl-2 pr-2">
              <BarChartComponent
                data={meanData}
                xKey="column"
                yKey="mean"
                color="#6366f1"
                margin={{ top: 20, right: 10, left: 55, bottom: 90 }}
              />
            </div>
          </GraphEnclosure>
        </div>

        {/* DIMENSIONAL MIX PIE ENCLOSURE */}
        <div className="lg:col-span-4">
          <GraphEnclosure
            title="Dimensional Mix"
            subtitle="Composition analysis of schema architecture type distributions"
            tooltip={getTooltipContent("totalDimensions")}
            icon={Activity}
            hasData={schemaPie && schemaPie.length > 0}
          >
            <div className="h-[380px] w-full flex items-center justify-center">
              <PieChartComponent data={schemaPie} nameKey="name" dataKey="value" />
            </div>
          </GraphEnclosure>
        </div>

      </div>

      {/* ================================================= */}
      {/* 3. SECTION SELECTOR BAR */}
      {/* ================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <FilterButtonGroup
          options={[
            { id: "numerical", label: "Descriptive Statistics (Numerical)", badge: totalNumeric },
            { id: "categorical", label: "Categorical Diagnostics", badge: totalCategorical },
            { id: "correlation", label: "Correlation Matrix & Associations", badge: topCorrelations.length },
          ]}
          activeId={activeTab}
          onChange={setActiveTab}
          size="sm"
        />

        {activeTab !== "correlation" && (
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Filter ${activeTab} features...`}
            />
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* 4A. TAB: DESCRIPTIVE STATISTICS (NUMERICAL) */}
      {/* ================================================= */}
      {activeTab === "numerical" && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          
          {/* Header Strip & Skewness Filter */}
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-950/40">
            <div className="flex items-center gap-2.5">
              <TableIcon size={15} className="text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-900 dark:text-white">
                Descriptive Statistics Laboratory
              </h3>
              <InfoTooltip {...getTooltipContent("statisticsLab")} iconSize={12} className="h-4 w-4" />
            </div>

            {/* Skew Filter Controls */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Skewness:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: "high", label: "High (|γ₁| > 1)" },
                  { id: "moderate", label: "Moderate" },
                  { id: "symmetric", label: "Normal" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSkewFilter(f.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      skewFilter === f.id
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-mono font-bold tracking-wider border-b border-slate-200 dark:border-slate-800 select-none">
                  <th
                    onClick={() => handleSort("column")}
                    className="px-5 py-3 font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Feature Variable</span>
                      {renderSortIndicator("column")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("mean")}
                    className="px-4 py-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Mean (μ)</span>
                      {renderSortIndicator("mean")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("median")}
                    className="px-4 py-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Median (M)</span>
                      {renderSortIndicator("median")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("std")}
                    className="px-4 py-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Std Dev (σ)</span>
                      {renderSortIndicator("std")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("min")}
                    className="px-4 py-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Min</span>
                      {renderSortIndicator("min")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("max")}
                    className="px-4 py-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Max</span>
                      {renderSortIndicator("max")}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("skew")}
                    className="px-5 py-3 font-bold text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Skewness (γ₁)</span>
                      {renderSortIndicator("skew")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-xs">
                {filteredNumerical.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                      No numerical features match the current query or filter.
                    </td>
                  </tr>
                ) : (
                  filteredNumerical.map((item, idx) => {
                    const absSkew = item.skew != null ? Math.abs(item.skew) : 0;
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-5 py-2.5 font-sans font-bold text-slate-900 dark:text-slate-100">
                          {item.column}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                          {safeFixed(item.mean, 2)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-700 dark:text-slate-300">
                          {safeFixed(item.median, 2)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">
                          {safeFixed(item.std, 2)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                          {safeFixed(item.min, 2)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                          {safeFixed(item.max, 2)}
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              absSkew > 1
                                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60"
                                : absSkew >= 0.5
                                ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60"
                                : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                            }`}
                          >
                            {safeFixed(item.skew, 3)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-5 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              Showing {filteredNumerical.length} of {numerical.length} quantitative features
            </span>
            <span className="text-slate-500">
              Parametric threshold: α = 0.05
            </span>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 4B. TAB: CATEGORICAL DIAGNOSTICS */}
      {/* ================================================= */}
      {activeTab === "categorical" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategorical.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400 font-mono">
                No categorical features found matching "{searchQuery}".
              </div>
            ) : (
              filteredCategorical.map((cat, idx) => {
                const topFrequencies = cat.top_frequencies || [];
                const maxCount = topFrequencies.length > 0 ? topFrequencies[0].count : 1;
                const totalCount = topFrequencies.reduce((acc, curr) => acc + curr.count, 0);

                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h4 className="text-xs font-bold font-mono text-slate-900 dark:text-white truncate max-w-[180px]">
                            {cat.column}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">
                            Discrete Dimension
                          </span>
                        </div>
                        <StatusBadge variant="blue" size="xs">
                          {cat.unique_count} Unique
                        </StatusBadge>
                      </div>

                      {/* Modal Frequency Distribution Bars */}
                      <div className="space-y-2 mt-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Dominant Modal Classes:
                        </span>
                        {topFrequencies.slice(0, 4).map((freq, fIdx) => {
                          const pct = totalCount > 0 ? Math.round((freq.count / totalCount) * 100) : 0;
                          return (
                            <div key={fIdx} className="space-y-0.5">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="truncate max-w-[140px] text-slate-700 dark:text-slate-300">
                                  {freq.value || "—"}
                                </span>
                                <span className="text-slate-400 font-bold">
                                  {freq.count.toLocaleString()} ({pct}%)
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 rounded-full"
                                  style={{ width: `${(freq.count / maxCount) * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Total Sample: {totalCount.toLocaleString()}</span>
                      <span>Cardinality: {cat.unique_count > 10 ? "High" : "Compact"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 4C. TAB: CORRELATION MATRIX & ASSOCIATIONS */}
      {/* ================================================= */}
      {activeTab === "correlation" && (
        <div className="space-y-6">
          
          {/* Top Strongest Correlations Strip */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-emerald-500" />
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                Strongest Bivariate Associations (Pearson's r)
              </h4>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topCorrelations.map((pair, idx) => {
                const isPositive = pair.value >= 0;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between font-mono"
                  >
                    <div className="truncate max-w-[180px]">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {pair.x}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        &harr; {pair.y}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        isPositive
                          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {pair.value > 0 ? `+${pair.value.toFixed(2)}` : pair.value.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scatter Chart Enclosure */}
          <GraphEnclosure
            title="Linear Association Coefficients Distribution"
            subtitle="Bivariate correlation magnitude index mappings across paired columns"
            tooltip={getTooltipContent("covarianceHeatmap")}
            icon={Binary}
            hasData={correlationData && correlationData.length > 0}
          >
            <div className="h-[380px] w-full overflow-hidden p-2">
              <ScatterChartComponent data={correlationData} xKey="x" yKey="y" color="#10b981" />
            </div>
          </GraphEnclosure>
        </div>
      )}

    </div>
  );
};

export default StatisticsPanel;
