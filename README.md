# Macro Terminal v3.0 — Live Data

A real-time macroeconomic dashboard built with React + Vite, deployed to Vercel with serverless API proxies for FRED and Yahoo Finance data.

## Architecture

```
┌─────────────────────────────────────┐
│  Browser (React + Recharts + TW)    │
│                                     │
│  /api/market ──► Yahoo Finance      │
│  /api/fred   ──► FRED API           │
└─────────────────────────────────────┘
      ▲                                 
      │  Vercel Serverless Functions    
      │  (bypasses CORS, caches 2-60m) 
```

**Why this approach?**  
Financial data APIs block direct browser requests (CORS). Vercel serverless functions act as a thin proxy layer — no persistent server, free tier is more than sufficient, and responses are edge-cached.

## Data Sources

| Endpoint | Source | Data | Cache TTL |
|----------|--------|------|-----------|
| `/api/market` | Yahoo Finance (unofficial) | SPY, QQQ, TLT, GLD, USO, HYG, VIX quotes + ACWI 1Y chart | 2 min |
| `/api/fred` | FRED API (free key) | Treasury yields, Fed Funds, CPI, PCE, PPI, GDP, M2, unemployment, payrolls, UMich sentiment | 60 min |

## Setup & Deploy (10 minutes)

### 1. Get a FRED API Key (free)
1. Go to https://fred.stlouisfed.org/docs/api/api_key.html
2. Create an account and request a key
3. Copy the key — you'll need it in step 4

### 2. Install Vercel CLI
```bash
npm install -g vercel
```

### 3. Clone / copy this project
```bash
cd macro-terminal
npm install
```

### 4. Local development
```bash
# Copy .env.example to .env and add your FRED key
cp .env.example .env
# Edit .env with your FRED_API_KEY

# For local dev, you need the Vercel dev server to run the API functions
vercel dev
```
This starts both the Vite frontend and the serverless functions locally.

### 5. Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Set the FRED API key as an environment variable
vercel env add FRED_API_KEY

# Redeploy with the env var
vercel --prod
```

That's it. You'll get a URL like `https://macro-terminal-xxx.vercel.app`.

### Alternative: Deploy via Vercel Dashboard
1. Push this repo to GitHub
2. Go to https://vercel.com/new
3. Import the repo
4. In Settings → Environment Variables, add `FRED_API_KEY`
5. Deploy

## Project Structure

```
macro-terminal/
├── api/
│   ├── market.js          # Yahoo Finance proxy (quotes + ACWI history)
│   └── fred.js            # FRED API proxy (yields, inflation, growth, labor)
├── src/
│   ├── components/
│   │   ├── Header.jsx     # Terminal header with live clock
│   │   ├── StatusBar.jsx  # Connection status footer
│   │   ├── MarketSnapshot.jsx  # 7-ticker market bar
│   │   ├── YieldCurve.jsx     # Yield curve chart + history + table
│   │   ├── ACWIChart.jsx      # ACWI 1-year area chart
│   │   ├── MacroCard.jsx      # Individual indicator card
│   │   └── MacroSection.jsx   # Section grouping (Rates, Inflation, etc.)
│   ├── hooks/
│   │   └── useMarketData.js   # Data fetching + transformation
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── .env.example
```

## Refresh Behavior

- **Auto-refresh**: Every 5 minutes
- **Manual refresh**: Click REFRESH button in header
- **Edge caching**: Market data cached 2 min, FRED data cached 60 min at Vercel's edge
- **Stale-while-revalidate**: Serves stale data while fetching fresh in background

## Extending

**Add a new FRED series:**
1. Add the series ID to the `SERIES` object in `api/fred.js`
2. Add a transformation function in `src/hooks/useMarketData.js`
3. Display it in the appropriate `MacroSection`

**Add a new market ticker:**
1. Add the Yahoo Finance symbol to `SYMBOLS` in `api/market.js`
2. It will automatically appear in `MarketSnapshot`

**Add ISM / Conference Board (no free API):**
These require manual entry or scraping. You could add a third serverless function that scrapes tradingeconomics.com, but that's fragile. Recommend keeping those as manual overrides in a separate config.

## Cost

- **Vercel free tier**: 100GB bandwidth, 100 hours serverless compute — way more than enough
- **FRED API**: Free, 120 requests/minute limit
- **Yahoo Finance**: Unofficial, no key needed, but could break if Yahoo changes their API
