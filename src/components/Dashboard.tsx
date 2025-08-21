import React, { useState, useEffect, useCallback } from 'react';
import { Stock } from '../types/Stock';
import { stockApi } from '../services/finnhubApi';
import StockTable from './StockTable';
import SearchBar from './SearchBar';
import LoadingSpinner from './LoadingSpinner';
import StockChart from './StockChart';

const Dashboard: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const isMarketOpen = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    
    // Market is closed on weekends
    if (day === 0 || day === 6) return false;
    
    // Market hours: 9:30 AM - 4:00 PM EST (assuming EST/EDT)
    const marketOpen = 9.5; // 9:30 AM
    const marketClose = 16; // 4:00 PM
    
    return hour >= marketOpen && hour < marketClose;
  };

  const fetchStockData = useCallback(async () => {
    const defaultSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
    
    try {
      setError(null);
      setLoading(true);
      
      const stockData = await stockApi.getMultipleQuotes(defaultSymbols);
      setStocks(stockData);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching stock data:', err);
      setError(err.message || 'Failed to fetch stock data');
      setStocks([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 30000);
    return () => clearInterval(interval);
  }, [fetchStockData]);

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && stocks.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Market Overview</h2>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Live data via stock APIs • Market {isMarketOpen() ? '🟢 Open' : '🔴 Closed'}
            {!isMarketOpen() && ' (Prices from last trading day)'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chart
            </button>
          </div>
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex flex-col space-y-3">
            <div className="text-sm text-red-700 font-medium">{error}</div>
            {error.includes('API key') && (
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">To get real stock data, you need a free API key:</p>
                <div className="space-y-2">
                  <div>
                    <strong>Option 1 - Finnhub (Recommended):</strong>
                    <ol className="list-decimal list-inside ml-2 space-y-1">
                      <li>Get free API key from <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Finnhub.io</a></li>
                      <li>Create a <code className="bg-gray-100 px-1 rounded">.env</code> file in your project root</li>
                      <li>Add: <code className="bg-gray-100 px-1 rounded">REACT_APP_FINNHUB_API_KEY=your_key_here</code></li>
                      <li>Restart the development server</li>
                    </ol>
                  </div>
                  <div>
                    <strong>Option 2 - Alpha Vantage:</strong>
                    <ol className="list-decimal list-inside ml-2 space-y-1">
                      <li>Get free API key from <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Alpha Vantage</a></li>
                      <li>Add: <code className="bg-gray-100 px-1 rounded">REACT_APP_ALPHA_VANTAGE_API_KEY=your_key_here</code></li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'table' ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <StockTable 
            stocks={filteredStocks} 
            loading={loading}
            onRefresh={fetchStockData}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={fetchStockData}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg 
                className={`-ml-1 mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <StockChart stocks={filteredStocks} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;