"use client";

import { TimelineEvent } from "@/lib/types";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TimelineChartProps {
  events: TimelineEvent[];
}

const circleRenderer = (props: any) => {
  const { cx, cy, payload } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={20} fill="#06b6d4" stroke="#000" strokeWidth={2} />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#000" fontSize={14} fontWeight={600}>
        {payload.value}
      </text>
    </g>
  );
};

export default function TimelineChart({ events }: TimelineChartProps) {
  const seriesData = events.reduce((acc, event) => {
    acc[event.observerId] = acc[event.observerId] || [];
    acc[event.observerId].push(event);
    return acc;
  }, {} as { [key: string]: TimelineEvent[] });

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Timeline Graph</h3>
      <ResponsiveContainer width="100%" className={"flex-grow min-h-0"}>
        <ScatterChart margin={{ right: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" dataKey="timestamp" orientation="top" name="Time" unit="ms" stroke="#94a3b8" />
          <YAxis
            type="number"
            dataKey="y"
            reversed={true}
            domain={[0, Object.keys(seriesData).length + 1]}
            axisLine={false}
            tickLine={false}
            hide={false}
            stroke="#94a3b8"
            ticks={new Array(Object.keys(seriesData).length).fill(null).map((_, index) => index + 1)}
            tick={({ y, payload }) => {
              const series = Object.values(seriesData)[payload.value - 1]?.at(0)?.series;
              return (
                <text x={0} y={y} dy={5} textAnchor="start" fontSize={12} fill="#94a3b8">
                  {series}
                </text>
              );
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-slate-950 border border-slate-700 rounded-lg p-3 shadow-xl font-mono space-y-1">
                    <p className="text-xs text-slate-400">Time: {data.timestamp}ms</p>
                    <p className="text-xs text-cyan-500">Value: {typeof data.value === "object" ? JSON.stringify(data.value) : String(data.value)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          {Object.entries(seriesData).map(([observerId, events], seriesIndex) => {
            const mappedEvents = events?.map((event, index) => ({
              timestamp: event.timestamp,
              y: 1 + seriesIndex,
              value: event.value,
              series: event.series,
              index,
            }));
            return <Scatter key={observerId} data={mappedEvents} shape={circleRenderer} isAnimationActive={false} />;
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
