import {
  OptionData,
  GammaByStrike,
  GammaByExpiry,
  KeyGammaLevel,
  GammaExposure,
  DashboardSummary,
} from './types';

// Multiplier for gamma exposure calculation (contract size * 100)
const CONTRACT_MULTIPLIER = 100;

/**
 * Calculate days to expiry from expiry date string
 */
export function calculateDaysToExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);

  // Guard against invalid dates
  if (isNaN(expiry.getTime())) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Aggregate gamma by strike price
 */
export function aggregateGammaByStrike(options: OptionData[]): GammaByStrike[] {
  const strikeMap = new Map<number, GammaByStrike>();

  options.forEach((option) => {
    const existing = strikeMap.get(option.strike) || {
      strike: option.strike,
      callGamma: 0,
      putGamma: 0,
      netGamma: 0,
      totalGamma: 0,
      callOI: 0,
      putOI: 0,
    };

    // Gamma exposure (per-point) = gamma * open interest * contract multiplier
    const gammaExposure =
      option.gamma * option.openInterest * CONTRACT_MULTIPLIER;

    if (option.optionType === 'call') {
      existing.callGamma += gammaExposure;
      existing.callOI += option.openInterest;
    } else {
      // Put gamma is typically negative in terms of exposure
      existing.putGamma -= gammaExposure;
      existing.putOI += option.openInterest;
    }

    existing.netGamma = existing.callGamma + existing.putGamma;
    existing.totalGamma = Math.abs(existing.callGamma) + Math.abs(existing.putGamma);

    strikeMap.set(option.strike, existing);
  });

  return Array.from(strikeMap.values()).sort((a, b) => a.strike - b.strike);
}

/**
 * Aggregate gamma by expiry date
 */
export function aggregateGammaByExpiry(options: OptionData[]): GammaByExpiry[] {
  const expiryMap = new Map<string, GammaByExpiry>();

  options.forEach((option) => {
    const existing = expiryMap.get(option.expiry) || {
      expiry: option.expiry,
      daysToExpiry: calculateDaysToExpiry(option.expiry),
      callGamma: 0,
      putGamma: 0,
      netGamma: 0,
      totalGamma: 0,
    };

    const gammaExposure =
      option.gamma * option.openInterest * CONTRACT_MULTIPLIER;

    if (option.optionType === 'call') {
      existing.callGamma += gammaExposure;
    } else {
      existing.putGamma -= gammaExposure;
    }

    existing.netGamma = existing.callGamma + existing.putGamma;
    existing.totalGamma = Math.abs(existing.callGamma) + Math.abs(existing.putGamma);

    expiryMap.set(option.expiry, existing);
  });

  return Array.from(expiryMap.values()).sort(
    (a, b) => a.daysToExpiry - b.daysToExpiry
  );
}

/**
 * Get top N strikes by absolute gamma
 */
export function getTopGammaStrikes(
  gammaByStrike: GammaByStrike[],
  count: number = 10
): GammaByStrike[] {
  return [...gammaByStrike]
    .sort((a, b) => Math.abs(b.netGamma) - Math.abs(a.netGamma))
    .slice(0, count);
}

/**
 * Get top N expiries by absolute gamma
 */
export function getTopGammaExpiries(
  gammaByExpiry: GammaByExpiry[],
  count: number = 5
): GammaByExpiry[] {
  return [...gammaByExpiry]
    .sort((a, b) => Math.abs(b.netGamma) - Math.abs(a.netGamma))
    .slice(0, count);
}

/**
 * Find gamma flip level (where net gamma changes from positive to negative)
 */
export function findGammaFlipLevel(gammaByStrike: GammaByStrike[]): number | null {
  const sorted = [...gammaByStrike].sort((a, b) => a.strike - b.strike);

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    // Check for sign change
    if (
      (current.netGamma > 0 && next.netGamma < 0) ||
      (current.netGamma < 0 && next.netGamma > 0)
    ) {
      // Linear interpolation to find approximate flip point
      const ratio =
        Math.abs(current.netGamma) /
        (Math.abs(current.netGamma) + Math.abs(next.netGamma));
      return current.strike + (next.strike - current.strike) * ratio;
    }
  }

  return null;
}

/**
 * Identify key gamma levels
 */
