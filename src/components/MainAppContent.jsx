import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FilterPanel from "./FilterPanel";
import MapView from "./MapView";
import LandInfoCard from "./LandInfoCard";
import QRScannerFallback from "./QRScanner";
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

export default function MainAppContent({ setScannedPlot }) {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    neighborhood: "",
    investmentStatus: "",
    projectType: "",
    minArea: "",
    maxArea: "",
  });

  const [selectedPlot, setSelectedPlot] = useState(null);
  const [allPlots, setAllPlots] = useState([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    fetch("/InteractiveMap/data/lands.geojson")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((geojson) => {
        if (!geojson.features) throw new Error("Invalid GeoJSON structure");
        const plots = geojson.features.map((feature) => {
          const props = feature.properties || {};
          let coords = [];
          if (feature.geometry) {
            if (feature.geometry.type === "Polygon") {
              coords = (feature.geometry.coordinates[0] || []).map(([lng, lat]) => [lat, lng]);
            } else if (feature.geometry.type === "MultiPolygon") {
              coords = ((feature.geometry.coordinates[0] && feature.geometry.coordinates[0][0]) || []).map(([lng, lat]) => [lat, lng]);
            }
          }
          if (!coords.length || coords.some(([lat, lng]) => isNaN(lat) || isNaN(lng))) {
            coords = [[30.986, 41.038]];
          }

          return {
            id: `${props.dis_nam || ""}-${props.ACTIV || ""}-${props.parcel_no || ""}`,
            neighborhood: props.dis_nam || "غير محدد",
            number: props.parcel_no || "غير محدد",
            planNumber: props.PLAN_NUM || "غير محدد",
            area: props.Shape_Area || 0,
            invested: props.rent === "مؤجر",
            status:
              props.rent === "مؤجر"
                ? "مستثمر"
                : props.rent === "قيد الطرح"
                ? "قيد الطرح"
                : "غير مستثمر",
            projectType: props.main_activ || "غير محدد",
            facilityType: props.ACTIV || "غير محدد",
            image: "/default-plot-image.jpg",
            coordinates: coords,
          };
        });
        setAllPlots(plots);
      })
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  const filteredPlots = useMemo(() => {
    if (!allPlots || !Array.isArray(allPlots)) return [];
    return allPlots.filter((plot) => {
      const matchesNeighborhood = !filters.neighborhood || (plot.neighborhood && plot.neighborhood.includes(filters.neighborhood));
      const matchesStatus = !filters.investmentStatus || plot.status === filters.investmentStatus;
      const matchesProjectType = !filters.projectType || plot.projectType === filters.projectType;
      const area = parseFloat(plot.area) || 0;
      const minArea = filters.minArea ? parseFloat(filters.minArea) : 0;
      const maxArea = filters.maxArea ? parseFloat(filters.maxArea) : Infinity;
      const matchesArea = area >= minArea && area <= maxArea;
      return matchesNeighborhood && matchesStatus && matchesProjectType && matchesArea;
    });
  }, [filters, allPlots]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSelectedPlot(null);
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

  const neighborhoods = useMemo(() => {
    if (!allPlots || !Array.isArray(allPlots)) return [];
    return [...new Set(allPlots.map((p) => p.neighborhood || "غير محدد"))];
  }, [allPlots]);

  const selectedNeighborhoodPlots = useMemo(() => {
    if (!allPlots || !Array.isArray(allPlots)) return [];
    return filters.neighborhood
      ? allPlots.filter((p) => p.neighborhood === filters.neighborhood)
      : [];
  }, [filters.neighborhood, allPlots]);

  const investmentStatusCounts = useMemo(() => {
    const counts = { مستثمر: 0, "غير مستثمر": 0, "قيد الطرح": 0 };
    selectedNeighborhoodPlots.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return [
      { name: "مستثمر", value: counts["مستثمر"], percentage: total ? ((counts["مستثمر"] / total) * 100).toFixed(1) : 0 },
      { name: "غير مستثمر", value: counts["غير مستثمر"], percentage: total ? ((counts["غير مستثمر"] / total) * 100).toFixed(1) : 0 },
      { name: "قيد الطرح", value: counts["قيد الطرح"], percentage: total ? ((counts["قيد الطرح"] / total) * 100).toFixed(1) : 0 },
    ];
  }, [selectedNeighborhoodPlots]);

  const barChartData = useMemo(() => {
    const stats = { مصنع: 0, مستودع: 0, ورشة: 0 };
    selectedNeighborhoodPlots.forEach((plot) => {
      if (plot.facilityType in stats) stats[plot.facilityType]++;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [selectedNeighborhoodPlots]);

  const COLORS = { مستثمر: "#EF4444", "غير مستثمر": "#22C55E", "قيد الطرح": "#FACC15" };
  const barColors = { مصنع: "#22C55E", ورشة: "#FACC15", مستودع: "#3B82F6" };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="bold">
        {investmentStatusCounts[index]?.percentage || 0}%
      </text>
    );
  };

  const handleScan = (scannedNumber) => {
    const foundPlot = allPlots.find((p) => p.number === scannedNumber);
    if (foundPlot) {
      setScannedPlot(foundPlot);
      navigate("/scanned-plot");
    } else {
      alert("لم يتم العثور على قطعة أرض بهذا الرقم");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar مع الفلتر */}
      <div className="w-full bg-green-900 h-12 sm:h-14 flex items-center px-2 sm:px-4 gap-2 sm:gap-4 relative">
        <img src="/InteractiveMap/2.png" alt="شعار أمانة" className="h-6 sm:h-10 object-contain" />
        
        <button
          className="sm:hidden ml-auto text-white text-xl"
          onClick={() => setShowMobileFilter(!showMobileFilter)}
        >
          ☰
        </button>

        <div className="hidden sm:flex flex-1">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            neighborhoods={neighborhoods}
            horizontal
          />
        </div>

        {showMobileFilter && (
          <div className="fixed top-12 left-0 w-full bg-green-800 z-[999999] p-2 sm:hidden">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              neighborhoods={neighborhoods}
              horizontal={false}
            />
         
          </div>
        )}
      </div>

      {/* QR Scanner */}
      <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-[9999]">
        <QRScannerFallback onScan={handleScan} />
      </div>

      {/* الخريطة */}
      <div className="flex-1 relative">
        <div className="h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]">
          <MapView
            plots={filteredPlots.length ? filteredPlots : allPlots}
            onSelect
            onSelectPlot={setSelectedPlot}
            selectedPlot={selectedPlot}
            use3D
            animated
          />
        </div>

    {/* كرت بيانات قطعة الأرض */}
{selectedPlot && (
  <>
    {/* نسخة الديسكتوب: ثابت */}
    <div className="hidden sm:flex sm:justify-end sm:items-end sm:fixed sm:bottom-4 sm:right-4 z-[1000]">
      <div className="w-[320px] sm:max-w-md">
        <LandInfoCard selectedLand={selectedPlot} />
      </div>
    </div>

    {/* نسخة الموبايل: بعد الخريطة مباشرة */}
    <div className="flex sm:hidden justify-center w-full mt-2">
      <div className="w-full px-2">
        <LandInfoCard selectedLand={selectedPlot} />
      </div>
    </div>
  </>
)}



      </div>

      {/* الرسوم البيانية */}
      {filters.neighborhood && !selectedPlot && (
        <div className="w-full border-t border-gray-200 bg-gray-50 px-2 sm:px-4 py-4 flex justify-center">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 bg-white rounded-xl p-2 sm:p-3 shadow-inner w-full max-w-full sm:max-w-5xl overflow-x-auto">
            {/* رسم شريطي */}
            <div className="w-full md:w-1/2 min-w-[250px]">
              <h3 className="text-center font-semibold mb-1 text-sm sm:text-base">توزيع أنواع المشاريع</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={barChartData || []}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 10]} allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {(barChartData || []).map((entry, index) => (
                      <Cell key={`cell-bar-${index}`} fill={barColors[entry.name] || "#8884d8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* رسم دائري */}
            <div className="w-full md:w-1/2 min-w-[250px] flex flex-col items-center mt-4 md:mt-0">
              <h3 className="text-center font-semibold mb-1 text-sm sm:text-base">حالة الاستثمار</h3>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={investmentStatusCounts || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {(investmentStatusCounts || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex justify-center mt-2 gap-2 flex-wrap text-xs sm:text-sm">
                {(investmentStatusCounts || []).map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1 sm:gap-2">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                      style={{ backgroundColor: COLORS[entry.name] || "#ccc" }}
                    ></div>
                    <span>{entry.name} ({entry.value || 0})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
