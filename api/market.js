// Vercel Serverless Function: /api/market
// Proxies Yahoo Finance for real-time market quotes
// No API key needed — unofficial but reliable server-side

const SYMBOLS = {
  SPY: { name: 'S&P 500' },
  QQQ: { name: 'Nasdaq 100' },
  TLT: { name: '20+ Yr Treasury' },
  GLD: { name: 'Gold' },
  USO: { name: 'Crude Oil' },
  HYG: { name: 'High Yield Corp' },
  '^VIX': { name: 'Volatility' },
};

async function fetchQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d&includePrePost=false`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) throw new Error(`Yahoo Finance error for ${symbol}: ${res.status}`);
  const data = await res.json();
  const result = data.chart?.result?.[0];
  if (!result) throw new Error(`No data for ${symbol}`);

  const meta = result.meta;
  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose || meta.previousClose;
  const change = price - prevClose;
  const changePct = (change / prevClose) * 100;

  return {
    symbol: symbol.replace('^', ''),
    name: SYMBOLS[symbol]?.name || symbol,
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePct: Math.round(changePct * 100) / 100,
    prevClose: Math.round(prevClose * 100) / 100,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    timestamp: meta.regularMarketTime,
  };
}

async function fetchACWIHistory() {
  // Fetch ~1 year of weekly ACWI data for the chart
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/ACWI?range=1y&interval=1wk`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const result = data.chart?.result?.[0];
  if (!result) return [];

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  return timestamps.map((ts, i) => ({
    date: new Date(ts * 1000).toISOString().split('T')[0],
    close: closes[i] ? Math.round(closes[i] * 100) / 100 : null,
  })).filter(d => d.close !== null);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

  try {
    const { type } = req.query;

    if (type === 'acwi') {
      const history = await fetchACWIHistory();
      return res.status(200).json({ acwi: history });
    }

    // Default: fetch all market quotes
    const symbols = Object.keys(SYMBOLS);
    const results = await Promise.allSettled(symbols.map(fetchQuote));

    const quotes = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    const errors = results
      .filter(r => r.status === 'rejected')
      .map((r, i) => ({ symbol: symbols[i], error: r.reason.message }));

    return res.status(200).json({
      quotes,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
