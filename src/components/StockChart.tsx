import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Stock } from '../types/Stock';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StockChartProps {
  stocks: Stock[];
}

const StockChart: React.FC<StockChartProps> = ({ stocks }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stock Prices Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  const data = {
    labels: stocks.map(stock => stock.symbol),
    datasets: [
      {
        label: 'Current Price ($)',
        data: stocks.map(stock => stock.price),
        backgroundColor: stocks.map(stock => 
          stock.changePercent >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: stocks.map(stock => 
          stock.changePercent >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Bar data={data} options={options} />
    </div>
  );
};

export default StockChart;