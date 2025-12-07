// Core option data structure
export interface OptionData {
  id: string;
  symbol: string;
  underlying: string;
  expiry: string;
  strike: number;
  optionType: 'call' | 'put';
  volume: number;
  openInterest: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  impliedVolatility: number;
  bid: number;
  ask: number;
  last: number;
  underlyingPrice: number;
}

// Aggregated gamma data by strike
export interface GammaByStrike {
  strike: number;
  callGamma: number;
  putGamma: number;
  netGamma: number;
  totalGamma: number;
  callOI: number;
  putOI: number;
}

// Aggregated gamma data by expiry
export interface GammaByExpiry {
  expiry: string;
  daysToExpiry: number;
  callGamma: number;
  putGamma: number;
  netGamma: number;
  totalGamma: number;
}

// Key gamma levels
export interface KeyGammaLevel {
  strike: number;
  netGamma: number;
  totalOI: number;
  type: 'positive' | 'negative' | 'flip';
  description: string;
}

// Gamma exposure calculation result
export interface GammaExposure {
  spotPrice: number;
  gex: number;
  callGex: number;
  putGex: number;
}

// Upload session data
export interface UploadSession {
  id: string;
  name: string;
  symbol: string;
  uploadedAt: string;
  optionCount: number;
  underlyingPrice: number;
  data: OptionData[];
}

// Dashboard summary stats
export interface DashboardSummary {
  symbol: string;
  spotPrice: number;
  totalGamma: number;
  totalNetGamma: number;
  topPositiveStrike: number | null;
  topNegativeStrike: number | null;
  gammaFlipLevel: number | null;
  callGammaTotal: number;
  putGammaTotal: number;
  totalOpenInterest: number;
  uniqueStrikes: number;
  uniqueExpiries: number;
}

// User settings
export interface UserSettings {
  defaultSymbol: string;
  maxLevelsToDisplay: number;
  chartHeight: number;
  autoRefresh: boolean;
  refreshInterval: number;
  showVolume: boolean;
  showOpenInterest: boolean;
  topLevelsCount: number;
  chartType: 'bar' | 'area';
  showCallPutSeparate: boolean;
}

// Watchlist item
export interface WatchlistItem {
  symbol: string;
  name?: string;
  notes?: string;
  alertPrice?: number;
  lastPrice?: number;
  trend?: 'up' | 'down' | 'neutral';
  addedAt: string;
}

// CSV column mapping
export interface CSVColumnMapping {
  symbol?: string;
  underlying?: string;
  expiry?: string;
  strike?: string;
  type?: string;
  volume?: string;
  openInterest?: string;
  delta?: string;
  gamma?: string;
  theta?: string;
  vega?: string;
  iv?: string;
  bid?: string;
  ask?: string;
  last?: string;
  underlyingPrice?: string;
}

// CSV parsing result
export interface CSVParseResult {
  success: boolean;
  data: OptionData[];
  errors: string[];
  warnings: string[];
  rowCount: number;
  validRowCount: number;
}

// Chart data point
export interface ChartDataPoint {
  name: string;
  value: number;
  callValue?: number;
  putValue?: number;
  netValue?: number;
  [key: string]: string | number | undefined;
}

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  defaultSymbol: 'SPX',
  maxLevelsToDisplay: 10,
  chartHeight: 300,
  autoRefresh: false,
  refreshInterval: 60,
  showVolume: true,
  showOpenInterest: true,
  topLevelsCount: 10,
  chartType: 'bar',
  showCallPutSeparate: true,
};

// Default watchlist
export const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { symbol: 'SPX', name: 'S&P 500 Index', addedAt: new Date().toISOString() },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', addedAt: new Date().toISOString() },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', addedAt: new Date().toISOString() },
];
