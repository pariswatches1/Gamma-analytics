# GammaScope - Options Gamma Analytics Dashboard

A professional, modern web application for analyzing options gamma exposure, inspired by services like SpotGamma. Built with Next.js 14, TypeScript, and Tailwind CSS.

![GammaScope Dashboard](https://via.placeholder.com/800x400?text=GammaScope+Dashboard)

## Features

- 📊 **Gamma Analysis** - Aggregate and visualize gamma exposure by strike and expiration
- 📈 **Interactive Charts** - Bar and area charts for gamma distribution analysis
- 🎯 **Key Level Detection** - Automatically identify support, resistance, and gamma flip zones
- 💾 **Session Management** - Save and load multiple analysis sessions
- 📁 **CSV Import** - Auto-detect columns from Thinkorswim, IBKR, and generic exports
- ⭐ **Watchlist** - Track your favorite symbols with notes
- ⚙️ **Customizable Settings** - Adjust display preferences and export data
- 🌙 **Dark Theme** - Professional trading-optimized dark interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **CSV Parsing**: PapaParse
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd options-gamma-analytics
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

---

## Usage Guide

### 1. Uploading Options Data

Navigate to the **Upload** page using the sidebar navigation.

#### Preparing Your CSV

Export options chain data from your broker with the following columns:

| Column | Required | Description |
|--------|----------|-------------|
| Strike | ✅ Yes | Option strike price |
| Type | ✅ Yes | Call or Put (accepts: C/P, Call/Put, call/put) |
| Gamma | ✅ Yes | Option gamma value |
| Expiry | ✅ Yes | Expiration date (various formats supported) |
| Symbol | No | Underlying symbol (SPX, SPY, etc.) |
| Open Interest | No | Contract open interest |
| Volume | No | Daily trading volume |
| Delta | No | Option delta |
| IV | No | Implied volatility |
| Bid/Ask | No | Current bid and ask prices |

#### Supported Broker Exports

- **Thinkorswim**: Export option chain with Greeks enabled
- **Interactive Brokers**: Options chain export
- **Generic CSV**: Any CSV with standard column names

#### Upload Process

1. Click the upload zone or drag & drop your CSV file
2. Enter the current **spot price** of the underlying
3. Optionally enter/confirm the **symbol**
4. Click **Process Data**
5. You'll be redirected to the dashboard automatically

#### Sample Data

No data? Click **Download Sample CSV** to get realistic SPX options data for testing.

---

### 2. Dashboard Overview

The main dashboard displays your gamma analysis with these components:

#### Summary Cards (Top Row)
- **Net Gamma**: Total gamma exposure (positive = bullish support)
- **Top Positive Strike**: Highest gamma concentration (support level)
- **Top Negative Strike**: Highest negative gamma (resistance level)  
- **Gamma Flip**: Price level where gamma changes sign (pivot zone)
- **Total Call Gamma**: Sum of all call option gamma
- **Total Put Gamma**: Sum of all put option gamma
- **Total Open Interest**: Combined OI across all strikes
- **Expiries Tracked**: Number of expiration dates in dataset

#### Gamma by Strike Chart
- Bar chart showing call (green) and put (red) gamma at each strike
- White reference line indicates current spot price
- Positive bars = support levels, Negative bars = resistance

#### Gamma by Expiry Chart  
- Area chart showing gamma distribution across expiration dates
- Identifies near-term vs. longer-dated gamma concentration

#### Key Levels Table
- Top strikes ranked by absolute gamma
- Shows type (Support/Resistance/Gamma Flip)
- Distance from current spot price
- Total gamma and open interest at each level

#### Top Expiries Table
- Expiration dates ranked by total gamma
- Visual bars showing relative gamma magnitude
- Tags for near-term (< 7 days) and monthly expirations

---

### 3. Managing Sessions

Sessions allow you to save and reload analysis configurations.

#### Saving a Session
- Sessions auto-save when you upload new data
- Each session stores: options data, symbol, spot price, timestamp

#### Loading a Session
- Go to **Upload** page
- Click on any session in the **Saved Sessions** panel
- Dashboard will load with that session's data

#### Deleting a Session
- Click the trash icon next to any saved session
- Confirm deletion (cannot be undone)

---

### 4. Watchlist

Track symbols you want to monitor:

1. Navigate to **Watchlist** from sidebar
2. Enter a symbol and click **Add** (or use Quick Add buttons)
3. Add notes to track your thesis
4. Remove symbols with the trash icon

---

### 5. Settings

Customize your experience:

#### General Settings
- **Default Symbol**: Pre-selected symbol for new sessions
- **Max Levels to Display**: Number of rows in key levels table (5-50)
- **Chart Height**: Adjust chart dimensions (200-600px)

#### Display Settings
- Toggle volume and open interest visibility

#### Data Management
- **Export All Data**: Download complete backup (JSON)
- **Import Data**: Restore from backup file
- **Clear All Data**: Delete all sessions, settings, and watchlist

---

## Project Structure

```
options-gamma-analytics/
├── app/                      # Next.js App Router pages
│   ├── globals.css          # Global styles and Tailwind
│   ├── layout.tsx           # Root layout with sidebar
│   ├── page.tsx             # Dashboard (home) page
│   ├── upload/page.tsx      # Upload page
│   ├── watchlist/page.tsx   # Watchlist page
│   └── settings/page.tsx    # Settings page
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── SummaryCards.tsx
│   │   ├── GammaByStrikeChart.tsx
│   │   ├── GammaByExpiryChart.tsx
│   │   ├── KeyLevelsTable.tsx
│   │   └── TopExpiriesTable.tsx
│   ├── layout/              # Layout components
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Alert.tsx
│   │   ├── Skeleton.tsx
│   │   └── index.ts
│   └── upload/              # Upload-specific components
│       ├── CSVUploader.tsx
│       └── SavedSessionsList.tsx
├── hooks/                   # Custom React hooks
│   ├── useOptionsData.ts    # Options data & session management
│   ├── useSettings.ts       # User settings
│   └── useWatchlist.ts      # Watchlist management
├── lib/                     # Utilities and core logic
│   ├── types.ts             # TypeScript type definitions
│   ├── calculations.ts      # Gamma calculation functions
│   ├── csvParser.ts         # CSV parsing & validation
│   ├── storage.ts           # LocalStorage wrapper
│   └── utils.ts             # Utility functions
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Key Concepts

### What is Gamma?

Gamma measures the rate of change of an option's delta. In the context of market microstructure:

- **Positive Gamma** (typically from market makers hedging calls): Creates support as dealers buy dips
- **Negative Gamma** (typically from put hedging): Creates resistance as dealers sell rallies
- **Gamma Flip Zone**: Price level where net gamma changes from positive to negative

### How to Use This Data

1. **Identify Support Levels**: High positive gamma strikes often act as magnets/support
2. **Identify Resistance**: High negative gamma strikes may cap rallies
3. **Watch the Gamma Flip**: Price behavior often changes character around this level
4. **Expiry Analysis**: Near-term expirations have more gamma impact

---

## Gamma Assumptions & Notes

- This dashboard assumes the `gamma` values in your CSV are reported **per $1 move** in the underlying, as is common with many brokers.
- Aggregated gamma and "gamma exposure" metrics are intended as **relative measures** within a symbol (e.g., comparing strikes and expiries for SPX), not as precise dollar risk calculations.
- Put gamma is treated as **negative**, call gamma as **positive**, so:
  - `netGamma = callGamma + putGamma`
  - `totalGamma = |callGamma| + |putGamma|`
- Gamma flip levels are approximated by detecting where net gamma changes sign across strikes and using **linear interpolation** between those strikes.
- If you switch data providers or formats, make sure their definition of gamma is compatible with these assumptions.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

---

## Acknowledgments

- Inspired by [SpotGamma](https://spotgamma.com) and similar gamma analytics services
- Built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and [Recharts](https://recharts.org)
