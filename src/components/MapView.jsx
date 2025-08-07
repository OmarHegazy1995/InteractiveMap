import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// مكون لضبط الزوم حسب الحالة
function MapBounds({ plots, selectedPlot, currentNeighborhood }) {
  const map = useMap();

  useEffect(() => {
    if (selectedPlot) {
      // زوم على قطعة الأرض المختارة فقط مع padding مناسب
      const bounds = L.latLngBounds(selectedPlot.coordinates);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (currentNeighborhood && plots.length > 0) {
      // زوم على كل قطع الحي الحالي (الفلترة تمرر فقط قطع الحي)
      const allCoordinates = plots.flatMap((plot) => plot.coordinates);

      // حساب حدود الإحداثيات
      let bounds = L.latLngBounds(allCoordinates);

      // إضافة شرط: إذا كانت الحدود صغيرة (مساحة صغيرة)، نوسعها قليلاً لتجنب زوم كبير 
      const southWest = bounds.getSouthWest();
      const northEast = bounds.getNorthEast();

      const latDiff = Math.abs(northEast.lat - southWest.lat);
      const lngDiff = Math.abs(northEast.lng - southWest.lng);

      // لو الفرق صغير ، نزيد حدود اليدوياً (مثلاً 0.01 درجة)
      const minDiff = 0.01;
      if (latDiff < minDiff || lngDiff < minDiff) {
        const paddingLat = Math.max(minDiff - latDiff, 0);
        const paddingLng = Math.max(minDiff - lngDiff, 0);

        const newSouthWest = L.latLng(southWest.lat - paddingLat, southWest.lng - paddingLng);
        const newNorthEast = L.latLng(northEast.lat + paddingLat, northEast.lng + paddingLng);

        bounds = L.latLngBounds(newSouthWest, newNorthEast);
      }

      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (plots.length > 0) {
      // زوم على كل القطع المعروضة (الكل)
      const allCoordinates = plots.flatMap((plot) => plot.coordinates);
      const bounds = L.latLngBounds(allCoordinates);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [plots, selectedPlot, currentNeighborhood, map]);

  return null;
}

export default function MapView({
  plots,
  onSelectPlot,
  selectedPlot,
  currentNeighborhood,
}) {
  const center = [30.986, 41.038]; // مركز عرعر

  const handleMarkerClick = (plot) => {
    if (onSelectPlot) onSelectPlot(plot);
  };

  // إذا في قطعة مختارة، نعرضها فقط
  const visiblePlots = selectedPlot ? [selectedPlot] : plots;

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {visiblePlots.length === 0 && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-50 bg-white bg-opacity-70 text-gray-700 font-semibold">
            لا توجد قطع أراضي مطابقة للفلترة الحالية.
          </div>
        )}

        {visiblePlots.map((plot) => {
          const latlngs = plot.coordinates.map(([lat, lng]) => [lat, lng]);

          const color =
            plot.status === "مستثمر"
              ? "red"
              : plot.status === "تحت الإيجار"
              ? "orange"
              : "green";

          return (
            <Polygon
              key={plot.id}
              positions={latlngs}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: selectedPlot?.id === plot.id ? 0.6 : 0.3,
                weight: selectedPlot?.id === plot.id ? 4 : 2,
              }}
              eventHandlers={{
                click: () => handleMarkerClick(plot),
              }}
            >
              <Popup dir="rtl" onClose={() => onSelectPlot(null)}>
                <div className="text-sm font-medium">
                  <p>
                    <strong>الحي:</strong> {plot.neighborhood}
                  </p>
                  <p>
                    <strong>القطعة:</strong> {plot.number}
                  </p>
                  <p>
                    <strong>المساحة:</strong> {plot.area} م²
                  </p>
                  <p>
                    <strong>السعر:</strong>{" "}
                    {plot.price
                      ? plot.price.toLocaleString() + " ريال"
                      : "غير محدد"}
                  </p>
                  <p>
                    <strong>الحالة:</strong> {plot.status}
                  </p>
                  <p>
                    <strong>نوع المشروع:</strong> {plot.projectType}
                  </p>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        <MapBounds
          plots={plots}
          selectedPlot={selectedPlot}
          currentNeighborhood={currentNeighborhood}
        />
      </MapContainer>
    </div>
  );
}
