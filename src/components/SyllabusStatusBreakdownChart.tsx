import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CheckCircle2, Clock, AlertTriangle, BarChart3, PieChart as PieIcon, Layers } from "lucide-react";
import { SyllabusTopic } from "../types";

export type StatusCategory = "Completed" | "In Progress" | "Needs Revision";

export interface SyllabusStatusBreakdownChartProps {
  topics: SyllabusTopic[];
  activeFilter?: string;
  onFilterChange?: (filter: "all" | "completed" | "in_progress" | "needs_revision") => void;
}

const STATUS_COLORS: Record<StatusCategory, { fill: string; border: string; bg: string; text: string; badge: string }> = {
  Completed: {
    fill: "#10b981", // Emerald 500
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  "In Progress": {
    fill: "#3b82f6", // Blue 500
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  "Needs Revision": {
    fill: "#ef4444", // Red 500
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

export function getTopicStatusCategory(topic: SyllabusTopic): StatusCategory {
  if (topic.status === "needs_revision") {
    return "Needs Revision";
  }
  if (topic.status === "strong" || topic.completionPercentage >= 80) {
    return "Completed";
  }
  return "In Progress";
}

export const SyllabusStatusBreakdownChart: React.FC<SyllabusStatusBreakdownChartProps> = ({
  topics,
  activeFilter = "all",
  onFilterChange,
}) => {
  const [chartType, setChartType] = useState<"donut" | "bars">("donut");
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Categorize topics
  const categorized = topics.reduce(
    (acc, topic) => {
      const cat = getTopicStatusCategory(topic);
      acc[cat].push(topic);
      return acc;
    },
    {
      Completed: [] as SyllabusTopic[],
      "In Progress": [] as SyllabusTopic[],
      "Needs Revision": [] as SyllabusTopic[],
    }
  );

  const totalTopics = topics.length || 1;
  const completedCount = categorized.Completed.length;
  const inProgressCount = categorized["In Progress"].length;
  const needsRevisionCount = categorized["Needs Revision"].length;

  const completedPct = Math.round((completedCount / totalTopics) * 100);
  const inProgressPct = Math.round((inProgressCount / totalTopics) * 100);
  const needsRevisionPct = Math.round((needsRevisionCount / totalTopics) * 100);

  // Overall pie data
  const pieData = [
    {
      name: "Completed",
      value: completedCount,
      percentage: completedPct,
      color: STATUS_COLORS.Completed.fill,
    },
    {
      name: "In Progress",
      value: inProgressCount,
      percentage: inProgressPct,
      color: STATUS_COLORS["In Progress"].fill,
    },
    {
      name: "Needs Revision",
      value: needsRevisionCount,
      percentage: needsRevisionPct,
      color: STATUS_COLORS["Needs Revision"].fill,
    },
  ];

  // Paper breakdown data for bar chart
  const paper1Topics = topics.filter((t) => t.paper === "Paper 1");
  const paper2Topics = topics.filter((t) => t.paper === "Paper 2");

  const getCountsForPaper = (paperTopics: SyllabusTopic[]) => {
    let completed = 0;
    let inProgress = 0;
    let needsRevision = 0;

    paperTopics.forEach((t) => {
      const cat = getTopicStatusCategory(t);
      if (cat === "Completed") completed++;
      else if (cat === "Needs Revision") needsRevision++;
      else inProgress++;
    });

    return { completed, inProgress, needsRevision, total: paperTopics.length };
  };

  const p1Counts = getCountsForPaper(paper1Topics);
  const p2Counts = getCountsForPaper(paper2Topics);

  const barData = [
    {
      paper: "Paper 1 (Theory)",
      Completed: p1Counts.completed,
      "In Progress": p1Counts.inProgress,
      "Needs Revision": p1Counts.needsRevision,
      total: p1Counts.total,
    },
    {
      paper: "Paper 2 (Indian Admin)",
      Completed: p2Counts.completed,
      "In Progress": p2Counts.inProgress,
      "Needs Revision": p2Counts.needsRevision,
      total: p2Counts.total,
    },
  ];

  const handleCardClick = (target: "all" | "completed" | "in_progress" | "needs_revision") => {
    if (!onFilterChange) return;
    if (activeFilter === target) {
      onFilterChange("all");
    } else {
      onFilterChange(target);
    }
  };

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0f172a] border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-xl text-xs space-y-1 z-50">
          <div className="flex items-center space-x-2 font-bold text-white">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.name}</span>
          </div>
          <div className="text-slate-300">
            <span className="font-semibold text-white">{data.value}</span> units ({data.percentage}% of syllabus)
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-white border-b border-slate-700/60 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold text-white">{entry.value} units</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-[#111723] border border-[#1e293b] p-5 shadow-lg space-y-5">
      {/* Top Header & Chart Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Syllabus Status Analytics</span>
          </div>
          <h2 className="text-lg font-bold text-white font-['Outfit']">
            Progress Breakdown by Status
          </h2>
          <p className="text-xs text-slate-400">
            Track units across Completed, In Progress, and Needs Revision states
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center space-x-1 bg-[#162033] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartType("donut")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              chartType === "donut"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Overall</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType("bars")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              chartType === "bars"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Paper Comparison</span>
          </button>
        </div>
      </div>

      {/* Status Breakdown Summary Cards (Interactive Filter Chips) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Completed Card */}
        <div
          onClick={() => handleCardClick("completed")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "completed"
              ? "bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10"
              : "bg-[#162033]/70 hover:bg-[#162033] border-slate-800 hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {completedPct}%
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white">{completedCount}</span>
            <span className="text-xs text-slate-400">/ {topics.length} units</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Mastered or &ge; 80% coverage
          </p>
        </div>

        {/* In Progress Card */}
        <div
          onClick={() => handleCardClick("in_progress")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "in_progress"
              ? "bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10"
              : "bg-[#162033]/70 hover:bg-[#162033] border-slate-800 hover:border-blue-500/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>In Progress</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {inProgressPct}%
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white">{inProgressCount}</span>
            <span className="text-xs text-slate-400">/ {topics.length} units</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active learning & practicing
          </p>
        </div>

        {/* Needs Revision Card */}
        <div
          onClick={() => handleCardClick("needs_revision")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === "needs_revision"
              ? "bg-red-950/40 border-red-500 shadow-md shadow-red-500/10"
              : "bg-[#162033]/70 hover:bg-[#162033] border-slate-800 hover:border-red-500/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Needs Revision</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              {needsRevisionPct}%
            </span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white">{needsRevisionCount}</span>
            <span className="text-xs text-slate-400">/ {topics.length} units</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Retention decay / score &lt; 65%
          </p>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-[#162033]/40 rounded-xl border border-slate-800/80 p-4">
        {chartType === "donut" ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Donut Chart with Center Label */}
            <div className="relative w-full md:w-1/2 h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, index) => setHoveredSlice(pieData[index].name)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#111723"
                        strokeWidth={2}
                        className="transition-opacity duration-200 cursor-pointer"
                        opacity={hoveredSlice === null || hoveredSlice === entry.name ? 1 : 0.6}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-white font-['Outfit']">
                  {completedPct}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Completed
                </span>
              </div>
            </div>

            {/* Visual Progress Stack & Legend */}
            <div className="w-full md:w-1/2 space-y-3.5">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Distribution Breakdown
              </h4>

              {/* Segmented Progress Bar */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${completedPct}%` }}
                    className="h-full bg-emerald-500 transition-all duration-500"
                    title={`Completed: ${completedCount} (${completedPct}%)`}
                  />
                  <div
                    style={{ width: `${inProgressPct}%` }}
                    className="h-full bg-blue-500 transition-all duration-500"
                    title={`In Progress: ${inProgressCount} (${inProgressPct}%)`}
                  />
                  <div
                    style={{ width: `${needsRevisionPct}%` }}
                    className="h-full bg-red-500 transition-all duration-500"
                    title={`Needs Revision: ${needsRevisionCount} (${needsRevisionPct}%)`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0%</span>
                  <span>Total {topics.length} Units</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Legend with interactive highlight */}
              <div className="space-y-2 pt-1">
                {pieData.map((item) => (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredSlice(item.name)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    onClick={() => {
                      if (item.name === "Completed") handleCardClick("completed");
                      else if (item.name === "In Progress") handleCardClick("in_progress");
                      else handleCardClick("needs_revision");
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      hoveredSlice === item.name
                        ? "bg-slate-800/80"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium text-slate-200">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">
                        {item.value} units
                      </span>
                      <span className="text-[11px] text-slate-400 w-10 text-right">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Paper 1 vs Paper 2 Stacked Bar Chart */
          <div className="space-y-3">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="paper"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
                  />
                  <Bar
                    dataKey="Completed"
                    fill={STATUS_COLORS.Completed.fill}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="In Progress"
                    fill={STATUS_COLORS["In Progress"].fill}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Needs Revision"
                    fill={STATUS_COLORS["Needs Revision"].fill}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 px-2">
              <span>
                <strong>Paper 1:</strong> {p1Counts.completed} Completed • {p1Counts.inProgress} In Progress • {p1Counts.needsRevision} Needs Revision
              </span>
              <span>
                <strong>Paper 2:</strong> {p2Counts.completed} Completed • {p2Counts.inProgress} In Progress • {p2Counts.needsRevision} Needs Revision
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
