import Papa from 'papaparse';
import { OptionData, CSVParseResult, CSVColumnMapping } from './types';

// Common column name variations
const COLUMN_VARIATIONS: Record<keyof CSVColumnMapping, string[]> = {
  symbol: ['symbol', 'ticker', 'option_symbol', 'optionsymbol', 'option symbol', 'contract'],
  underlying: ['underlying', 'underlying_symbol', 'root', 'stock', 'equity'],
  expiry: ['expiry', 'expiration', 'exp', 'expiration_date', 'exp_date', 'expirydate', 'expdate'],
  strike: ['strike', 'strike_price', 'strikeprice', 'k'],
  type: ['type', 'option_type', 'optiontype', 'call_put', 'callput', 'cp', 'put_call', 'putcall', 'side'],
  volume: ['volume', 'vol', 'trading_volume', 'qty'],
  openInterest: ['open_interest', 'openinterest', 'oi', 'open interest', 'open_int'],
  delta: ['delta', 'del'],
  gamma: ['gamma', 'gam'],
  theta: ['theta', 'the'],
  vega: ['vega', 'veg'],
  iv: ['iv', 'implied_volatility', 'impliedvolatility', 'impl_vol', 'implvol', 'implied vol', 'implied_vol'],
  bid: ['bid', 'bid_price', 'bidprice'],
  ask: ['ask', 'ask_price', 'askprice', 'offer'],
  last: ['last', 'last_price', 'lastprice', 'close', 'mark'],
  underlyingPrice: ['underlying_price', 'underlyingprice', 'spot', 'spot_price', 'stock_price', 'stockprice', 'underlying_last'],
};

/**
 * Find matching column name from variations
 */
function findColumn(headers: string[], variations: string[]): string | undefined {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
  
  for (const variation of variations) {
    const normalizedVariation = variation.toLowerCase().replace(/[^a-z0-9]/g, '');
    const index = normalizedHeaders.findIndex((h) => h === normalizedVariation || h.includes(normalizedVariation));
    if (index !== -1) {
      return headers[index];
    }
  }
  return undefined;
}

/**
 * Auto-detect column mapping from CSV headers
 */
export function detectColumnMapping(headers: string[]): CSVColumnMapping {
  const mapping: CSVColumnMapping = {};

  for (const [key, variations] of Object.entries(COLUMN_VARIATIONS)) {
    const found = findColumn(headers, variations);
    if (found) {
      mapping[key as keyof CSVColumnMapping] = found;
    }
  }

  return mapping;
}

/**
 * Parse option type from various formats
 */
function parseOptionType(value: string): 'call' | 'put' | null {
  const normalized = value.toLowerCase().trim();
  
  if (['call', 'c', 'calls'].includes(normalized)) {
    return 'call';
  }
  if (['put', 'p', 'puts'].includes(normalized)) {
    return 'put';
  }
  
  // Check if embedded in symbol
  if (normalized.includes('c') && !normalized.includes('p')) {
    return 'call';
  }
  if (normalized.includes('p') && !normalized.includes('c')) {
    return 'put';
  }
  
  return null;
}

/**
 * Parse expiry date from various formats
 */
function parseExpiryDate(value: string): string | null {
  if (!value) return null;
  
  // Try parsing directly
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  // Try MM/DD/YYYY format
  const mmddyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mmddyyyy) {
    const [, month, day, year] = mmddyyyy;
    const fullYear = year.length === 2 ? '20' + year : year;
    const parsed = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  
  // Try YYYYMMDD format
  const yyyymmdd = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    return `${year}-${month}-${day}`;
  }
  
  return null;
}

/**
 * Parse numeric value, handling various formats
 */
