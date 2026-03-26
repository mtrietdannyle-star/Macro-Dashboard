import React from 'react';
import MacroCard from './MacroCard';

const sectionColors = {
  'RATES & YIELDS': 'text-term-green',
  'INFLATION': 'text-term-red',
  'GROWTH': 'text-term-amber',
  'LABOR': 'text-purple-400',
  'SENTIMENT & RISK': 'text-cyan-400',
};

function Skeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="border border-term-border bg-term-surface/50 p-2.5">
          <div className="skeleton h-3 w-24 rounded mb-2" />
          <div className="skeleton h-6 w-16 rounded mb-1" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function MacroSection({ title, items, loading, columns = 3 }) {
  const titleColor = sectionColors[title] || 'text-term-green';

  const gridClass = columns === 2
    ? 'grid grid-cols-1 md:grid-cols-2 gap-2'
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2';

  return (
    <div className="border border-term-border bg-term-surface p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1.5 h-1.5 rounded-full ${titleColor.replace('text-', 'bg-')}`} />
        <span className={`text-[10px] tracking-wider uppercase font-semibold ${titleColor}`}>
          {title}
        </span>
        {items && !loading && (
          <span className="text-[9px] text-term-dim ml-auto">
            {items.length} indicator{items.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton count={columns} />
      ) : items && items.length > 0 ? (
        <div className={gridClass}>
          {items.map((item, i) => (
            <MacroCard key={item.name || i} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-xs text-term-dim text-center py-4">
          No data available. Check FRED API key configuration.
        </div>
      )}
    </div>
  );
}
