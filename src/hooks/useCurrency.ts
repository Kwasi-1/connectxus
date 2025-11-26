/**
 * Currency Hook
 * Provides currency formatting utilities for the entire app
 * Default currency: Ghana Cedis (GHS)
 */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

const CURRENCY_CONFIG: CurrencyConfig = {
  code: "GHS",
  symbol: "₵",
  locale: "en-GH",
};

export function useCurrency() {
  /**
   * Format a number as currency
   * @param amount - The amount to format
   * @param options - Optional formatting options
   * @returns Formatted currency string
   */
  const formatCurrency = (
    amount: number,
    options?: {
      showSymbol?: boolean;
      decimals?: number;
    }
  ): string => {
    const { showSymbol = true, decimals = 2 } = options || {};
    
    const formattedAmount = amount.toFixed(decimals);
    
    if (showSymbol) {
      return `${CURRENCY_CONFIG.symbol}${formattedAmount}`;
    }
    
    return formattedAmount;
  };

  /**
   * Format currency using Intl.NumberFormat for proper localization
   * @param amount - The amount to format
   * @returns Formatted currency string with proper locale
   */
  const formatCurrencyLocale = (amount: number): string => {
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
      style: "currency",
      currency: CURRENCY_CONFIG.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return {
    formatCurrency,
    formatCurrencyLocale,
    currencySymbol: CURRENCY_CONFIG.symbol,
    currencyCode: CURRENCY_CONFIG.code,
    locale: CURRENCY_CONFIG.locale,
  };
}
