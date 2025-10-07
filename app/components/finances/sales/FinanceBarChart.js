import React from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Checkbox, CheckboxGroup } from '@nextui-org/react';

const FinanceBarChart = ({ salesData, formatXAxis, yAxisDomains, selectedBars, setSelectedBars }) => {

  const handleBarChange = (values) => {
    // Ensure at least one checkbox is always selected
    if (values.length === 0) return;
    setSelectedBars(values);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="bg-white border border-gray-200 rounded-lg shadow-md p-3"
          style={{ minWidth: 160 }}
        >
          <p className="font-semibold text-gray-800 mb-2">Date: {label}</p>
          {payload.map((entry) => {
            // Assign main bar color for each entry
            let color = "#000";
            if (entry.name === "Total Orders") color = "#059669";
            else if (entry.name === "Total Revenue") color = "#0369a1";
            else if (entry.name === "Total Refunds") color = "#F43F5E";

            return (
              <div key={entry.name} className="flex items-center gap-2 mb-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: color }}
                ></span>
                <span className="text-sm font-medium" style={{ color: color }}>
                  {entry.name}:{" "}
                  {entry.name === "Total Revenue" || entry.name === "Total Refunds"
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
      <h2 className="text-lg md:text-xl font-bold text-gray-800 pl-16">Sales Performance Overview</h2>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData} margin={{ top: 25, right: 25, left: 15, bottom: 25 }}>
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
              tickFormatter={(v) => v.toLocaleString()}
              domain={yAxisDomains.left}
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `৳${v.toLocaleString()}`}
              domain={yAxisDomains.right}
              stroke="#9ca3af"
              fontSize={12}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Define Gradient Fills */}
            <defs>
              {/* Green Gradient - Total Orders */}
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={1} />  {/* emerald-400 */}
                <stop offset="100%" stopColor="#059669" stopOpacity={1} /> {/* emerald-700 */}
              </linearGradient>

              {/* Blue Gradient - Total Revenue */}
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />  {/* sky-400 */}
                <stop offset="100%" stopColor="#0369a1" stopOpacity={1} /> {/* sky-800 */}
              </linearGradient>

              {/* Pink Gradient - Total Refunds */}
              <linearGradient id="colorRefunds" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" stopOpacity={1} />  {/* rose-400 */}
                <stop offset="100%" stopColor="#be123c" stopOpacity={1} /> {/* rose-800 */}
              </linearGradient>
            </defs>

            {/* Bars with Gradient Fills */}
            {selectedBars.includes("Total Orders") && (
              <Bar
                yAxisId="left"
                dataKey="totalOrders"
                name="Total Orders"
                fill="url(#colorOrders)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            )}

            {selectedBars.includes("Total Revenue") && (
              <Bar
                yAxisId="right"
                dataKey="totalRevenue"
                name="Total Revenue"
                fill="url(#colorRevenue)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            )}

            {selectedBars.includes("Total Refunds") && (
              <Bar
                yAxisId="right"
                dataKey="totalRefund"
                name="Total Refunds"
                fill="url(#colorRefunds)"
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
          value={selectedBars}
          onChange={handleBarChange}
          orientation="horizontal"
          className="flex gap-4"
        >
          <Checkbox color="success" value="Total Orders" size='sm'>
            <span className="text-sm font-medium text-emerald-700">Total Orders</span>
          </Checkbox>
          <Checkbox color="primary" value="Total Revenue" size='sm'>
            <span className="text-sm font-medium text-[#0369a1]">Total Revenue</span>
          </Checkbox>
          <Checkbox color="danger" value="Total Refunds" size='sm'>
            <span className="text-sm font-medium text-[#be123c]">Total Refunds</span>
          </Checkbox>
        </CheckboxGroup>
      </div>
    </div>
  );
};

export default FinanceBarChart;