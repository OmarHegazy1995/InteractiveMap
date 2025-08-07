import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";

const barColors = {
  factories: "#3B82F6",
  warehouses: "#F59E0B",
  workshops: "#10B981",
};

const pieColors = {
  مستثمر: "#EF4444",
  "غير مستثمر": "#22C55E",
  "قيد الطرح": "#EAB308",
};

export default function DistrictAnalytics({ districtData }) {
  if (!districtData) return null;

  const { factories, warehouses, workshops, investmentStatus } = districtData;

  const barData = [
    { name: "المصانع", value: factories },
    { name: "المستودعات", value: warehouses },
    { name: "الورش", value: workshops },
  ];

  const pieData = Object.keys(investmentStatus).map((key) => ({
    name: key,
    value: investmentStatus[key],
  }));

  return (
    <div className="mt-4 p-4 bg-white border border-gray-300 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-700">تحليلات الحي</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div>
          <h3 className="text-md font-semibold mb-2 text-gray-600">عدد الأنشطة</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                <Cell fill={barColors.factories} />
                <Cell fill={barColors.warehouses} />
                <Cell fill={barColors.workshops} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-600">حالة الاستثمار</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={pieColors[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
