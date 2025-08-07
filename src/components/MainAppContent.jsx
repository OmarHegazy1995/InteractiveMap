import React, { useState, useMemo , forwardRef } from "react";
import FilterPanel from "./FilterPanel";
import MapView from "./MapView";
import LandInfoCard from "./LandInfoCard";
import { data } from "../data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function MainAppContent() {
  const [filters, setFilters] = useState({
    neighborhood: "",
    investmentStatus: "",
    projectType: "",
    minArea: "",
    maxArea: "",
  });

  const [selectedPlot, setSelectedPlot] = useState(null);

  const allPlots = useMemo(() => {
    let plots = [];
    data.districts.forEach((district) => {
      district.streets.forEach((street) => {
        street.plots.forEach((plot) => {
          plots.push({
            ...plot,
            neighborhood: district.name,
            status: plot.invested
              ? "مستثمر"
              : plot.status === "قيد الطرح"
              ? "قيد الطرح"
              : "غير مستثمر",
            projectType: plot.projectType || "",
            facilityType: plot.facilityType || "",
            id: `${district.name}-${street.name}-${plot.number}`,
            image: plot.image || "/default-plot-image.jpg",
          });
        });
      });
    });
    return plots;
  }, []);

  const filteredPlots = useMemo(() => {
    return allPlots.filter((plot) => {
      const matchesNeighborhood =
        filters.neighborhood === "" ||
        plot.neighborhood.includes(filters.neighborhood);

      const matchesStatus =
        filters.investmentStatus === "" ||
        plot.status === filters.investmentStatus;

      const matchesProjectType =
        filters.projectType === "" || plot.projectType === filters.projectType;

      const area = parseFloat(plot.area);
      const minArea = filters.minArea ? parseFloat(filters.minArea) : 0;
      const maxArea = filters.maxArea ? parseFloat(filters.maxArea) : Infinity;
      const matchesArea = area >= minArea && area <= maxArea;

      return (
        matchesNeighborhood &&
        matchesStatus &&
        matchesProjectType &&
        matchesArea
      );
    });
  }, [filters, allPlots]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      neighborhood: "",
      investmentStatus: "",
      projectType: "",
      minArea: "",
      maxArea: "",
    });
    setSelectedPlot(null);
  };

  const neighborhoods = useMemo(() => data.districts.map((d) => d.name), []);

  const selectedNeighborhoodPlots = useMemo(() => {
    return filters.neighborhood
      ? allPlots.filter((p) => p.neighborhood === filters.neighborhood)
      : [];
  }, [filters.neighborhood, allPlots]);

  const investmentStatusCounts = useMemo(() => {
    let counts = {
      مستثمر: 0,
      "غير مستثمر": 0,
      "قيد الطرح": 0,
    };
    selectedNeighborhoodPlots.forEach((p) => {
      if (p.status === "مستثمر") counts["مستثمر"]++;
      else if (p.status === "قيد الطرح") counts["قيد الطرح"]++;
      else counts["غير مستثمر"]++;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return [
      {
        name: "مستثمر",
        value: counts["مستثمر"],
        percentage: total ? ((counts["مستثمر"] / total) * 100).toFixed(1) : 0,
      },
      {
        name: "غير مستثمر",
        value: counts["غير مستثمر"],
        percentage: total
          ? ((counts["غير مستثمر"] / total) * 100).toFixed(1)
          : 0,
      },
      {
        name: "قيد الطرح",
        value: counts["قيد الطرح"],
        percentage: total
          ? ((counts["قيد الطرح"] / total) * 100).toFixed(1)
          : 0,
      },
    ];
  }, [selectedNeighborhoodPlots]);

  const barChartData = useMemo(() => {
    let stats = { مصنع: 0, مستودع: 0, ورشة: 0 };
    selectedNeighborhoodPlots.forEach((plot) => {
      if (plot.facilityType === "مصنع") stats["مصنع"]++;
      if (plot.facilityType === "مستودع") stats["مستودع"]++;
      if (plot.facilityType === "ورشة") stats["ورشة"]++;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [selectedNeighborhoodPlots]);

  const COLORS = {
    مستثمر: "#EF4444",
    "غير مستثمر": "#22C55E",
    "قيد الطرح": "#FACC15",
  };

  const barColors = {
    مصنع: "#22C55E",
    ورشة: "#FACC15",
    مستودع: "#3B82F6",
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="13"
        fontWeight="bold"
      >
        {investmentStatusCounts[index].percentage}%
      </text>
    );
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-2 sm:p-4 flex flex-col gap-4 lg:gap-6"
      style={{ height: "100vh", minHeight: "100vh" }}
    >
      <div
        className="flex flex-col gap-4 lg:flex-row lg:gap-6 flex-grow"
        style={{ minHeight: 0 }}
      >
        {/* الفلتر مع كرت بيانات قطعة الأرض أسفل الفلتر */}
        <aside
          className="w-full sm:w-full md:w-full lg:w-80 bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-300 overflow-visible max-h-full order-1 lg:order-1 flex flex-col"
          style={{ gap: "1rem" }}
        >
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            neighborhoods={neighborhoods}
          />

          {/* كرت بيانات قطعة الأرض هنا داخل نفس إطار الفلتر في الشاشات الكبيرة */}
          <div className="hidden lg:block mt-4">
            {selectedPlot && (
              <LandInfoCard selectedLand={selectedPlot} isInsideFilter />
            )}
          </div>
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="flex-1 flex flex-col rounded-xl border border-gray-300 shadow-lg bg-white overflow-visible min-h-0 order-2 lg:order-2">
          <section
            className="flex-grow min-h-[300px] sm:min-h-[400px] lg:min-h-0"
            style={{ position: "relative" }}
          >
            <MapView
              plots={filteredPlots}
              onSelectPlot={setSelectedPlot}
              selectedPlot={selectedPlot}
              currentNeighborhood={filters.neighborhood}
            />
          </section>

          {/* كرت بيانات قطعة الأرض أسفل الخريطة في الشاشات الصغيرة  */}
          <div className="lg:hidden">
            {selectedPlot && (
              <LandInfoCard selectedLand={selectedPlot} isBelowMap />
            )}
          </div>

          {filters.neighborhood && (
            <div className="w-full border-t border-gray-200 bg-gray-50 px-2 sm:px-4 py-4 flex justify-center">
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4 bg-white rounded-xl p-3 shadow-inner w-full max-w-5xl overflow-visible">
                {selectedPlot ? (
                  <div className="flex flex-row-reverse items-start gap-3 w-full flex-wrap sm:flex-nowrap">
                    <img
                      src={selectedPlot.image}
                      alt={`صورة قطعة الأرض رقم ${selectedPlot.number}`}
                      className="w-full sm:w-1/4 rounded-lg object-cover max-h-36 sm:max-h-32"
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                    <div className="flex flex-wrap gap-2 w-full sm:w-3/4">
                      {[
                        {
                          label: "رقم القطعة",
                          value: selectedPlot.number,
                          bgColor: "#3B82F6",
                        },
                        {
                          label: "الحي",
                          value: selectedPlot.neighborhood,
                          bgColor: "#10B981",
                        },
                        {
                          label: "المساحة",
                          value: `${selectedPlot.area} متر مربع`,
                          bgColor: "#F59E0B",
                        },
                        {
                          label: "حالة الاستثمار",
                          value: selectedPlot.status,
                          bgColor: "#EF4444",
                        },
                        {
                          label: "نوع المشروع",
                          value: selectedPlot.projectType || "غير محدد",
                          bgColor: "#8B5CF6",
                        },
                        {
                          label: "نوع المنشأة",
                          value: selectedPlot.facilityType || "غير محدد",
                          bgColor: "#0EA5E9",
                        },
                        {
                          label: "السعر",
                          value: `${selectedPlot.price?.toLocaleString(
                            "ar-EG"
                          )} ريال`,
                          bgColor: "#FACC15",
                        },
                      ].map(({ label, value, bgColor }) => (
                        <div
                          key={label}
                          className="flex flex-col rounded-md p-2 w-[47%] sm:w-[30%]"
                          style={{
                            minWidth: "140px",
                            backgroundColor: bgColor,
                            color: "white",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                        >
                          <span className="text-xs mb-0.5 font-semibold">
                            {label}
                          </span>
                          <span className="font-semibold text-sm">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-full md:w-1/2">
                      <h3 className="text-center font-semibold mb-2">
                        توزيع أنواع المشاريع
                      </h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={barChartData}>
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 10]} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {barChartData.map((entry, index) => (
                              <Cell
                                key={`cell-bar-${index}`}
                                fill={barColors[entry.name] || "#8884d8"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>

                      <div className="flex justify-center gap-4 mt-3 flex-wrap">
                        {barChartData.map((entry) => (
                          <div
                            key={entry.name}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: barColors[entry.name] }}
                            ></div>
                            <span>
                              {entry.name} ({entry.value})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col items-center mt-6 md:mt-0">
                      <h3 className="text-center font-semibold mb-2">
                        حالة الاستثمار
                      </h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={investmentStatusCounts}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            label={renderCustomizedLabel}
                            labelLine={false}
                          >
                            {investmentStatusCounts.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[entry.name]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="flex justify-center mt-4 gap-4 flex-wrap">
                        {investmentStatusCounts.map((entry) => (
                          <div
                            key={entry.name}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: COLORS[entry.name] }}
                            ></div>
                            <span>
                              {entry.name} ({entry.value})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* اللوغوهات - تظهر بعد المحتوى في الشاشات الصغيرة فقط */}
          <div className="mt-4 w-full bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-300 flex flex-wrap justify-center gap-6 block lg:hidden">
            <img
              src="2.png"
              alt="شعار أمانة"
              className="h-12 sm:h-14 object-contain"
            />
            <img
              src="5.png"
              alt="شعار الاستشاري"
              className="h-12 sm:h-14 object-contain"
            />
            <img
              src="1.png"
              alt="شعار رواية"
              className="h-12 sm:h-14 object-contain"
            />
            <img
              src="3.png"
              alt="شعار وزارة الإسكان"
              className="h-12 sm:h-14 object-contain"
            />
            <img
              src="4.png"
              alt="شعار فرصة"
              className="h-12 sm:h-14 object-contain"
            />
          </div>
        </main>

        {/* اللوجوهات الجانبية تظهر فقط في الشاشات الكبيرة */}
        <aside className="w-full lg:w-52 bg-white p-3 sm:p-4 rounded-xl shadow-md border border-gray-300 flex flex-col items-center justify-center overflow-visible max-h-full hidden lg:flex order-3">
          <img
            src="2.png"
            alt="شعار أمانة"
            className="h-12 sm:h-14 object-contain mb-5 mt-5"
          />
          <img
            src="5.png"
            alt="شعار الاستشاري"
            className="h-12 sm:h-14 object-contain mb-5 "
          />
          <img
            src="1.png"
            alt="شعار رواية"
            className="h-12 sm:h-14 object-contain mb-5 mt-5"
          />
          <img
            src="3.png"
            alt="شعار وزارة الإسكان"
            className="h-12 sm:h-14 object-contain mb-5 mt-5"
          />
          <img
            src="4.png"
            alt="شعار فرصة"
            className="h-12 sm:h-14 object-contain mb-5 mt-5"
          />
        </aside>
      </div>
    </div>
  );
}
