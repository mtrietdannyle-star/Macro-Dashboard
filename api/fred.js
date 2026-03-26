// Vercel Serverless Function: /api/fred
// Proxies FRED API for macro-economic data
// Requires FRED_API_KEY environment variable (free at https://fred.stlouisfed.org/docs/api/api_key.html)

const SERIES = {
  // Rates & Yields
  FEDFUNDS: { name: 'Fed Funds Rate', category: 'rates' },
  DGS1MO: { name: '1M Treasury', category: 'yields', maturity: '1M' },
  DGS3MO: { name: '3M Treasury', category: 'yields', maturity: '3M' },
  DGS6MO: { name: '6M Treasury', category: 'yields', maturity: '6M' },
  DGS1: { name: '1Y Treasury', category: 'yields', maturity: '1Y' },
  DGS2: { name: '2Y Treasury', category: 'yields', maturity: '2Y' },
  DGS5: { name: '5Y Treasury', category: 'yields', maturity: '5Y' },
  DGS7: { name: '7Y Treasury', category: 'yields', maturity: '7Y' },
  DGS10: { name: '10Y Treasury', category: 'yields', maturity: '10Y' },
  DGS20: { name: '20Y Treasury', category: 'yields', maturity: '20Y' },
  DGS30: { name: '30Y Treasury', category: 'yields', maturity: '30Y' },
  T10Y2Y: { name: '2s10s Spread', category: 'rates' },
  T10Y3M: { name: '10Y-3M Spread', category: 'rates' },
  MORTGAGE30US: { name: '30Y Mortgage Rate', category: 'rates' },

  // Inflation
  CPIAUCSL: { name: 'CPI All Items', category: 'inflation', yoy: true },
  CPILFESL: { name: 'Core CPI', category: 'inflation', yoy: true },
  PCEPILFE: { name: 'Core PCE', category: 'inflation', yoy: true },
  PPIACO: { name: 'PPI All Commodities', category: 'inflation', yoy: true },

  // Growth
  GDP: { name: 'Real GDP', category: 'growth' },
  M2SL: { name: 'M2 Money Supply', category: 'growth' },
  HOUST: { name: 'Housing Starts', category: 'growth' },

  // Labor
  UNRATE: { name: 'Unemployment Rate', category: 'labor' },
  PAYEMS: { name: 'Nonfarm Payrolls', category: 'labor' },

  // Sentiment
  UMCSENT: { name: 'UMich Consumer Sentiment', category: 'sentiment' },
};

async function fetchSeries(seriesId, apiKey, limit = 12) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED error for ${seriesId}: ${res.status}`);
  const data = await res.json();

  if (!data.observations || data.observations.length === 0) {
    throw new Error(`No observations for ${seriesId}`);
  }

  return data.observations
    .filter(obs => obs.value !== '.')
    .map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value),
    }));
}

function calculateYoY(observations) {
  // Observations are sorted desc. Find the latest and ~12 months ago
  if (observations.length < 2) return null;

  const latest = observations[0];
  // Find observation closest to 12 months ago
  const latestDate = new Date(latest.date);
  const targetDate = new Date(latestDate);
  targetDate.setFullYear(targetDate.getFullYear() - 1);

  let closest = observations[observations.length - 1];
  let minDiff = Infinity;
  for (const obs of observations) {
    const diff = Math.abs(new Date(obs.date) - targetDate);
    if (diff < minDiff) {
      minDiff = diff;
      closest = obs;
    }
  }

  if (closest.value === 0) return null;
  return ((latest.value - closest.value) / closest.value) * 100;
}

async function fetchYieldCurveHistory(apiKey) {
  // Fetch last 3 months of daily 2Y, 5Y, 10Y, 30Y yields
  const seriesIds = ['DGS2', 'DGS5', 'DGS10', 'DGS30'];
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const startDate = threeMonthsAgo.toISOString().split('T')[0];

  const results = await Promise.allSettled(
    seriesIds.map(async (id) => {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${apiKey}&file_type=json&observation_start=${startDate}&sort_order=asc`;
      const res = await fetch(url);
      const data = await res.json();
      return {
        id,
        observations: (data.observations || [])
          .filter(o => o.value !== '.')
          .map(o => ({ date: o.date, value: parseFloat(o.value) })),
      };
    })
  );

  // Merge by date
  const dateMap = {};
  const keyMap = { DGS2: 'y2', DGS5: 'y5', DGS10: 'y10', DGS30: 'y30' };

  results
    .filter(r => r.status === 'fulfilled')
    .forEach(r => {
      const { id, observations } = r.value;
      observations.forEach(obs => {
        if (!dateMap[obs.date]) dateMap[obs.date] = { date: obs.date };
        dateMap[obs.date][keyMap[id]] = obs.value;
      });
    });

  // Sample ~10-15 points (weekly)
  const allDates = Object.keys(dateMap).sort();
  const step = Math.max(1, Math.floor(allDates.length / 12));
  const sampled = [];
  for (let i = 0; i < allDates.length; i += step) {
    sampled.push(dateMap[allDates[i]]);
  }
  // Always include the latest
  const lastDate = allDates[allDates.length - 1];
  if (sampled[sampled.length - 1]?.date !== lastDate) {
    sampled.push(dateMap[lastDate]);
  }

  return sampled;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'FRED_API_KEY not configured. Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html',
    });
  }

  try {
    const { type } = req.query;

    // Yield curve history endpoint
    if (type === 'yield_history') {
      const history = await fetchYieldCurveHistory(apiKey);
      return res.status(200).json({ yieldHistory: history });
    }

    // Fetch all series
    const seriesIds = Object.keys(SERIES);
    const results = await Promise.allSettled(
      seriesIds.map(id => fetchSeries(id, apiKey, SERIES[id].yoy ? 24 : 6))
    );

    const data = {};
    const errors = [];

    results.forEach((result, i) => {
      const id = seriesIds[i];
      const meta = SERIES[id];
      if (result.status === 'fulfilled') {
        const observations = result.value;
        const latest = observations[0];
        const prior = observations[1];

        const entry = {
          seriesId: id,
          name: meta.name,
          category: meta.category,
          date: latest.date,
          value: latest.value,
          prior: prior ? prior.value : null,
          priorDate: prior ? prior.date : null,
        };

        // Calculate YoY for inflation series
        if (meta.yoy) {
          const yoy = calculateYoY(observations);
          entry.yoy = yoy !== null ? Math.round(yoy * 100) / 100 : null;
        }

        // For yield curve, include maturity
        if (meta.maturity) {
          entry.maturity = meta.maturity;
        }

        data[id] = entry;
      } else {
        errors.push({ seriesId: id, error: result.reason.message });
      }
    });

    return res.status(200).json({
      data,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
