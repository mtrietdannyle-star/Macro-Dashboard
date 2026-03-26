import React from 'react';

function Skeleton() {
  return (
    <div className="grid grid-cols-7 gap-2">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="text-center space-y-1">
          <div className="skeleton h-3 w-10 mx-auto rounded" />
          <div className="skeleton h-5 w-16 mx-auto rounded" />
          <div className="skeleton h-3 w-12 mx-auto rounded" />
        </div>
      ))}
    </div>
  );
}

export default function MarketSnapshot({ quotes, loading }) {
  if (loading) {
    return (
      <div className="border border-term-border bg-term-surface p-3">
        <div className="text-[10px] text-term-dim tracking-wider uppercase mb-2">Market Snapshot</div>
        <Skeleton />
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="border border-term-border bg-term-surface p-3">
        <div className="text-[10px] text-term-dim tracking-wider uppercase mb-2">Market Snapshot — Awaiting Data</div>
        <div className="text-xs text-term-dim text-center py-2">Failed to load market data. Check API proxy.</div>
      </div>
    );
  }

  return (
    <div className="border border-term-border bg-term-surface p-3">
      <div className="text-[10px] text-term-dim tracking-wider uppercase mb-2">Market Snapshot — Live</div>
      <div className="grid grid-cols-7 gap-2">
        {quotes.map((q) => {
          const isPositive = q.changePct >= 0;
          const colorClass = isPositive ? 'text-term-green' : 'text-term-red';
          const pctFromHigh = q.fiftyTwoWeekHigh
            ? (((q.price - q.fiftyTwoWeekHigh) / q.fiftyTwoWeekHigh) * 100).toFixed(1)
            : null;

          return (
            <div key={q.symbol} className="text-center">
              <div className="text-[10px] text-term-dim tracking-wider">{q.symbol}</div>
              <div className={`text-sm tabular-nums font-semibold ${colorClass}`}>
                {q.symbol === 'VIX' ? q.price.toFixed(2) : `$${q.price.toFixed(2)}`}
              </div>
              <div className={`text-[10px] tabular-nums ${colorClass}`}>
                {isPositive ? '+' : ''}{q.changePct.toFixed(2)}%
              </div>
              {pctFromHigh && (
                <div className="text-[9px] text-term-dim tabular-nums">{pctFromHigh}% from 52WH</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
