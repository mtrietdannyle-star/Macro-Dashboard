import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ACWIChart({ data, loading }) {
  return (
    <div className="border border-term-border bg-term-surface p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-term-dim tracking-wider uppercase">ACWI — 1 Year</div>
        {data && data.length > 0 && (
          <div className="text-xs text-term-green tabular-nums glow-green">
            ${data[data.length - 1]?.close?.toFixed(2)}
          </div>
        )}
      </div>

      {loading ? (
        <div className="skeleton h-48 rounded" />
      ) : data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="acwiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2937" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#4a5568', fontSize: 9 }}
              tickFormatter={(d) => {
                const dt = new Date(d);
                return dt.toLocaleDateString('en-US', { month: 'short' });
              }}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#0d1117', border: '1px solid #1e2937', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              labelStyle={{ color: '#00ff88' }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'ACWI']}
            />
            <Area type="monotone" dataKey="close" stroke="#00ff88" fill="url(#acwiGradient)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-48 flex items-center justify-center text-xs text-term-dim">
          No ACWI data available
        </div>
      )}
    </div>
  );
}
