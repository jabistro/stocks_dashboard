import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Loading stock data...</p>
          <p className="text-sm text-gray-500">This may take a few seconds</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;