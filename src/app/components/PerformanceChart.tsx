"use client"

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PerformanceChart = () => {
  const data = {
    labels: ['Productivity', 'unproductivity'],
    datasets: [
      {
        data: [85, 15],
        backgroundColor: ['#AEBE8C', '#7D876F'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div style={{ position: 'relative', width: 250, height: 250 }} >
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#ccc',
        fontSize: '14px',
        fontWeight: 'bold',
        letterSpacing: '2px'
      }}>
        Employees
      </div>
    </div>
  );
};

export default PerformanceChart;