export function identifyKeyGammaLevels(
  gammaByStrike: GammaByStrike[],
  count: number = 10
): KeyGammaLevel[] {
  const levels: KeyGammaLevel[] = [];

  // Get top positive gamma strikes
  const positiveStrikes = gammaByStrike
    .filter((s) => s.netGamma > 0)
    .sort((a, b) => b.netGamma - a.netGamma)
    .slice(0, Math.ceil(count / 2));

  positiveStrikes.forEach((s) => {
    levels.push({
      strike: s.strike,
      netGamma: s.netGamma,
      totalOI: s.callOI + s.putOI,
      type: 'positive',
      description: 'High positive gamma - potential support level',
    });
  });

  // Get top negative gamma strikes
  const negativeStrikes = gammaByStrike
    .filter((s) => s.netGamma < 0)
    .sort((a, b) => a.netGamma - b.netGamma)
    .slice(0, Math.ceil(count / 2));

  negativeStrikes.forEach((s) => {
    levels.push({
      strike: s.strike,
      netGamma: s.netGamma,
      totalOI: s.callOI + s.putOI,
      type: 'negative',
      description: 'High negative gamma - potential resistance level',
    });
  });

  // Find and add gamma flip level
  const flipLevel = findGammaFlipLevel(gammaByStrike);
  if (flipLevel) {
    levels.push({
      strike: flipLevel,
      netGamma: 0,
      totalOI: 0,
      type: 'flip',
      description: 'Gamma flip zone - volatility transition point',
    });
  }

  return levels.sort((a, b) => b.strike - a.strike);
}

/**
 * Calculate gamma exposure curve across spot prices
 */
export function calculateGammaExposureCurve(
  options: OptionData[],
  spotPrice: number,
  rangePercent: number = 5,
  steps: number = 50
): GammaExposure[] {
  const minSpot = spotPrice * (1 - rangePercent / 100);
  const maxSpot = spotPrice * (1 + rangePercent / 100);
  const stepSize = (maxSpot - minSpot) / steps;

  const exposures: GammaExposure[] = [];

  for (let spot = minSpot; spot <= maxSpot; spot += stepSize) {
    let callGex = 0;
    let putGex = 0;

    options.forEach((option) => {
      // Simplified GEX calculation
      // In practice, you'd recalculate Greeks at each spot price
      const gex = option.gamma * option.openInterest * CONTRACT_MULTIPLIER * spot;

      if (option.optionType === 'call') {
        callGex += gex;
      } else {
        putGex -= gex;
      }
    });

    exposures.push({
      spotPrice: Math.round(spot * 100) / 100,
      gex: callGex + putGex,
      callGex,
      putGex,
    });
  }

  return exposures;
}

/**
 * Calculate dashboard summary statistics
 */
export function calculateDashboardSummary(options: OptionData[]): DashboardSummary {
  if (options.length === 0) {
    return {
      symbol: '',
      spotPrice: 0,
      totalGamma: 0,
      totalNetGamma: 0,
      topPositiveStrike: null,
      topNegativeStrike: null,
      gammaFlipLevel: null,
      callGammaTotal: 0,
      putGammaTotal: 0,
      totalOpenInterest: 0,
      uniqueStrikes: 0,
      uniqueExpiries: 0,
    };
  }

  const gammaByStrike = aggregateGammaByStrike(options);

  let callGammaTotal = 0;
  let putGammaTotal = 0;
  let totalOpenInterest = 0;
  const strikes = new Set<number>();
  const expiries = new Set<string>();

  // Get symbol and spot price from first option
  const symbol = options[0]?.symbol || '';
  const spotPrice = options[0]?.underlyingPrice || 0;

  options.forEach((option) => {
    const gammaExp = option.gamma * option.openInterest * CONTRACT_MULTIPLIER;
    if (option.optionType === 'call') {
      callGammaTotal += gammaExp;
    } else {
      putGammaTotal += gammaExp;
    }
    totalOpenInterest += option.openInterest;
    strikes.add(option.strike);
    expiries.add(option.expiry);
  });

  const totalNetGamma = callGammaTotal - putGammaTotal;
  const totalGamma = callGammaTotal + putGammaTotal;

  // Find top positive and negative strikes
  const sortedByGamma = [...gammaByStrike].sort((a, b) => b.netGamma - a.netGamma);
  const topPositiveStrike =
    sortedByGamma.find((s) => s.netGamma > 0)?.strike ?? null;

  const sortedByNegativeGamma = [...gammaByStrike].sort(
    (a, b) => a.netGamma - b.netGamma
  );
  const topNegativeStrike =
    sortedByNegativeGamma.find((s) => s.netGamma < 0)?.strike ?? null;

  const gammaFlipLevel = findGammaFlipLevel(gammaByStrike);

  return {
    symbol,
    spotPrice,
    totalGamma,
    totalNetGamma,
    topPositiveStrike,
    topNegativeStrike,
    gammaFlipLevel,
    callGammaTotal,
    putGammaTotal,
    totalOpenInterest,
    uniqueStrikes: strikes.size,
    uniqueExpiries: expiries.size,
  };
}

/**
 * Format large numbers for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e9) {
    return sign + (absValue / 1e9).toFixed(decimals) + 'B';
  } else if (absValue >= 1e6) {
    return sign + (absValue / 1e6).toFixed(decimals) + 'M';
  } else if (absValue >= 1e3) {
    return sign + (absValue / 1e3).toFixed(decimals) + 'K';
  }
  return sign + absValue.toFixed(decimals);
}

/**
 * Format currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format expiry for display (short format)
 */
export function formatExpiryShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
