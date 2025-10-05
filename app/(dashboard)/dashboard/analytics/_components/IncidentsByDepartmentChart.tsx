// app/(dashboard)/dashboard/analytics/_components/IncidentsByDepartmentChart.tsx
"use client";

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

interface IncidentsByDepartmentChartProps {
  data: {
    name: string;
    count: number;
  }[];
}

export const IncidentsByDepartmentChart = ({ data }: IncidentsByDepartmentChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};
