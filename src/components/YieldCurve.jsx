import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

function YieldCurveChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2937" />
        <XAxis dataKey="maturity" tick={{ fill: '#4a5568', fontSize: 10 }} />
        <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ background: '#0d1117', border: '1px solid #1e2937', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          labelStyle={{ color: '#00ff88' }}
        />
        <Area type="monotone" dataKey="yield" stroke="#00ff88" fill="url(#yieldGradient)" strokeWidth={2} dot={{ r: 3, fill: '#00ff88' }} name="Current" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function YieldHistoryChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2937" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#4a5568', fontSize: 9 }}
          tickFormatter={(d) => d.slice(5)}
        />
        <YAxis tick={{ fill: '#4a5568', fontSize: 10 }} domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{ background: '#0d1117', border: '1px solid #1e2937', fontSize: 11, fontFamily: 'JetBrains Mono' }}
        />
        <Line type="monotone" dataKey="y2" stroke="#00ff88" strokeWidth={1.5} dot={false} name="2Y" />
        <Line type="monotone" dataKey="y5" stroke="#ffaa00" strokeWidth={1.5} dot={false} name="5Y" />
        <Line type="monotone" dataKey="y10" stroke="#ff4444" strokeWidth={1.5} dot={false} name="10Y" />
        <Line type="monotone" dataKey="y30" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="30Y" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function YieldTable({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <table className="w-full text-[10px] mt-2">
      <thead>
        <tr className="text-term-dim border-b border-term-border">
          <th className="text-left py-1">Maturity</th>
          <th className="text-right py-1">Yield</th>
          <th className="text-right py-1">Prior</th>
          <th className="text-right py-1">Change</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          const change = row.prior ? row.yield - row.prior : 0;
          const changeColor = change > 0 ? 'text-term-red' : change < 0 ? 'text-term-green' : 'text-term-dim';
          return (
            <tr key={row.maturity} className="border-b border-term-border/50">
              <td className="py-1 text-term-text">{row.maturity}</td>
              <td className="py-1 text-right tabular-nums font-medium text-term-green">{row.yield?.toFixed(2)}%</td>
              <td className="py-1 text-right tabular-nums text-term-dim">{row.prior?.toFixed(2)}%</td>
              <td className={`py-1 text-right tabular-nums ${changeColor}`}>
                {change > 0 ? '+' : ''}{(change * 100).toFixed(0)} bps
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function YieldCurve({ curveData, historyData, loading }) {
  return (
    <div className="border border-term-border bg-term-surface p-3">
      <div className="text-[10px] text-term-dim tracking-wider uppercase mb-3">Treasury Yield Curve</div>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-48 rounded" />
          <div className="skeleton h-32 rounded" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] text-term-dim mb-1">CURRENT CURVE</div>
              <YieldCurveChart data={curveData} />
            </div>
            <div>
              <div className="text-[9px] text-term-dim mb-1">
                YIELD HISTORY (3M)
                <span className="ml-2">
                  <span className="text-term-green">■</span> 2Y
                  <span className="text-term-amber ml-1">■</span> 5Y
                  <span className="text-term-red ml-1">■</span> 10Y
                  <span className="text-purple-400 ml-1">■</span> 30Y
                </span>
              </div>
              <YieldHistoryChart data={historyData} />
            </div>
          </div>
          <YieldTable data={curveData} />
        </>
      )}
    </div>
  );
}
