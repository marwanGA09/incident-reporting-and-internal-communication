// app/(dashboard)/(routes)/_components/IncidentsBarChart.tsx
"use client";

import { useState, useEffect } from "react";
import { getIncidentsPerDay } from "@/app/lib/actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

type Range = '7d' | '30d' | '365d';

interface IncidentData {
  date: string;
  count: number;
  month?: string;
}

export const IncidentsBarChart = () => {
  const [data, setData] = useState<IncidentData[]>([]);
  const [range, setRange] = useState<Range>('7d');

  useEffect(() => {
    const fetchData = async () => {
      const result = await getIncidentsPerDay(range);
      setData(result);
    };
    fetchData();
  }, [range]);

  const dataKey = range === '365d' ? 'month' : 'date';

  const formatTick = (tick: string) => {
    if (range === '365d') {
      return tick; // Already formatted as "Mon 'YY"
    }
    // For '7d' and '30d', the tick is 'YYYY-MM-DD'
    const [, month, day] = tick.split('-');
    return `${month}/${day}`;
  };

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <Button variant={range === '7d' ? 'default' : 'outline'} onClick={() => setRange('7d')}>Last 7 Days</Button>
        <Button variant={range === '30d' ? 'default' : 'outline'} onClick={() => setRange('30d')}>Last 30 Days</Button>
        <Button variant={range === '365d' ? 'default' : 'outline'} onClick={() => setRange('365d')}>Last Year</Button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={dataKey} tickFormatter={formatTick} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
