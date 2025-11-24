import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RetentionPoint } from '../types';

interface RetentionChartProps {
  data: RetentionPoint[];
}

const RetentionChart: React.FC<RetentionChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="second" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" unit="%" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
            itemStyle={{ color: '#c4b5fd' }}
          />
          <Area 
            type="monotone" 
            dataKey="percentage" 
            stroke="#8b5cf6" 
            fillOpacity={1} 
            fill="url(#colorRetention)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RetentionChart;