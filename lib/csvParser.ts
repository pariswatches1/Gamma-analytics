import Papa from 'papaparse';
import { OptionData, CSVParseResult, CSVColumnMapping } from './types';

/**
 * Detect if content is TOS/StockAnalysis format
 * This format has expiry section headers like "8 DEC 25  (2)  100 (Weeklys)"
 */
function isTOSFormat(content: string): boolean {
  // Look for expiry section headers pattern
  const expiryPattern = /^\d{1,2}\s+[A-Z]{3}\s+\d{2}\s+\(\d+\)/m;
  return expiryPattern.test(content);
}

/**
 * Parse TOS/StockAnalysis format
 * This format has call and put data on the same row
 */
function parseTOSFormat(content: string): CSVParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: OptionData[] = [];
  
  const lines = content.split('\n');
  let underlyingPrice = 0;
  let currentExpiry = '';
  let rowIndex = 0;
  
  // Parse underlying price - look for line after "UNDERLYING" header
  // Format: LAST,LX,Net Chng,BID,BX,ASK,AX,Size,Volume,Open,High,Low
  //         6870.40, ,0,6842.61, ,6898.63, ,<empty>,<empty>,0,0,0
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    if (line && line.includes('LAST') && line.includes('BID') && line.includes('ASK')) {
      // Next line should have the price data
      if (i + 1 < lines.length) {
        const priceLine = lines[i + 1];
        const parts = priceLine.split(',');
        if (parts.length > 0) {
          const price = parseFloat(parts[0].replace(/[^\d.]/g, ''));
          if (price > 100 && price < 100000) { // Reasonable stock price range
            underlyingPrice = price;
            break;
          }
        }
      }
    }
  }
  
  // Month name to number mapping
  const monthMap: Record<string, string> = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
    'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
    'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
  };
  
  for (const line of lines) {
    // Check for expiry section header (e.g., "8 DEC 25  (2)  100 (Weeklys)")
    const expiryMatch = line.match(/^(\d{1,2})\s+([A-Z]{3})\s+(\d{2})\s+\(\d+\)/);
    if (expiryMatch) {
      const [, day, month, year] = expiryMatch;
      const monthNum = monthMap[month] || '01';
      currentExpiry = `20${year}-${monthNum}-${day.padStart(2, '0')}`;
      continue;
    }
    
    // Skip header rows and empty lines
    if (!currentExpiry || !line.trim() || line.includes('Delta,Gamma') || line.includes('UNDERLYING')) {
      continue;
    }
    
    // Parse data row
    const parts = line.split(',').map(p => p.trim().replace(/"/g, ''));
    
    // Need at least enough columns for the format
    if (parts.length < 28) continue;
    
    // Skip if no strike
    const strike = parseFloat(parts[15]?.replace(/[^\d.]/g, '') || '0');
    if (!strike || isNaN(strike)) continue;
    
    // Parse call data
    const callGamma = parseNumberTOS(parts[3]);
    const callOI = parseNumberTOS(parts[6]);
    
    if (callOI > 0) {
      const callOption: OptionData = {
        id: `SPX_${currentExpiry}_${strike}_call_${rowIndex}`,
        symbol: `SPX${currentExpiry.replace(/-/g, '')}C${Math.round(strike * 1000).toString().padStart(8, '0')}`,
        underlying: 'SPX',
        expiry: currentExpiry,
        strike,
        optionType: 'call',
        volume: parseNumberTOS(parts[7]),
        openInterest: callOI,
        delta: parseNumberTOS(parts[2]),
        gamma: callGamma,
        theta: parseNumberTOS(parts[4]),
        vega: parseNumberTOS(parts[5]),
        impliedVolatility: parsePercentTOS(parts[8]),
        bid: parseNumberTOS(parts[10]),
        ask: parseNumberTOS(parts[12]),
        last: parseNumberTOS(parts[9]),
        underlyingPrice,
      };
      data.push(callOption);
    }
    
    // Parse put data
    const putGamma = parseNumberTOS(parts[21]);
    const putOI = parseNumberTOS(parts[24]);
    
    if (putOI > 0) {
      const putOption: OptionData = {
        id: `SPX_${currentExpiry}_${strike}_put_${rowIndex}`,
        symbol: `SPX${currentExpiry.replace(/-/g, '')}P${Math.round(strike * 1000).toString().padStart(8, '0')}`,
        underlying: 'SPX',
        expiry: currentExpiry,
        strike,
        optionType: 'put',
        volume: parseNumberTOS(parts[25]),
        openInterest: putOI,
        delta: parseNumberTOS(parts[20]),
        gamma: putGamma,
        theta: parseNumberTOS(parts[22]),
        vega: parseNumberTOS(parts[23]),
        impliedVolatility: parsePercentTOS(parts[26]),
        bid: parseNumberTOS(parts[16]),
        ask: parseNumberTOS(parts[18]),
        last: parseNumberTOS(parts[27]),
        underlyingPrice,
      };
      data.push(putOption);
    }
    
    rowIndex++;
  }
  
  if (data.length === 0) {
    errors.push('No valid option data found in TOS format');
  } else {
    warnings.push(`Parsed ${data.length} options from TOS/StockAnalysis format`);
    if (underlyingPrice > 0) {
      warnings.push(`Detected underlying price: ${underlyingPrice.toFixed(2)}`);
    }
  }
  
  return {
    success: data.length > 0,
    data,
    errors,
    warnings,
    rowCount: rowIndex,
    validRowCount: data.length,
  };
}

/**
 * Parse number from TOS format (handles commas, <empty>, etc.)
 */
function parseNumberTOS(value: string | undefined): number {
  if (!value || value === '<empty>' || value === '--' || value === '') return 0;
  const cleaned = value.replace(/[,$\s"]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse percentage from TOS format (e.g., "10.56%")
 */
function parsePercentTOS(value: string | undefined): number {
  if (!value || value === '<empty>' || value === '--' || value === '') return 0;
  const cleaned = value.replace(/[%\s"]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num / 100; // Convert to decimal
}

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
  // Check for TOS/StockAnalysis format first
  if (isTOSFormat(content)) {
    console.log('Detected TOS/StockAnalysis format');
    return parseTOSFormat(content);
  }

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
