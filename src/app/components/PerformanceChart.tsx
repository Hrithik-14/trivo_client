"use client";

import { useEffect, useState } from "react";
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import api from "../api/axios";

ChartJS.register(ArcElement, Tooltip, Legend);

const PerformanceChart = () => {
  const [chartData, setChartData] = useState({
    labels: ['Productive', 'Unproductive'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#AEBE8C', '#7D876F'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  });

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.get('/overall-performance'); // your backend route
        const { totalEffectiveHours, totalHours } = res.data;

        setChartData({
          labels: ['Productive', 'Unproductive'],
          datasets: [
            {
              data: [totalEffectiveHours, totalHours - totalEffectiveHours],
              backgroundColor: ['#AEBE8C', '#7D876F'],
              borderWidth: 0,
              cutout: '70%',
            },
          ],
        });
      } catch (err) {
        console.error("Error fetching performance data:", err);
      }
    };

    fetchPerformance();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
      <Doughnut data={chartData} options={options} />
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
        Effective Hours
      </div>
    </div>
  );
};

export default PerformanceChart;