function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  
  // Remove currency symbols, commas, and percentage signs
  const cleaned = value.toString().replace(/[$,%\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extract underlying symbol from option symbol
 */
function extractUnderlying(optionSymbol: string): string {
  // Common option symbol format: SPX230616C04100000
  // Extract letters at the beginning
  const match = optionSymbol.match(/^([A-Z]+)/);
  return match ? match[1] : optionSymbol;
}

/**
 * Generate unique ID for option
 */
function generateOptionId(option: Partial<OptionData>, index: number): string {
  return `${option.symbol || option.underlying || 'UNKNOWN'}_${option.expiry}_${option.strike}_${option.optionType}_${index}`;
}

/**
 * Parse CSV file content into option data
 */
export function parseCSV(
  content: string,
  customMapping?: CSVColumnMapping
): CSVParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: OptionData[] = [];

  // Parse CSV
  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    parsed.errors.forEach((err) => {
      errors.push(`Row ${err.row}: ${err.message}`);
    });
  }

  if (!parsed.data || parsed.data.length === 0) {
    errors.push('No data found in CSV file');
    return { success: false, data: [], errors, warnings, rowCount: 0, validRowCount: 0 };
  }

  const headers = parsed.meta.fields || [];
  const mapping = customMapping || detectColumnMapping(headers);

  // Validate required columns
  const requiredColumns: (keyof CSVColumnMapping)[] = ['strike', 'gamma', 'openInterest'];
  const missingRequired = requiredColumns.filter((col) => !mapping[col]);
  
  if (missingRequired.length > 0) {
    errors.push(`Missing required columns: ${missingRequired.join(', ')}`);
    return { success: false, data: [], errors, warnings, rowCount: parsed.data.length, validRowCount: 0 };
  }

  // Log detected mapping
  console.log('Detected column mapping:', mapping);

  // Parse each row
  let validRowCount = 0;
  parsed.data.forEach((row, index) => {
    try {
      const strike = parseNumber(mapping.strike ? row[mapping.strike] : undefined);
      const gamma = parseNumber(mapping.gamma ? row[mapping.gamma] : undefined);
      const openInterest = parseNumber(mapping.openInterest ? row[mapping.openInterest] : undefined);

      // Skip rows with invalid essential data
      if (strike === 0 || openInterest === 0) {
        return;
      }

      // Parse option type
      let optionType: 'call' | 'put' = 'call';
      if (mapping.type && row[mapping.type]) {
        const parsed = parseOptionType(row[mapping.type]);
        if (parsed) {
          optionType = parsed;
        } else {
          warnings.push(`Row ${index + 2}: Could not determine option type, defaulting to call`);
        }
      } else if (mapping.symbol && row[mapping.symbol]) {
        // Try to infer from symbol
        const symbolLower = row[mapping.symbol].toLowerCase();
        if (symbolLower.includes('p') && !symbolLower.includes('c')) {
          optionType = 'put';
        }
      }

      // Parse expiry
      let expiry = '';
      if (mapping.expiry && row[mapping.expiry]) {
        const parsedDate = parseExpiryDate(row[mapping.expiry]);
        if (parsedDate) {
          expiry = parsedDate;
        } else {
          warnings.push(`Row ${index + 2}: Could not parse expiry date`);
          expiry = new Date().toISOString().split('T')[0];
        }
      } else {
        // Default to current date if not found
        expiry = new Date().toISOString().split('T')[0];
      }

      // Get underlying
      const symbol = mapping.symbol ? row[mapping.symbol] : '';
      const underlying = mapping.underlying 
        ? row[mapping.underlying] 
        : (symbol ? extractUnderlying(symbol) : 'SPX');

      const option: OptionData = {
        id: '',
        symbol: symbol || `${underlying}${expiry.replace(/-/g, '')}${optionType === 'call' ? 'C' : 'P'}${Math.round(strike * 1000).toString().padStart(8, '0')}`,
        underlying,
        expiry,
        strike,
        optionType,
        volume: parseNumber(mapping.volume ? row[mapping.volume] : undefined),
        openInterest,
        delta: parseNumber(mapping.delta ? row[mapping.delta] : undefined),
        gamma,
        theta: parseNumber(mapping.theta ? row[mapping.theta] : undefined),
        vega: parseNumber(mapping.vega ? row[mapping.vega] : undefined),
        impliedVolatility: parseNumber(mapping.iv ? row[mapping.iv] : undefined),
        bid: parseNumber(mapping.bid ? row[mapping.bid] : undefined),
        ask: parseNumber(mapping.ask ? row[mapping.ask] : undefined),
        last: parseNumber(mapping.last ? row[mapping.last] : undefined),
        underlyingPrice: parseNumber(mapping.underlyingPrice ? row[mapping.underlyingPrice] : undefined),
      };

      option.id = generateOptionId(option, index);
      data.push(option);
      validRowCount++;
    } catch (err) {
      errors.push(`Row ${index + 2}: Failed to parse - ${err}`);
    }
  });

  // Determine underlying price if not in data
  if (data.length > 0 && data[0].underlyingPrice === 0) {
    // Estimate from ATM strike (strike closest to where delta = 0.5)
    const callOptions = data.filter((o) => o.optionType === 'call' && Math.abs(o.delta - 0.5) < 0.1);
    if (callOptions.length > 0) {
      const avgStrike = callOptions.reduce((sum, o) => sum + o.strike, 0) / callOptions.length;
      data.forEach((o) => {
        o.underlyingPrice = avgStrike;
      });
      warnings.push(`Estimated underlying price from ATM options: ${avgStrike.toFixed(2)}`);
    }
  }

  return {
    success: errors.length === 0 || validRowCount > 0,
    data,
    errors,
    warnings,
    rowCount: parsed.data.length,
    validRowCount,
  };
}

