import React, { useState } from 'react';
import { Stock } from '../types/Stock';

interface StockTableProps {
  stocks: Stock[];
  loading: boolean;
  onRefresh: () => void;
}

type SortField = 'symbol' | 'price' | 'change' | 'changePercent';
type SortDirection = 'asc' | 'desc';

const StockTable: React.FC<StockTableProps> = ({ stocks, loading, onRefresh }) => {
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number) => `${change > 0 ? '+' : ''}${change.toFixed(2)}`;
  const formatChangePercent = (changePercent: number) => 
    `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%`;

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-gray-600"
    >
      <span>{children}</span>
      <span className="text-gray-400">
        {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Stocks</h3>
        <button
          onClick={onRefresh}
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

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="symbol">Symbol</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="price">Price</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="change">Change</SortButton>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortButton field="changePercent">Change %</SortButton>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedStocks.map((stock) => (
            <tr key={stock.symbol} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {stock.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {stock.companyName || stock.symbol}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatPrice(stock.price)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                stock.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatChange(stock.change)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatChangePercent(stock.changePercent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {stocks.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No stocks to display</p>
        </div>
      )}
    </div>
  );
};

export default StockTable;