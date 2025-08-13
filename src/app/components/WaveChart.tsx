'use client'

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api/axios';

interface AttendanceData {
  date: string;
  hours: number;
}

interface WaveChartProps {
  userId: string;
}

const WaveChart: React.FC<WaveChartProps> = ({ userId }) => {
  const [data, setData] = useState<AttendanceData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/attendance/${userId}`);
        setData(res.data);
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  return (
    <div style={{ height: 250 }} className='w-full'>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" axisLine={{ stroke: '#dbeafe' }} />
          <YAxis axisLine={{ stroke: '#dbeafe' }} />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#1e90ff"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(WaveChart);