/**
 * Get the next N Fridays from today (options typically expire on Fridays)
 */
function getNextFridays(count: number): string[] {
  const fridays: string[] = [];
  const today = new Date();
  let current = new Date(today);
  
  // Move to next Friday
  const dayOfWeek = current.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // If today is Friday, get next Friday
  current.setDate(current.getDate() + daysUntilFriday);
  
  for (let i = 0; i < count; i++) {
    fridays.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 7); // Next Friday
  }
  
  return fridays;
}

/**
 * Generate sample CSV content for testing
 */
export function generateSampleCSV(): string {
  const headers = ['symbol', 'underlying', 'expiry', 'strike', 'type', 'volume', 'open_interest', 'delta', 'gamma', 'theta', 'vega', 'iv', 'bid', 'ask', 'last', 'underlying_price'];
  
  const basePrice = 4500;
  const expiries = getNextFridays(3);
  const strikes: number[] = [];
  
  // Generate strikes around the base price
  for (let i = -20; i <= 20; i++) {
    strikes.push(basePrice + i * 25);
  }
  
  const rows: string[] = [headers.join(',')];
  
  expiries.forEach((expiry) => {
    strikes.forEach((strike) => {
      // Generate call option
      const callDelta = 0.5 - (strike - basePrice) / (basePrice * 0.2);
      const callGamma = 0.002 * Math.exp(-Math.pow((strike - basePrice) / 100, 2));
      const callOI = Math.floor(Math.random() * 5000 + 500);
      const callVolume = Math.floor(Math.random() * 1000);
      const callIV = 0.15 + Math.random() * 0.1;
      
      rows.push([
        `SPX${expiry.replace(/-/g, '')}C${strike.toString().padStart(5, '0')}`,
        'SPX',
        expiry,
        strike,
        'call',
        callVolume,
        callOI,
        Math.max(0, Math.min(1, callDelta)).toFixed(4),
        callGamma.toFixed(6),
        (-0.5 - Math.random()).toFixed(4),
        (1 + Math.random()).toFixed(4),
        callIV.toFixed(4),
        (Math.random() * 10).toFixed(2),
        (Math.random() * 10 + 0.1).toFixed(2),
        (Math.random() * 10 + 0.05).toFixed(2),
        basePrice,
      ].join(','));
      
      // Generate put option
      const putDelta = -0.5 + (strike - basePrice) / (basePrice * 0.2);
      const putGamma = callGamma;
      const putOI = Math.floor(Math.random() * 5000 + 500);
      const putVolume = Math.floor(Math.random() * 1000);
      const putIV = callIV + 0.02;
      
      rows.push([
        `SPX${expiry.replace(/-/g, '')}P${strike.toString().padStart(5, '0')}`,
        'SPX',
        expiry,
        strike,
        'put',
        putVolume,
        putOI,
        Math.max(-1, Math.min(0, putDelta)).toFixed(4),
        putGamma.toFixed(6),
        (-0.3 - Math.random()).toFixed(4),
        (1 + Math.random()).toFixed(4),
        putIV.toFixed(4),
        (Math.random() * 10).toFixed(2),
        (Math.random() * 10 + 0.1).toFixed(2),
        (Math.random() * 10 + 0.05).toFixed(2),
        basePrice,
      ].join(','));
    });
  });
  
  return rows.join('\n');
}
