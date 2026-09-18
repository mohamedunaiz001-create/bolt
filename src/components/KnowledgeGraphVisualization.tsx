import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Network,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  User,
  Lightbulb,
  FileQuestion,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Maximize2,
  CheckCircle2,
  Copy,
  Compass,
  Flame,
  X,
  Share2,
} from "lucide-react";
import { KnowledgeGraphNode, KnowledgeGraphEdge, GraphNodeType, UserProfile } from "../types";
import { GRAPH_NODES, GRAPH_EDGES, THEMATIC_CLUSTERS, ThematicCluster } from "../data/knowledgeGraphData";

interface KnowledgeGraphVisualizationProps {
  user?: UserProfile;
  onAskBoltTopic?: (topicOrThinker: string) => void;
  onPracticePYQ?: (pyqId: string) => void;
}

export const KnowledgeGraphVisualization: React.FC<KnowledgeGraphVisualizationProps> = ({
  user,
  onAskBoltTopic,
  onPracticePYQ,
}) => {
  // Graph Data & State
  const [nodes, setNodes] = useState<KnowledgeGraphNode[]>(GRAPH_NODES);
  const [edges] = useState<KnowledgeGraphEdge[]>(GRAPH_EDGES);

  // Selection & Hover State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("th-simon");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  // Filtering State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<GraphNodeType | "all">("all");
  const [selectedPaperFilter, setSelectedPaperFilter] = useState<"all" | "Paper 1" | "Paper 2" | "GS 4 / Ethics">("all");
  const [showCrossPaperOnly, setShowCrossPaperOnly] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);

  // Canvas Transform (Pan & Zoom)
  const [viewBox, setViewBox] = useState<{ x: number; y: number; scale: number }>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active Selected Node
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  // Determine Connected Nodes & Edges for Highlight
  const activeFocusNodeId = hoveredNodeId || selectedNodeId;

  const connectedNodeIds = useMemo(() => {
    if (!activeFocusNodeId) return new Set<string>();
    const set = new Set<string>([activeFocusNodeId]);
    edges.forEach((edge) => {
      if (edge.source === activeFocusNodeId) set.add(edge.target);
      if (edge.target === activeFocusNodeId) set.add(edge.source);
    });
    return set;
  }, [activeFocusNodeId, edges]);

  const connectedEdgeIds = useMemo(() => {
    if (!activeFocusNodeId) return new Set<string>();
    const set = new Set<string>();
    edges.forEach((edge) => {
      if (edge.source === activeFocusNodeId || edge.target === activeFocusNodeId) {
        set.add(edge.id);
      }
    });
    return set;
  }, [activeFocusNodeId, edges]);

  // Filtered Nodes Calculation
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      if (selectedTypeFilter !== "all" && node.type !== selectedTypeFilter) return false;
      if (selectedPaperFilter !== "all" && node.paper !== selectedPaperFilter) return false;
      if (showCrossPaperOnly && !node.crossPaperBridge && node.type !== "pyq") return false;
      if (selectedClusterId) {
        const cluster = THEMATIC_CLUSTERS.find((c) => c.id === selectedClusterId);
        if (cluster && !cluster.connectedNodeIds.includes(node.id)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = node.title.toLowerCase().includes(q);
        const matchSummary = node.summary.toLowerCase().includes(q);
        const matchThemes = node.keyThemes?.some((t) => t.toLowerCase().includes(q));
        const matchPrompt = node.pyqPrompt?.toLowerCase().includes(q);
        return matchTitle || matchSummary || matchThemes || matchPrompt;
      }
      return true;
    });
  }, [nodes, selectedTypeFilter, selectedPaperFilter, showCrossPaperOnly, selectedClusterId, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  // Filtered Edges Calculation (both source and target must be visible)
  const filteredEdges = useMemo(() => {
    return edges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
  }, [edges, filteredNodeIds]);

  // Zoom Controls
  const handleZoom = (direction: "in" | "out") => {
    setViewBox((prev) => {
      const factor = direction === "in" ? 1.2 : 0.8;
      const newScale = Math.min(Math.max(prev.scale * factor, 0.4), 2.8);
      return { ...prev, scale: newScale };
    });
  };

  const handleResetZoom = () => {
    setViewBox({ x: 0, y: 0, scale: 1 });
    setSelectedClusterId(null);
    setSelectedTypeFilter("all");
    setSelectedPaperFilter("all");
    setSearchQuery("");
  };

  // Dragging Canvas or Node
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).id === "graph-bg") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewBox.x, y: e.clientY - viewBox.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) {
      setViewBox((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    } else if (draggedNodeId && svgRef.current) {
      // Reposition node interactively
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = (e.clientX - rect.left - viewBox.x) / viewBox.scale;
      const svgY = (e.clientY - rect.top - viewBox.y) / viewBox.scale;

      setNodes((prev) =>
        prev.map((n) => (n.id === draggedNodeId ? { ...n, x: svgX, y: svgY } : n))
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNodeId(null);
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    setSelectedNodeId(nodeId);
  };

  // Handle Thematic Cluster Selection
  const handleSelectCluster = (cluster: ThematicCluster) => {
    if (selectedClusterId === cluster.id) {
      setSelectedClusterId(null);
    } else {
      setSelectedClusterId(cluster.id);
      setSelectedNodeId(cluster.primaryNodeId);
      // Center on primary node
      const primaryNode = nodes.find((n) => n.id === cluster.primaryNodeId);
      if (primaryNode && primaryNode.x && primaryNode.y) {
        setViewBox({
          x: 250 - primaryNode.x * 1,
          y: 200 - primaryNode.y * 1,
          scale: 1.1,
        });
      }
    }
  };

  // Helper colors and icons by Node Type
  const getNodeVisuals = (type: GraphNodeType) => {
    switch (type) {
      case "topic":
        return {
          fill: "#1e3a8a",
          stroke: "#3b82f6",
          badgeBg: "bg-blue-500/15 border-blue-500/30 text-blue-400",
          label: "Syllabus Topic",
          icon: BookOpen,
          radius: 26,
        };
      case "thinker":
        return {
          fill: "#4c1d95",
          stroke: "#a855f7",
          badgeBg: "bg-purple-500/15 border-purple-500/30 text-purple-400",
          label: "Administrative Thinker",
          icon: User,
          radius: 24,
        };
      case "concept":
        return {
          fill: "#064e3b",
          stroke: "#10b981",
          badgeBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
          label: "Core Doctrine / Concept",
          icon: Lightbulb,
          radius: 22,
        };
      case "pyq":
        return {
          fill: "#7c2d12",
          stroke: "#f97316",
          badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-400",
          label: "UPSC PYQ",
          icon: FileQuestion,
          radius: 20,
        };
    }
  };

  // Copy helper
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuote(text);
    setTimeout(() => setCopiedQuote(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#0e1626] via-[#131d33] to-[#1a1528] p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Network className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white font-['Outfit'] tracking-wide">
              Curriculum Knowledge Graph
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
              Paper 1 & Paper 2 Neural Map
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Interactively explore systemic relationships between <strong>Syllabus Topics</strong>, <strong>Seminal Thinkers</strong>, <strong>Theoretical Doctrines</strong>, and <strong>Previous Year Questions (PYQs)</strong> to master cross-paper synthesis.
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-slate-400">Nodes:</span>
            <span className="font-bold text-white">{filteredNodes.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-slate-400">Links:</span>
            <span className="font-bold text-white">{filteredEdges.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center space-x-1.5 text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-[11px]">Topper Bridges: 12</span>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-[#111827] p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search topic, thinker, theory or PYQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#182235] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Node Type Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs py-0.5">
          <button
            onClick={() => setSelectedTypeFilter("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedTypeFilter === "all"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setSelectedTypeFilter("topic")}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition-all ${
              selectedTypeFilter === "topic"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-blue-400 hover:bg-blue-950/50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Topics (8)</span>
          </button>
          <button
            onClick={() => setSelectedTypeFilter("thinker")}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition-all ${
              selectedTypeFilter === "thinker"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-purple-400 hover:bg-purple-950/50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Thinkers (12)</span>
          </button>
          <button
            onClick={() => setSelectedTypeFilter("concept")}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition-all ${
              selectedTypeFilter === "concept"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-emerald-400 hover:bg-emerald-950/50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Concepts (8)</span>
          </button>
          <button
            onClick={() => setSelectedTypeFilter("pyq")}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1 transition-all ${
              selectedTypeFilter === "pyq"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-400 hover:bg-amber-950/50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>PYQs (8)</span>
          </button>
        </div>

        {/* Paper & Cross-Paper Toggles */}
        <div className="flex items-center space-x-2 text-xs">
          <select
            value={selectedPaperFilter}
            onChange={(e) => setSelectedPaperFilter(e.target.value as any)}
            aria-label="Filter by Paper"
            className="bg-[#182235] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Papers</option>
            <option value="Paper 1">Paper 1 (Theory)</option>
            <option value="Paper 2">Paper 2 (Indian Admin)</option>
            <option value="GS 4 / Ethics">GS 4 / Ethics</option>
          </select>

          <button
            onClick={() => setShowCrossPaperOnly(!showCrossPaperOnly)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              showCrossPaperOnly
                ? "bg-indigo-600 text-white border-indigo-400 shadow-sm shadow-indigo-500/30"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
            }`}
            title="Highlight nodes that bridge Paper 1 Theory to Paper 2 Indian reality"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cross-Paper Bridges</span>
          </button>
        </div>
      </div>

      {/* High-Yield Thematic Clusters Bar */}
      <div className="bg-[#0f172a] p-2.5 rounded-xl border border-slate-800/90 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] pl-1 flex items-center space-x-1 shrink-0">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>High-Yield Clusters:</span>
        </span>
        {THEMATIC_CLUSTERS.map((cluster) => {
          const isSelected = selectedClusterId === cluster.id;
          return (
            <button
              key={cluster.id}
              onClick={() => handleSelectCluster(cluster)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border shrink-0 flex items-center space-x-1.5 ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20 ring-1 ring-blue-400/50"
                  : "bg-slate-800/70 text-slate-300 border-slate-700 hover:border-slate-600 hover:text-white"
              }`}
            >
              <span>{cluster.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-900 text-slate-400"
              }`}>
                {cluster.badge.split("·")[0]}
              </span>
            </button>
          );
        })}
        {selectedClusterId && (
          <button
            onClick={() => setSelectedClusterId(null)}
            className="px-2 py-1 text-slate-400 hover:text-rose-400 text-xs shrink-0 underline"
          >
            Clear Cluster
          </button>
        )}
      </div>

      {/* Main Canvas & Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Graph Canvas (8 cols on lg) */}
        <div
          ref={containerRef}
          className="lg:col-span-7 xl:col-span-8 bg-[#0b101c] rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col shadow-inner min-h-[560px] max-h-[720px]"
        >
          {/* Canvas Floating Overlay Controls */}
          <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 bg-[#141d30]/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg">
            <button
              onClick={() => handleZoom("in")}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom("out")}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-700 mx-0.5" />
            <button
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                showLabels ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Toggle Node Labels"
            >
              Labels
            </button>
          </div>

          {/* Interactive Legend in Bottom Left */}
          <div className="absolute bottom-3 left-3 z-10 bg-[#121929]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/70 text-[11px] space-y-1 shadow-lg pointer-events-none sm:pointer-events-auto">
            <div className="font-semibold text-slate-300 mb-1 text-[10px] uppercase tracking-wider">
              Node Archetypes
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-300 inline-block shadow-sm shadow-blue-500/50" />
                <span>Syllabus Topic</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-purple-500 border border-purple-300 inline-block shadow-sm shadow-purple-500/50" />
                <span>Thinker</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300 inline-block shadow-sm shadow-emerald-500/50" />
                <span>Core Concept</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300 inline-block shadow-sm shadow-amber-500/50" />
                <span>UPSC PYQ</span>
              </div>
            </div>
          </div>

          {/* Drag Instruction Banner */}
          <div className="absolute top-3 right-3 z-10 text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-none hidden sm:block">
            <span>💡 Click node to inspect · Drag to reposition</span>
          </div>

          {/* SVG Canvas */}
          <svg
            ref={svgRef}
            className="w-full h-full flex-1 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            viewBox="0 0 1020 700"
          >
            <defs>
              {/* Radial Background Grid */}
              <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#172238" strokeWidth="0.8" opacity="0.6" />
                <circle cx="20" cy="20" r="0.8" fill="#1e293b" />
              </pattern>

              {/* Glowing Filters */}
              <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.6" />
              </filter>
              <filter id="glow-purple" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#a855f7" floodOpacity="0.6" />
              </filter>
              <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.6" />
              </filter>
              <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10b981" floodOpacity="0.6" />
              </filter>

              {/* Arrowhead Markers */}
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#60a5fa" />
              </marker>
            </defs>

            {/* Background Grid */}
            <rect id="graph-bg" width="100%" height="100%" fill="url(#graph-grid)" />

            {/* Canvas Transformation Container */}
            <g transform={`translate(${viewBox.x}, ${viewBox.y}) scale(${viewBox.scale})`}>
              {/* Render Edges */}
              {filteredEdges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isEdgeActive = connectedEdgeIds.has(edge.id);
                const isCrossPaper = edge.relationship === "applied_to_paper2";

                const x1 = sourceNode.x || 0;
                const y1 = sourceNode.y || 0;
                const x2 = targetNode.x || 0;
                const y2 = targetNode.y || 0;

                // Midpoint for edge label
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                return (
                  <g key={edge.id} className="transition-all duration-300">
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={
                        isEdgeActive
                          ? "#60a5fa"
                          : isCrossPaper
                          ? "#818cf8"
                          : "#26354f"
                      }
                      strokeWidth={isEdgeActive ? 2.5 : isCrossPaper ? 1.8 : 1.2}
                      strokeDasharray={isCrossPaper ? "4,4" : undefined}
                      markerEnd={isEdgeActive ? "url(#arrow-active)" : "url(#arrow)"}
                      opacity={activeFocusNodeId ? (isEdgeActive ? 1 : 0.15) : 0.75}
                    />

                    {/* Edge Label on active selection */}
                    {(isEdgeActive || isCrossPaper) && showLabels && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-40}
                          y={-9}
                          width={80}
                          height={18}
                          rx={4}
                          fill="#0f172a"
                          stroke={isEdgeActive ? "#3b82f6" : "#4338ca"}
                          strokeWidth={0.8}
                          opacity={0.9}
                        />
                        <text
                          textAnchor="middle"
                          dy={3.5}
                          fontSize="9"
                          fontWeight="600"
                          fill={isEdgeActive ? "#93c5fd" : "#c7d2fe"}
                        >
                          {edge.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Render Nodes */}
              {filteredNodes.map((node) => {
                const visuals = getNodeVisuals(node.type);
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isConnected = connectedNodeIds.has(node.id);
                const isClusterHighlighted = selectedClusterId
                  ? THEMATIC_CLUSTERS.find((c) => c.id === selectedClusterId)?.connectedNodeIds.includes(node.id)
                  : true;

                // Node Opacity based on focus
                let nodeOpacity = 1;
                if (activeFocusNodeId && !isConnected && !isSelected) {
                  nodeOpacity = 0.2;
                } else if (selectedClusterId && !isClusterHighlighted) {
                  nodeOpacity = 0.15;
                }

                const nx = node.x || 0;
                const ny = node.y || 0;
                const r = visuals.radius;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${nx}, ${ny})`}
                    className="cursor-pointer transition-transform duration-150"
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{ opacity: nodeOpacity }}
                  >
                    {/* Pulsing Selection Outer Ring */}
                    {isSelected && (
                      <circle
                        r={r + 8}
                        fill="none"
                        stroke={visuals.stroke}
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        className="animate-spin"
                        style={{ animationDuration: "12s" }}
                      />
                    )}

                    {/* Secondary Accent Halo for Cross-Paper Bridge */}
                    {node.crossPaperBridge && (
                      <circle
                        r={r + 4}
                        fill="none"
                        stroke="#818cf8"
                        strokeWidth="1.2"
                        strokeDasharray="3,3"
                        opacity={0.8}
                      />
                    )}

                    {/* Primary Node Circle */}
                    <circle
                      r={r}
                      fill={visuals.fill}
                      stroke={visuals.stroke}
                      strokeWidth={isSelected ? 3 : 2}
                      filter={
                        isSelected
                          ? `url(#glow-${node.type === "topic" ? "blue" : node.type === "thinker" ? "purple" : node.type === "concept" ? "emerald" : "amber"})`
                          : undefined
                      }
                      className="transition-all duration-200"
                    />

                    {/* Center Icon Initial or Symbol */}
                    <text
                      textAnchor="middle"
                      dy={4}
                      fill="#ffffff"
                      fontSize={node.type === "topic" ? "12" : "11"}
                      fontWeight="bold"
                      pointerEvents="none"
                      fontFamily="Outfit, sans-serif"
                    >
                      {node.type === "topic" && "📚"}
                      {node.type === "thinker" && "👤"}
                      {node.type === "concept" && "💡"}
                      {node.type === "pyq" && "❓"}
                    </text>

                    {/* Node Text Label */}
                    {showLabels && (
                      <g transform={`translate(0, ${r + 14})`}>
                        <rect
                          x={-55}
                          y={-8}
                          width={110}
                          height={16}
                          rx={4}
                          fill="#0f172a"
                          stroke={isSelected ? visuals.stroke : "#1e293b"}
                          strokeWidth={0.8}
                          opacity={0.92}
                        />
                        <text
                          textAnchor="middle"
                          dy={3.5}
                          fontSize="9.5"
                          fontWeight={isSelected ? "700" : "600"}
                          fill={isSelected ? "#ffffff" : "#cbd5e1"}
                          pointerEvents="none"
                        >
                          {node.title.length > 17 ? node.title.slice(0, 16) + "…" : node.title}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Node Deep-Dive Inspector Panel (4 cols on lg, 5 on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-3">
          {selectedNode ? (
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-xl space-y-4 max-h-[720px] overflow-y-auto">
              {/* Header Title & Badges */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                      getNodeVisuals(selectedNode.type).badgeBg
                    }`}
                  >
                    {getNodeVisuals(selectedNode.type).label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    {selectedNode.paper || "General Studies"}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white font-['Outfit'] leading-snug">
                  {selectedNode.title}
                </h2>
                {selectedNode.subtitle && (
                  <p className="text-xs text-slate-400 font-medium">{selectedNode.subtitle}</p>
                )}
              </div>

              {/* Node Summary */}
              <div className="p-3 rounded-xl bg-[#162032] border border-slate-800/90 text-xs text-slate-200 leading-relaxed">
                {selectedNode.summary}
              </div>

              {/* Thinker Specific Section: Key Quotes */}
              {selectedNode.type === "thinker" && selectedNode.keyQuotes && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Seminal Maxims & Quotes</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Use in Mains Answers</span>
                  </div>
                  {selectedNode.keyQuotes.map((quote, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200/90 italic relative group"
                    >
                      <span>"{quote}"</span>
                      <button
                        onClick={() => handleCopyText(quote)}
                        className="absolute right-2 top-2 p-1 text-purple-400 hover:text-white rounded bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy Quote"
                      >
                        {copiedQuote === quote ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* PYQ Specific Section: Verbatim Prompt & Model Tips */}
              {selectedNode.type === "pyq" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40">
                    <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-amber-400">
                      <span>UPSC Mains Prompt ({selectedNode.year})</span>
                      <span>{selectedNode.marks} Marks</span>
                    </div>
                    <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                      "{selectedNode.pyqPrompt}"
                    </p>
                  </div>

                  {selectedNode.modelAnswerTips && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Topper Answer Architecture</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {selectedNode.modelAnswerTips.map((tip, i) => (
                          <li key={i} className="flex items-start space-x-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Cross-Paper Bridge (Paper 1 Theory -> Paper 2 Indian Reality) */}
              {selectedNode.crossPaperBridge && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#171b38] to-[#121929] border border-indigo-500/30 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cross-Paper Bridge (Paper 1 ↔ Paper 2)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedNode.crossPaperBridge}
                  </p>
                </div>
              )}

              {/* Key Themes / Subtopic Tags */}
              {selectedNode.keyThemes && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Core Curricular Dimensions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.keyThemes.map((theme, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/80"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Connected Relationships List */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Connected Nodes ({connectedNodeIds.size - 1})</span>
                  <span className="text-[10px] text-blue-400">Click to switch</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {Array.from(connectedNodeIds)
                    .filter((id) => id !== selectedNode.id)
                    .map((connId) => {
                      const connNode = nodes.find((n) => n.id === connId);
                      if (!connNode) return null;

                      // Find the linking edge
                      const linkEdge = edges.find(
                        (e) =>
                          (e.source === selectedNode.id && e.target === connId) ||
                          (e.target === selectedNode.id && e.source === connId)
                      );

                      return (
                        <div
                          key={connId}
                          onClick={() => setSelectedNodeId(connId)}
                          className="p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 flex items-center justify-between cursor-pointer group transition-all"
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                connNode.type === "topic"
                                  ? "bg-blue-400"
                                  : connNode.type === "thinker"
                                  ? "bg-purple-400"
                                  : connNode.type === "concept"
                                  ? "bg-emerald-400"
                                  : "bg-amber-400"
                              }`}
                            />
                            <div>
                              <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                                {connNode.title}
                              </div>
                              {linkEdge && (
                                <div className="text-[10px] text-slate-400">
                                  {linkEdge.label}
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Action Buttons: Ask Bolt / Practice PYQ */}
              <div className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                <button
                  onClick={() => onAskBoltTopic?.(selectedNode.title)}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Ask Bolt AI</span>
                </button>

                {selectedNode.type === "pyq" && (
                  <button
                    onClick={() => onPracticePYQ?.(selectedNode.id)}
                    className="py-2 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    <span>Practice Answer</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#111827] p-6 rounded-2xl border border-slate-800 text-center space-y-3">
              <Compass className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Select Any Node</h3>
              <p className="text-xs text-slate-400">
                Click any Topic, Thinker, Concept, or PYQ on the knowledge canvas to view deep curricular linkages, cross-paper bridges, and model pointers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* UPSC Topper Cross-Paper Strategy Matrix Guide */}
      <div className="bg-[#101726] p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-['Outfit']">
              The 5 Golden Cross-Paper Bridges (How Toppers Score 300+ in Pub Ad & GS 4)
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
            Exam Hall Playbook
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="font-bold text-purple-300 flex items-center justify-between">
              <span>1. Barnard → Land Record Digitization</span>
              <span className="text-[10px] text-slate-400">Paper 1 → Paper 2</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Apply Chester Barnard's <em>Acceptance of Authority</em> to why state revenue digitization (e.g. Dharani/Bhoomi) meets resistance when patwaris perceive loss of discretionary equilibrium.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="font-bold text-emerald-300 flex items-center justify-between">
              <span>2. Follett → GST Council Deadlocks</span>
              <span className="text-[10px] text-slate-400">Paper 1 → Paper 2</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Use Mary Parker Follett's <em>Integration</em> rather than compromise to resolve federal fiscal tensions between consuming and producing states in the GST Council.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="font-bold text-blue-300 flex items-center justify-between">
              <span>3. Simon → AI Algorithmic Governance</span>
              <span className="text-[10px] text-slate-400">Paper 1 → Paper 2 & GS 4</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Demonstrate that while automated algorithms overcome time limits, Herbert Simon's <em>Fact-Value dichotomy</em> proves that welfare equity decisions must remain human-in-the-loop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
