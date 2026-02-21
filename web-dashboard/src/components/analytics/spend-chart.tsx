"use client";

import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";

interface SpendDataPoint {
    month: string;
    fuel: number;
    maintenance: number;
}

interface SpendChartProps {
    data: SpendDataPoint[];
}

export function SpendChart({ data }: SpendChartProps) {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="month"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.04)" }}
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)" }}
                    itemStyle={{ color: "#374151" }}
                    labelStyle={{ color: "#111827", fontWeight: 600, marginBottom: 4 }}
                />
                <Legend />
                <Bar dataKey="fuel" name="Fuel Cost" fill="#6366F1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maintenance" name="Maintenance" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
