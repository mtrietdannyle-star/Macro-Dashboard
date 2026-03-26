import React from 'react';

export default function StatusBar({ lastUpdated, loading, error, fred, market }) {
  const fredStatus = fred ? 'CONNECTED' : error ? 'ERROR' : 'PENDING';
  const marketStatus = market ? 'CONNECTED' : error ? 'ERROR' : 'PENDING';

  const statusColor = (s) => {
    if (s === 'CONNECTED') return 'text-term-green';
    if (s === 'ERROR') return 'text-term-red';
    return 'text-term-amber';
  };

  const dotColor = (s) => {
    if (s === 'CONNECTED') return 'bg-term-green';
    if (s === 'ERROR') return 'bg-term-red';
    return 'bg-term-amber animate-pulse';
  };

  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '---';

  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-t border-term-border bg-[#060a10] text-[9px] tracking-wider">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor(fredStatus)}`} />
          <span className={statusColor(fredStatus)}>FRED: {fredStatus}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor(marketStatus)}`} />
          <span className={statusColor(marketStatus)}>YAHOO: {marketStatus}</span>
        </div>
        {loading && (
          <span className="text-term-amber animate-pulse">FETCHING...</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-term-dim">
        <span>LAST UPDATE: <span className="text-term-text">{updatedStr}</span></span>
        <span>AUTO-REFRESH: 5m</span>
        <span>FRED API KEY REQUIRED</span>
      </div>
    </div>
  );
}
