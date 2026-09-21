import React, { useState } from "react";
import {
  Award,
  Trophy,
  Target,
  Flame,
  BookOpen,
  CheckCircle2,
  Lock,
  Zap,
  Star,
  ChevronRight,
  X,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { MilestoneBadge, NavigationTab } from "../types";

interface MilestonesSectionProps {
  milestones: MilestoneBadge[];
  onNavigate: (tab: NavigationTab) => void;
  onAskBolt: (prompt: string) => void;
}

export const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  milestones,
  onNavigate,
  onAskBolt,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeBadge, setActiveBadge] = useState<MilestoneBadge | null>(null);

  const unlockedCount = milestones.filter((m) => m.isUnlocked).length;
  const totalXp = milestones
    .filter((m) => m.isUnlocked)
    .reduce((acc, m) => acc + m.rewardXp, 0);

  const categories = [
    { id: "all", label: "All Milestones" },
    { id: "unit_completion", label: "Unit Completion" },
    { id: "high_score", label: "High Score" },
    { id: "mains_mastery", label: "Mains 10+" },
    { id: "streak", label: "Daily Streaks" },
  ];

  const filteredMilestones = milestones.filter((m) => {
    if (selectedCategory === "all") return true;
    return m.category === selectedCategory;
  });

  const getTierColors = (level: MilestoneBadge["badgeLevel"], isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        bg: "bg-[#141b27]/80",
        border: "border-slate-800",
        text: "text-slate-500",
        badgeBg: "bg-slate-800/60 text-slate-400 border-slate-700",
        iconRing: "bg-slate-800 text-slate-500 border-slate-700",
      };
    }

    switch (level) {
      case "Platinum":
        return {
          bg: "bg-gradient-to-br from-[#121c33] via-[#1b223d] to-[#12182b]",
          border: "border-cyan-500/40 hover:border-cyan-400",
          text: "text-cyan-400",
          badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          iconRing: "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-lg shadow-cyan-500/20",
        };
      case "Gold":
        return {
          bg: "bg-gradient-to-br from-[#231e13] via-[#1a1710] to-[#14120e]",
          border: "border-amber-500/40 hover:border-amber-400",
          text: "text-amber-400",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          iconRing: "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-lg shadow-amber-500/20",
        };
      case "Silver":
        return {
          bg: "bg-gradient-to-br from-[#1a202c] via-[#161c28] to-[#111722]",
          border: "border-slate-500/40 hover:border-slate-400",
          text: "text-slate-300",
          badgeBg: "bg-slate-700/30 text-slate-200 border-slate-600/40",
          iconRing: "bg-slate-700/30 text-slate-200 border-slate-500/50",
        };
      case "Bronze":
      default:
        return {
          bg: "bg-gradient-to-br from-[#241712] via-[#1a1310] to-[#120f0d]",
          border: "border-orange-500/40 hover:border-orange-400",
          text: "text-orange-400",
          badgeBg: "bg-orange-500/20 text-orange-300 border-orange-500/40",
          iconRing: "bg-orange-500/20 text-orange-300 border-orange-400/50",
        };
    }
  };

  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case "trophy":
        return <Trophy className={className} />;
      case "target":
        return <Target className={className} />;
      case "flame":
        return <Flame className={className} />;
      case "book-open":
        return <BookOpen className={className} />;
      case "zap":
        return <Zap className={className} />;
      case "star":
        return <Star className={className} />;
      case "award":
      default:
        return <Award className={className} />;
    }
  };

  return (
    <section id="aspirant-milestones-section" className="bg-[#111723] rounded-2xl border border-[#1e293b] p-4 sm:p-5 shadow-lg space-y-4 scroll-mt-20">
      {/* Header & Gamification XP Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="font-bold text-white text-base sm:text-lg flex items-center space-x-2">
              <span>Aspirant Milestones & Badges</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                Gamified
              </span>
            </h3>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Earn tiered badges and XP by completing syllabus units, achieving high practice scores, and mastering Mains answers.
          </p>
        </div>

        {/* Level & XP Capsule */}
        <div className="flex items-center space-x-3 bg-[#162033] px-3.5 py-2 rounded-xl border border-slate-700/80 flex-shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Rank Level</span>
            <p className="text-xs font-bold text-amber-400">Level 4 Scholar</p>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <div className="flex items-center space-x-1 text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>{totalXp} XP</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">
              {unlockedCount} of {milestones.length} Unlocked
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-[#162033] text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Badges Grid (Small cards with badges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredMilestones.map((milestone) => {
          const style = getTierColors(milestone.badgeLevel, milestone.isUnlocked);
          return (
            <div
              key={milestone.id}
              onClick={() => setActiveBadge(milestone)}
              className={`p-3.5 rounded-xl border ${style.bg} ${style.border} cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg relative group flex flex-col justify-between`}
            >
              {/* Top Row: Icon, Tier Badge, and Unlock Status */}
              <div>
                <div className="flex items-start justify-between mb-2.5">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${style.iconRing}`}>
                    {renderIcon(milestone.iconName, "w-4 h-4")}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
                      {milestone.badgeLevel}
                    </span>
                    {milestone.isUnlocked ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30" title="Unlocked">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center border border-slate-700" title="Locked">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Badge Title & Short Criteria */}
                <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                  {milestone.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {milestone.description}
                </p>
              </div>

              {/* Bottom Progress or Unlocked Timestamp */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                {milestone.isUnlocked ? (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>+{milestone.rewardXp} XP</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {milestone.unlockedAt || "Unlocked"}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>{milestone.currentValue || "Progress"}</span>
                      <span className="font-semibold text-slate-300">{milestone.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Modal for Badge Details */}
      {activeBadge && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111723] rounded-2xl border border-slate-700 max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge Hero Visual */}
            <div className="text-center pt-2">
              <div className={`w-16 h-16 mx-auto rounded-2xl border flex items-center justify-center mb-3 ${
                activeBadge.isUnlocked
                  ? "bg-amber-500/20 text-amber-400 border-amber-400/50 shadow-xl shadow-amber-500/20"
                  : "bg-slate-800 text-slate-500 border-slate-700"
              }`}>
                {renderIcon(activeBadge.iconName, "w-8 h-8")}
              </div>

              <div className="flex items-center justify-center space-x-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                  {activeBadge.badgeLevel} Badge
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  +{activeBadge.rewardXp} XP
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mt-2 font-['Outfit']">
                {activeBadge.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {activeBadge.description}
              </p>
            </div>

            {/* Criteria Box */}
            <div className="p-3.5 rounded-xl bg-[#162033] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Unlock Requirement:</span>
                <span className="font-semibold text-slate-200">{activeBadge.criteria}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Your Current Status:</span>
                <span className={`font-bold ${activeBadge.isUnlocked ? "text-emerald-400" : "text-blue-400"}`}>
                  {activeBadge.isUnlocked ? "Accomplished ✓" : `${activeBadge.currentValue} (${activeBadge.progress}%)`}
                </span>
              </div>

              {!activeBadge.isUnlocked && (
                <div className="pt-1">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${activeBadge.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions to achieve or celebrate badge */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              {activeBadge.category === "unit_completion" && (
                <button
                  onClick={() => {
                    setActiveBadge(null);
                    onNavigate("learn");
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Syllabus & Complete Units</span>
                </button>
              )}

              {activeBadge.category === "high_score" && (
                <button
                  onClick={() => {
                    setActiveBadge(null);
                    onNavigate("prelims");
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Practice Prelims MCQs</span>
                </button>
              )}

              {activeBadge.category === "mains_mastery" && (
                <button
                  onClick={() => {
                    setActiveBadge(null);
                    onNavigate("mains");
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Write Answer for 10+ Marks</span>
                </button>
              )}

              <button
                onClick={() => {
                  onAskBolt(`How can I optimize my study plan to achieve the milestone: "${activeBadge.title}" (${activeBadge.criteria})? Give me specific syllabus targets.`);
                  setActiveBadge(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                <span>Ask Bolt for Milestone Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
