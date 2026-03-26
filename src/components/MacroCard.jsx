import React, { useState } from 'react';

const directionIcons = {
  up: '▲',
  down: '▼',
  flat: '▶',
};

const directionColors = {
  up: 'text-term-red',
  down: 'text-term-green',
  flat: 'text-term-amber',
};

export default function MacroCard({ item, expanded: defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!item) return null;

  const dirIcon = directionIcons[item.direction] || '▶';
  const dirColor = directionColors[item.direction] || 'text-term-dim';

  return (
    <div
      className="border border-term-border bg-term-surface/50 p-2.5 cursor-pointer hover:border-term-green/30 transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-term-text font-medium truncate">{item.name}</span>
            {item.signal && (
              <span className={`text-[8px] px-1.5 py-0.5 border rounded signal-${item.signal} uppercase tracking-wider`}>
                {item.signal}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-semibold text-term-green glow-green tabular-nums">
              {item.value}
            </span>
            {item.change && (
              <span className={`text-[10px] tabular-nums ${dirColor}`}>
                {dirIcon} {item.change}
              </span>
            )}
          </div>

          {item.yoy && (
            <div className="text-[10px] text-term-dim mt-0.5">{item.yoy}</div>
          )}
        </div>

        <div className="text-right shrink-0 ml-2">
          {item.date && <div className="text-[9px] text-term-dim">{item.date}</div>}
          {item.source && <div className="text-[8px] text-term-dim/60">{item.source}</div>}
        </div>
      </div>

      {expanded && item.explanation && (
        <div className="mt-2 pt-2 border-t border-term-border/50 text-[10px] text-term-dim leading-relaxed">
          {item.explanation}
        </div>
      )}
    </div>
  );
}
