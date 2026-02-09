

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

  const formatCurrency = (
    amount: number | string,
    options?: {
      showSymbol?: boolean;
      decimals?: number;
    }
  ): string => {
    const { showSymbol = true, decimals = 2 } = options || {};

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      return showSymbol ? `${CURRENCY_CONFIG.symbol}0.00` : '0.00';
    }

    const formattedAmount = numericAmount.toFixed(decimals);

    if (showSymbol) {
      return `${CURRENCY_CONFIG.symbol}${formattedAmount}`;
    }

    return formattedAmount;
  };

 
  const formatCurrencyLocale = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numericAmount)) {
      return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
        style: "currency",
        currency: CURRENCY_CONFIG.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(0);
    }

    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
      style: "currency",
      currency: CURRENCY_CONFIG.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  return {
    formatCurrency,
    formatCurrencyLocale,
    currencySymbol: CURRENCY_CONFIG.symbol,
    currencyCode: CURRENCY_CONFIG.code,
    locale: CURRENCY_CONFIG.locale,
  };
}
