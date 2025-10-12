import React, { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Checkbox, CheckboxGroup } from '@nextui-org/react';

const Profitability = ({ salesData2, range, selectedBars2, setSelectedBars2 }) => {

  const handleBarChange = (values) => {
    // Ensure at least one checkbox is always selected
    if (values.length === 0) return;
    setSelectedBars2(values);
  };

  // Dynamic formatter: if daily → show hours, else show dates
  const formatXAxis = (value) => {
    if ((range === "today" || range === "yesterday") && !startDate && !endDate) {
      // value like "2025-09-09 13:00"
      return value.split(" ")[1]; // HH:00
    }
    // value like "2025-09-09"
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const yAxisDomain = useMemo(() => {
    if (!salesData2 || salesData2.length === 0) return [0, 'auto'];

    let values = [];
    salesData2.forEach(item => {
      if (selectedBars2.includes('Total Revenue')) values.push(item.totalRevenue ?? 0);
      if (selectedBars2.includes('COGS')) values.push(item.totalCOGS ?? 0);
      if (selectedBars2.includes('Expenses')) values.push(item.totalExpenses ?? 0);
    });

    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.2 || max * 0.2;
    return [Math.max(0, min - padding), max + padding];
  }, [salesData2, selectedBars2]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3"
          style={{ minWidth: 160 }}>
          <p className="font-semibold text-gray-800 mb-2">Date: {label}</p>
          {payload.map((entry) => {
            // Assign main bar color for each entry
            let color = "#000";
            if (entry.name === "Total Revenue") color = "#60A5FA";
            else if (entry.name === "COGS") color = "#5EEAD4";
            else if (entry.name === "Expenses") color = "#4B5563";

            return (
              <div key={entry.name} className="flex items-center gap-2 mb-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: color }}
                ></span>
                <span className="text-sm font-medium" style={{ color: color }}>
                  {entry.name}:{" "}
                  {entry.name === "Total Revenue" || entry.name === "Expenses"
                    ? `৳${entry.value.toLocaleString()}`
                    : entry.value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col w-full bg-white border border-gray-200 drop-shadow-sm rounded-2xl py-8 px-0">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 pl-16">Profitability</h2>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData2} margin={{ top: 25, right: 25, left: 15, bottom: 25 }}>
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              tickFormatter={(v) => `৳${v.toLocaleString()}`}
              domain={yAxisDomain}
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Define Gradient Fills */}
            <defs>
              {/* Total Revenue - Blue Gradient */}
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={1} /> {/* blue-400 */}
                <stop offset="100%" stopColor="#1E3A8A" stopOpacity={1} /> {/* blue-900 */}
              </linearGradient>

              {/* COGS - Akashi / Teal Gradient */}
              <linearGradient id="colorCogs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5EEAD4" stopOpacity={1} /> {/* teal-300 */}
                <stop offset="100%" stopColor="#0F766E" stopOpacity={1} /> {/* teal-800 */}
              </linearGradient>

              {/* Expenses - Ash / Gray Gradient */}
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D1D5DB" stopOpacity={1} /> {/* gray-300 */}
                <stop offset="100%" stopColor="#4B5563" stopOpacity={1} /> {/* gray-700 */}
              </linearGradient>
            </defs>

            {selectedBars2.includes("Total Revenue") && (
              <Bar
                yAxisId="left"
                dataKey="totalRevenue"
                name="Total Revenue"
                fill="url(#colorRevenue)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            )}

            {/* Bars with Gradient Fills */}
            {selectedBars2.includes("COGS") && (
              <Bar
                yAxisId="left"
                dataKey="totalCOGS"
                name="COGS"
                fill="url(#colorCogs)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            )}

            {selectedBars2.includes("Expenses") && (
              <Bar
                yAxisId="left"
                dataKey="totalExpenses"
                name="Expenses"
                fill="url(#colorExpenses)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            )}

          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Selection */}
      <div className="flex justify-center">
        <CheckboxGroup
          value={selectedBars2}
          onChange={handleBarChange}
          orientation="horizontal"
          className="flex gap-4"
        >
          <Checkbox color="primary" value="Total Revenue" size='sm'>
            <span className="text-sm font-medium text-blue-900">Total Revenue</span>
          </Checkbox>
          <Checkbox color="success" value="COGS" size='sm'>
            <span className="text-sm font-medium text-teal-800">COGS</span>
          </Checkbox>
          <Checkbox color="default" value="Expenses" size='sm'>
            <span className="text-sm font-medium text-[#4B5563]">Expenses</span>
          </Checkbox>
        </CheckboxGroup>
      </div>

    </div>
  );
};

export default Profitability;