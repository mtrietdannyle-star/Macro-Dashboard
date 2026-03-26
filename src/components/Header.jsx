import React, { useState, useEffect } from 'react';

export default function Header({ lastUpdated, onRefresh, loading }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-term-border bg-[#060a10] shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-term-red opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-term-amber opacity-80" />
          <div className="w-2.5 h-2.5 rounded-full bg-term-green opacity-80" />
        </div>
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-term-green">
            <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm14 3.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-sm font-semibold text-term-green glow-green tracking-wider">MACRO TERMINAL</span>
          <span className="text-[10px] text-term-dim ml-1">v3.0 LIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-[10px] text-term-dim tracking-wider">FRED / BLS / YAHOO FINANCE</div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-[10px] text-term-green border border-term-green/30 px-2 py-0.5 hover:bg-term-green/10 transition-colors disabled:opacity-50"
        >
          {loading ? 'LOADING...' : 'REFRESH'}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-term-dim">{dateStr}</span>
          <span className="text-xs text-term-green tabular-nums glow-green">{timeStr}</span>
          <span className="w-2 h-2 rounded-full bg-term-green cursor-blink" />
        </div>
      </div>
    </div>
  );
}
