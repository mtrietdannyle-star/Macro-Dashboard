import { useState, useEffect, useCallback } from 'react';

const API_BASE = '/api';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useMarketData() {
  const [data, setData] = useState({
    market: null,
    fred: null,
    acwi: null,
    yieldHistory: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchAll = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [marketRes, fredRes, acwiRes, yieldHistRes] = await Promise.allSettled([
        fetchJSON(`${API_BASE}/market`),
        fetchJSON(`${API_BASE}/fred`),
        fetchJSON(`${API_BASE}/market?type=acwi`),
        fetchJSON(`${API_BASE}/fred?type=yield_history`),
      ]);

      setData({
        market: marketRes.status === 'fulfilled' ? marketRes.value : null,
        fred: fredRes.status === 'fulfilled' ? fredRes.value : null,
        acwi: acwiRes.status === 'fulfilled' ? acwiRes.value : null,
        yieldHistory: yieldHistRes.status === 'fulfilled' ? yieldHistRes.value : null,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: err.message,
      }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { ...data, refresh: fetchAll };
}

// --- Helper functions to transform raw API data into display format ---

export function getYieldCurveData(fred) {
  if (!fred?.data) return [];
  const maturities = ['DGS1MO', 'DGS3MO', 'DGS6MO', 'DGS1', 'DGS2', 'DGS5', 'DGS7', 'DGS10', 'DGS20', 'DGS30'];
  return maturities
    .map(id => fred.data[id])
    .filter(Boolean)
    .map(d => ({
      maturity: d.maturity,
      yield: d.value,
      prior: d.prior,
    }));
}

export function getRatesData(fred) {
  if (!fred?.data) return [];
  const d = fred.data;
  const items = [];

  if (d.FEDFUNDS) {
    items.push({
      name: 'Fed Funds Rate',
      value: `${d.FEDFUNDS.value}%`,
      prior: d.FEDFUNDS.prior ? `${d.FEDFUNDS.prior}%` : null,
      change: d.FEDFUNDS.prior ? `${((d.FEDFUNDS.value - d.FEDFUNDS.prior) * 100).toFixed(0)} bps` : null,
      direction: d.FEDFUNDS.prior ? (d.FEDFUNDS.value > d.FEDFUNDS.prior ? 'up' : d.FEDFUNDS.value < d.FEDFUNDS.prior ? 'down' : 'flat') : 'flat',
      signal: 'neutral',
      date: d.FEDFUNDS.date,
      source: 'FRED',
    });
  }

  if (d.DGS10) {
    items.push({
      name: '10Y Treasury Yield',
      value: `${d.DGS10.value}%`,
      prior: d.DGS10.prior ? `${d.DGS10.prior}%` : null,
      change: d.DGS10.prior ? `${((d.DGS10.value - d.DGS10.prior) * 100).toFixed(0)} bps` : null,
      direction: d.DGS10.prior ? (d.DGS10.value > d.DGS10.prior ? 'up' : 'down') : 'flat',
      signal: 'neutral',
      date: d.DGS10.date,
      source: 'FRED',
    });
  }

  if (d.DGS2) {
    items.push({
      name: '2Y Treasury Yield',
      value: `${d.DGS2.value}%`,
      prior: d.DGS2.prior ? `${d.DGS2.prior}%` : null,
      change: d.DGS2.prior ? `${((d.DGS2.value - d.DGS2.prior) * 100).toFixed(0)} bps` : null,
      direction: d.DGS2.prior ? (d.DGS2.value > d.DGS2.prior ? 'up' : 'down') : 'flat',
      signal: 'neutral',
      date: d.DGS2.date,
      source: 'FRED',
    });
  }

  if (d.T10Y2Y) {
    const val = d.T10Y2Y.value;
    items.push({
      name: '2s10s Spread',
      value: `${val >= 0 ? '+' : ''}${(val * 100).toFixed(0)} bps`,
      prior: d.T10Y2Y.prior ? `${(d.T10Y2Y.prior * 100).toFixed(0)} bps` : null,
      change: d.T10Y2Y.prior ? `${((val - d.T10Y2Y.prior) * 100).toFixed(0)} bps` : null,
      direction: d.T10Y2Y.prior ? (val > d.T10Y2Y.prior ? 'up' : 'down') : 'flat',
      signal: val < 0 ? 'bearish' : 'neutral',
      date: d.T10Y2Y.date,
      source: 'FRED',
    });
  }

  if (d.MORTGAGE30US) {
    items.push({
      name: '30Y Mortgage Rate',
      value: `${d.MORTGAGE30US.value}%`,
      prior: d.MORTGAGE30US.prior ? `${d.MORTGAGE30US.prior}%` : null,
      change: d.MORTGAGE30US.prior ? `${((d.MORTGAGE30US.value - d.MORTGAGE30US.prior) * 100).toFixed(0)} bps` : null,
      direction: d.MORTGAGE30US.prior ? (d.MORTGAGE30US.value > d.MORTGAGE30US.prior ? 'up' : 'down') : 'flat',
      signal: d.MORTGAGE30US.value > 6.5 ? 'bearish' : 'neutral',
      date: d.MORTGAGE30US.date,
      source: 'FRED',
    });
  }

  return items;
}

export function getInflationData(fred) {
  if (!fred?.data) return [];
  const d = fred.data;
  const items = [];

  if (d.CPIAUCSL && d.CPIAUCSL.yoy != null) {
    items.push({
      name: 'CPI (Headline YoY)',
      value: `${d.CPIAUCSL.yoy.toFixed(1)}%`,
      date: d.CPIAUCSL.date,
      signal: d.CPIAUCSL.yoy > 3 ? 'bearish' : d.CPIAUCSL.yoy > 2.5 ? 'neutral' : 'bullish',
      direction: 'flat',
      source: 'FRED / BLS',
    });
  }

  if (d.CPILFESL && d.CPILFESL.yoy != null) {
    items.push({
      name: 'Core CPI (YoY)',
      value: `${d.CPILFESL.yoy.toFixed(1)}%`,
      date: d.CPILFESL.date,
      signal: d.CPILFESL.yoy > 3 ? 'bearish' : d.CPILFESL.yoy > 2.5 ? 'neutral' : 'bullish',
      direction: 'flat',
      source: 'FRED / BLS',
    });
  }

  if (d.PCEPILFE && d.PCEPILFE.yoy != null) {
    items.push({
      name: 'Core PCE (YoY)',
      value: `${d.PCEPILFE.yoy.toFixed(1)}%`,
      date: d.PCEPILFE.date,
      signal: d.PCEPILFE.yoy > 3 ? 'bearish' : d.PCEPILFE.yoy > 2.5 ? 'neutral' : 'bullish',
      direction: 'flat',
      source: 'FRED / BLS',
    });
  }

  if (d.PPIACO && d.PPIACO.yoy != null) {
    items.push({
      name: 'PPI (YoY)',
      value: `${d.PPIACO.yoy.toFixed(1)}%`,
      date: d.PPIACO.date,
      signal: d.PPIACO.yoy > 3 ? 'bearish' : 'neutral',
      direction: 'flat',
      source: 'FRED / BLS',
    });
  }

  return items;
}

export function getGrowthData(fred) {
  if (!fred?.data) return [];
  const d = fred.data;
  const items = [];

  if (d.GDP) {
    items.push({
      name: 'Real GDP (Latest)',
      value: `${d.GDP.value}`,
      date: d.GDP.date,
      signal: 'neutral',
      direction: d.GDP.prior ? (d.GDP.value > d.GDP.prior ? 'up' : 'down') : 'flat',
      source: 'FRED / BEA',
    });
  }

  if (d.M2SL) {
    const val = d.M2SL.value;
    const formatted = val >= 1000 ? `$${(val / 1000).toFixed(2)}T` : `$${val.toFixed(0)}B`;
    items.push({
      name: 'M2 Money Supply',
      value: formatted,
      yoy: d.M2SL.yoy != null ? `${d.M2SL.yoy.toFixed(1)}% YoY` : null,
      date: d.M2SL.date,
      signal: 'neutral',
      direction: d.M2SL.prior ? (val > d.M2SL.prior ? 'up' : 'down') : 'flat',
      source: 'FRED',
    });
  }

  if (d.HOUST) {
    items.push({
      name: 'Housing Starts',
      value: `${d.HOUST.value.toFixed(0)}K`,
      date: d.HOUST.date,
      signal: d.HOUST.value < 1300 ? 'bearish' : 'neutral',
      direction: d.HOUST.prior ? (d.HOUST.value > d.HOUST.prior ? 'up' : 'down') : 'flat',
      source: 'FRED / Census',
    });
  }

  return items;
}

export function getLaborData(fred) {
  if (!fred?.data) return [];
  const d = fred.data;
  const items = [];

  if (d.UNRATE) {
    items.push({
      name: 'Unemployment Rate',
      value: `${d.UNRATE.value}%`,
      prior: d.UNRATE.prior ? `${d.UNRATE.prior}%` : null,
      change: d.UNRATE.prior ? `${(d.UNRATE.value - d.UNRATE.prior).toFixed(1)} pp` : null,
      date: d.UNRATE.date,
      signal: d.UNRATE.value > 4.5 ? 'bearish' : d.UNRATE.value > 4 ? 'neutral' : 'bullish',
      direction: d.UNRATE.prior ? (d.UNRATE.value > d.UNRATE.prior ? 'up' : 'down') : 'flat',
      source: 'FRED / BLS',
    });
  }

  if (d.PAYEMS) {
    const change = d.PAYEMS.prior ? d.PAYEMS.value - d.PAYEMS.prior : null;
    items.push({
      name: 'Nonfarm Payrolls',
      value: change != null ? `${change >= 0 ? '+' : ''}${change.toFixed(0)}K MoM` : `${d.PAYEMS.value.toFixed(0)}K`,
      date: d.PAYEMS.date,
      signal: change != null ? (change < 0 ? 'bearish' : change < 100 ? 'neutral' : 'bullish') : 'neutral',
      direction: change != null ? (change > 0 ? 'up' : 'down') : 'flat',
      source: 'FRED / BLS',
    });
  }

  return items;
}

export function getSentimentData(fred, market) {
  const items = [];

  // VIX from market data
  const vix = market?.quotes?.find(q => q.symbol === 'VIX');
  if (vix) {
    items.push({
      name: 'VIX',
      value: vix.price.toFixed(2),
      change: `${vix.change >= 0 ? '+' : ''}${vix.change.toFixed(2)}`,
      signal: vix.price > 30 ? 'bearish' : vix.price > 20 ? 'neutral' : 'bullish',
      direction: vix.change > 0 ? 'up' : 'down',
      source: 'CBOE',
    });
  }

  // Gold from market data
  const gld = market?.quotes?.find(q => q.symbol === 'GLD');
  if (gld) {
    items.push({
      name: 'Gold (GLD)',
      value: `$${gld.price.toFixed(2)}`,
      change: `${gld.changePct >= 0 ? '+' : ''}${gld.changePct.toFixed(2)}%`,
      signal: 'neutral',
      direction: gld.change > 0 ? 'up' : 'down',
      source: 'Market',
    });
  }

  // HY Credit from market data
  const hyg = market?.quotes?.find(q => q.symbol === 'HYG');
  if (hyg) {
    items.push({
      name: 'HY Credit (HYG)',
      value: `$${hyg.price.toFixed(2)}`,
      change: `${hyg.changePct >= 0 ? '+' : ''}${hyg.changePct.toFixed(2)}%`,
      signal: 'neutral',
      direction: hyg.change > 0 ? 'up' : 'down',
      source: 'Market',
    });
  }

  // UMich Sentiment
  if (fred?.data?.UMCSENT) {
    const d = fred.data.UMCSENT;
    items.push({
      name: 'UMich Sentiment',
      value: d.value.toFixed(1),
      date: d.date,
      signal: d.value < 60 ? 'bearish' : d.value < 80 ? 'neutral' : 'bullish',
      direction: d.prior ? (d.value > d.prior ? 'up' : 'down') : 'flat',
      source: 'FRED / UMich',
    });
  }

  return items;
}
