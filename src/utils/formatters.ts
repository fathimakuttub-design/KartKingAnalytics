/**
 * Indian numbering and currency formatters for KartKing Analytics
 */

export function formatINR(val: number, options: { compact?: boolean; decimals?: number } = {}): string {
  if (isNaN(val) || val === null || val === undefined) return '₹0';
  const { compact = true, decimals = 1 } = options;

  const isNegative = val < 0;
  const absVal = Math.abs(val);

  if (compact) {
    if (absVal >= 10000000) {
      // 1 Crore = 10,000,000
      const cr = absVal / 10000000;
      return `${isNegative ? '-' : ''}₹${cr.toFixed(decimals)}Cr`;
    }
    if (absVal >= 100000) {
      // 1 Lakh = 100,000
      const l = absVal / 100000;
      return `${isNegative ? '-' : ''}₹${l.toFixed(decimals)}L`;
    }
    if (absVal >= 1000) {
      const k = absVal / 1000;
      return `${isNegative ? '-' : ''}₹${k.toFixed(decimals)}k`;
    }
    return `${isNegative ? '-' : ''}₹${Math.round(absVal)}`;
  }

  // Full Indian currency format with standard comma system: 1,23,456.78
  const parts = absVal.toFixed(decimals).split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 && decimals > 0 ? `.${parts[1]}` : '';

  // Indian thousands and lakhs separator
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}₹${formattedInteger}${decimalPart}`;
}

export function formatIndianNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  const absVal = Math.abs(val);
  const isNegative = val < 0;

  if (absVal >= 10000000) {
    return `${isNegative ? '-' : ''}${(absVal / 10000000).toFixed(1)}Cr`;
  }
  if (absVal >= 100000) {
    return `${isNegative ? '-' : ''}${(absVal / 100000).toFixed(1)}L`;
  }
  if (absVal >= 1000) {
    return `${isNegative ? '-' : ''}${(absVal / 1000).toFixed(1)}k`;
  }
  return `${isNegative ? '-' : ''}${val.toLocaleString('en-IN')}`;
}

export function formatPercent(val: number, decimals: number = 1): string {
  if (isNaN(val)) return '0%';
  return `${val.toFixed(decimals)}%`;
}

export function formatChange(val: number): { text: string; isPositive: boolean; isZero: boolean } {
  if (isNaN(val) || Math.abs(val) < 0.05) {
    return { text: '0.0%', isPositive: true, isZero: true };
  }
  const isPositive = val > 0;
  const prefix = isPositive ? '+' : '';
  return {
    text: `${prefix}${val.toFixed(1)}%`,
    isPositive,
    isZero: false,
  };
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortMonth(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    year: '2-digit',
  });
}
