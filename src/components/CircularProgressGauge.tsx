import React from "react";

export interface CircularProgressRingProps {
  value: number; // 0 to 100
  size?: number; // width & height in px
  strokeWidth?: number;
  gradientFrom?: string;
  gradientTo?: string;
  gradientId?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  showValueText?: boolean;
  valueSuffix?: string;
  valueColor?: string;
  icon?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = ({
  value,
  size = 72,
  strokeWidth = 6,
  gradientFrom = "#3b82f6",
  gradientTo = "#6366f1",
  gradientId,
  trackColor = "rgba(51, 65, 85, 0.45)",
  label,
  sublabel,
  showValueText = true,
  valueSuffix = "%",
  valueColor = "text-white",
  icon,
  className = "",
}) => {
  const clampedValue = Math.min(Math.max(Math.round(value || 0), 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const gid = gradientId || `grad-${gradientFrom.replace("#", "")}-${gradientTo.replace("#", "")}-${size}`;

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 origin-center"
        >
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
            <filter id={`glow-${gid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={gradientFrom} floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

          {/* Foreground Active Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={`url(#${gid})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={`url(#glow-${gid})`}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content: Percentage or Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none p-1">
          {icon && <div className="mb-0.5">{icon}</div>}
          {showValueText && (
            <div className="flex items-baseline justify-center leading-none">
              <span
                className={`font-extrabold font-['Outfit'] tracking-tight ${valueColor}`}
                style={{ fontSize: size >= 90 ? "1.35rem" : size >= 70 ? "1.05rem" : "0.85rem" }}
              >
                {clampedValue}
              </span>
              <span
                className="text-slate-400 font-bold ml-0.5"
                style={{ fontSize: size >= 90 ? "0.75rem" : size >= 70 ? "0.65rem" : "0.55rem" }}
              >
                {valueSuffix}
              </span>
            </div>
          )}
          {sublabel && (
            <span
              className="text-[9px] font-semibold text-slate-400 leading-tight uppercase tracking-wider mt-0.5"
              style={{ fontSize: size >= 90 ? "9px" : "8px" }}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="text-xs font-semibold text-slate-300 mt-1 text-center truncate max-w-full">
          {label}
        </span>
      )}
    </div>
  );
};

export interface DualConcentricComparisonProps {
  outerValue: number;
  innerValue: number;
  outerLabel: string;
  innerLabel: string;
  outerColor?: string;
  innerColor?: string;
  size?: number;
  className?: string;
}

export const DualConcentricComparison: React.FC<DualConcentricComparisonProps> = ({
  outerValue,
  innerValue,
  outerLabel,
  innerLabel,
  outerColor = "#3b82f6", // Blue
  innerColor = "#a855f7", // Purple
  size = 110,
  className = "",
}) => {
  const outerClamped = Math.min(Math.max(Math.round(outerValue || 0), 0), 100);
  const innerClamped = Math.min(Math.max(Math.round(innerValue || 0), 0), 100);

  const outerStroke = 7;
  const innerStroke = 7;
  const gap = 3;

  const outerRadius = (size - outerStroke) / 2;
  const innerRadius = outerRadius - outerStroke - gap;

  const outerCircumference = 2 * Math.PI * outerRadius;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const outerOffset = outerCircumference - (outerClamped / 100) * outerCircumference;
  const innerOffset = innerCircumference - (innerClamped / 100) * innerCircumference;

  const delta = outerClamped - innerClamped;

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 origin-center"
        >
          {/* Outer Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius}
            fill="transparent"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth={outerStroke}
          />
          {/* Outer Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius}
            fill="transparent"
            stroke={outerColor}
            strokeWidth={outerStroke}
            strokeDasharray={outerCircumference}
            strokeDashoffset={outerOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Inner Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="transparent"
            stroke="rgba(51, 65, 85, 0.4)"
            strokeWidth={innerStroke}
          />
          {/* Inner Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            fill="transparent"
            stroke={innerColor}
            strokeWidth={innerStroke}
            strokeDasharray={innerCircumference}
            strokeDashoffset={innerOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text: Divergence Gap */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none select-none">
          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Gap</span>
          <span
            className={`text-sm font-extrabold font-['Outfit'] ${
              delta >= 15 ? "text-amber-400" : delta > 0 ? "text-slate-200" : "text-emerald-400"
            }`}
          >
            {delta > 0 ? `-${delta}%` : "0%"}
          </span>
        </div>
      </div>

      {/* Legend & Details */}
      <div className="space-y-2 text-xs flex-1">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: outerColor }} />
            <span className="text-slate-300 font-medium">{outerLabel}</span>
          </div>
          <span className="font-extrabold text-blue-400 text-sm font-['Outfit']">{outerClamped}%</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: innerColor }} />
            <span className="text-slate-300 font-medium">{innerLabel}</span>
          </div>
          <span className="font-extrabold text-purple-400 text-sm font-['Outfit']">{innerClamped}%</span>
        </div>
      </div>
    </div>
  );
};
