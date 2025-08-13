'use client'

<<<<<<< HEAD
=======
import React from 'react';
>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

const rawData = [
  { value: 5 }, { value: 8 }, { value: 4 }, { value: 16 }, { value: 2 },
  { value: 20 }, { value: 1 }
];

// Add index to each data point
const data = rawData.map((item, index) => ({ ...item, index }));

<<<<<<< HEAD
const WaveChart = () => {
=======
const WaveChart = React.memo(() => {
>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1
  return (
    <div style={{ height: 250 }} className='w-full'>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="index" axisLine={{ stroke: '#dbeafe' }} />
          <YAxis axisLine={{ stroke: '#dbeafe' }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1e90ff"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
<<<<<<< HEAD
};
=======
});

WaveChart.displayName = 'WaveChart';
>>>>>>> dfe7477912a8dfb92f3a894db5409725529e61f1

export default WaveChart;