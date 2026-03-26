import React from 'react';
import Header from './components/Header';
import StatusBar from './components/StatusBar';
import MarketSnapshot from './components/MarketSnapshot';
import YieldCurve from './components/YieldCurve';
import ACWIChart from './components/ACWIChart';
import MacroSection from './components/MacroSection';
import {
  useMarketData,
  getYieldCurveData,
  getRatesData,
  getInflationData,
  getGrowthData,
  getLaborData,
  getSentimentData,
} from './hooks/useMarketData';

export default function App() {
  const {
    market,
    fred,
    acwi,
    yieldHistory,
    loading,
    error,
    lastUpdated,
    refresh,
  } = useMarketData();

  const curveData = getYieldCurveData(fred);
  const ratesData = getRatesData(fred);
  const inflationData = getInflationData(fred);
  const growthData = getGrowthData(fred);
  const laborData = getLaborData(fred);
  const sentimentData = getSentimentData(fred, market);

  return (
    <div className="h-screen flex flex-col bg-term-bg overflow-hidden">
      <Header lastUpdated={lastUpdated} onRefresh={refresh} loading={loading} />

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Market Ticker Bar */}
        <MarketSnapshot quotes={market?.quotes} loading={loading && !market} />

        {/* Top row: Yield Curve + ACWI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <YieldCurve
              curveData={curveData}
              historyData={yieldHistory?.yieldHistory}
              loading={loading && !fred}
            />
          </div>
          <div>
            <ACWIChart data={acwi?.acwi} loading={loading && !acwi} />
          </div>
        </div>

        {/* Rates & Yields */}
        <MacroSection
          title="RATES & YIELDS"
          items={ratesData}
          loading={loading && !fred}
          columns={3}
        />

        {/* Inflation */}
        <MacroSection
          title="INFLATION"
          items={inflationData}
          loading={loading && !fred}
          columns={2}
        />

        {/* Growth + Labor side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <MacroSection
            title="GROWTH"
            items={growthData}
            loading={loading && !fred}
            columns={2}
          />
          <MacroSection
            title="LABOR"
            items={laborData}
            loading={loading && !fred}
            columns={2}
          />
        </div>

        {/* Sentiment */}
        <MacroSection
          title="SENTIMENT & RISK"
          items={sentimentData}
          loading={loading && !fred && !market}
          columns={2}
        />

        {/* Error display */}
        {error && (
          <div className="border border-term-red/30 bg-term-red/5 p-3">
            <div className="text-[10px] text-term-red tracking-wider uppercase mb-1">Error</div>
            <div className="text-xs text-term-dim">{error}</div>
          </div>
        )}

        {/* Spacer for scroll */}
        <div className="h-2" />
      </div>

      <StatusBar
        lastUpdated={lastUpdated}
        loading={loading}
        error={error}
        fred={fred}
        market={market}
      />
    </div>
  );
}
