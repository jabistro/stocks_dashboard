import { Stock } from '../types/Stock';

const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY || '';
const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY || '';

class StockAPI {
  private async fetchAlphaVantageQuote(symbol: string): Promise<Stock> {
    if (!ALPHA_VANTAGE_API_KEY) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Information) {
      throw new Error(`Alpha Vantage: ${data.Information}`);
    }

    const quote = data['Global Quote'];
    
    if (!quote || !quote['05. price']) {
      throw new Error('Invalid Alpha Vantage response format');
    }

    return {
      symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      companyName: quote['01. symbol'] || symbol
    };
  }

  private async fetchFinnhubQuote(symbol: string): Promise<Stock> {
    if (!FINNHUB_API_KEY) {
      throw new Error('Finnhub API key not configured');
    }

    const [quoteResponse, profileResponse] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`)
    ]);

    if (!quoteResponse.ok) {
      throw new Error(`Finnhub quote API error: ${quoteResponse.status}`);
    }

    if (!profileResponse.ok) {
      throw new Error(`Finnhub profile API error: ${profileResponse.status}`);
    }

    const quote = await quoteResponse.json();
    const profile = await profileResponse.json();

    if (quote.error) {
      throw new Error(`Finnhub: ${quote.error}`);
    }

    if (!quote.c) {
      throw new Error('Invalid Finnhub response - no current price');
    }

    return {
      symbol,
      price: quote.c,
      change: quote.d || 0,
      changePercent: quote.dp || 0,
      companyName: profile.name || symbol
    };
  }

  async getMultipleQuotes(symbols: string[]): Promise<Stock[]> {
    const hasAlphaVantage = !!ALPHA_VANTAGE_API_KEY;
    const hasFinnhub = !!FINNHUB_API_KEY;


    if (!hasAlphaVantage && !hasFinnhub) {
      throw new Error('No API keys configured. Please add REACT_APP_ALPHA_VANTAGE_API_KEY or REACT_APP_FINNHUB_API_KEY to your environment.');
    }

    const fetchPromises = symbols.map(async (symbol) => {
      try {
        // Try Finnhub first if available (higher rate limit)
        if (hasFinnhub) {
          return await this.fetchFinnhubQuote(symbol);
        } else {
          return await this.fetchAlphaVantageQuote(symbol);
        }
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
        throw error;
      }
    });

    // If using Alpha Vantage, add delay between requests to respect rate limits
    if (hasAlphaVantage && !hasFinnhub) {
      const results: Stock[] = [];
      for (let i = 0; i < fetchPromises.length; i++) {
        if (i > 0) {
          // Wait 12 seconds between requests (5 calls per minute limit)
          await new Promise(resolve => setTimeout(resolve, 12000));
        }
        results.push(await fetchPromises[i]);
      }
      return results;
    }

    // For Finnhub, add delay between requests to avoid rate limiting
    if (hasFinnhub) {
      const results: Stock[] = [];
      for (let i = 0; i < fetchPromises.length; i++) {
        if (i > 0) {
          // Wait 1 second between requests to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        results.push(await fetchPromises[i]);
      }
      return results;
    }

    // For Alpha Vantage fallback, use concurrent requests (shouldn't reach here with both keys)
    return Promise.all(fetchPromises);
  }
}

export const stockApi = new StockAPI();