import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import LandInfoCard from "./LandInfoCard";

mapboxgl.accessToken =
  "pk.eyJ1Ijoib21hci1oZWdhenkxMjMiLCJhIjoiY21mMHV1OTIyMGtxNjJrc2Jrc3ptd3hyeSJ9.0DL-T3mWdUhrcfOaRKenNA";

export default function MapView({ plots, onSelectPlot, selectedPlot, use3D }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const geojsonRef = useRef(null);
  const [plotsLoaded, setPlotsLoaded] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [activeLayer, setActiveLayer] = useState(
    "mapbox://styles/mapbox/streets-v12"
  );

  const layers = [
    {
      name: "Streets",
      style: "mapbox://styles/mapbox/streets-v12",
      img:
        "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/37.1,31.2,3/100x100?access_token=" +
        mapboxgl.accessToken,
    },
    {
      name: "Satellite",
      style: "mapbox://styles/mapbox/satellite-v9",
      img:
        "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/37.1,31.2,3/100x100?access_token=" +
        mapboxgl.accessToken,
    },
    {
      name: "Dark",
      style: "mapbox://styles/mapbox/dark-v10",
      img:
        "https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/37.1,31.2,3/100x100?access_token=" +
        mapboxgl.accessToken,
    },
    {
      name: "Light",
      style: "mapbox://styles/mapbox/light-v10",
      img:
        "https://api.mapbox.com/styles/v1/mapbox/light-v10/static/37.1,31.2,3/100x100?access_token=" +
        mapboxgl.accessToken,
    },
    {
      name: "Outdoors",
      style: "mapbox://styles/mapbox/outdoors-v12",
      img:
        "https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/37.1,31.2,3/100x100?access_token=" +
        mapboxgl.accessToken,
    },
  ];

  const addPlotsLayers = (map) => {
    if (!map.getSource("plots")) {
      map.addSource("plots", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    if (!map.getLayer("plots-fill")) {
      map.addLayer({
        id: "plots-fill",
        type: "fill-extrusion",
        source: "plots",
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": use3D ? ["get", "height"] : 0,
          "fill-extrusion-opacity": 0.6,
        },
      });
    }

    if (!map.getLayer("plots-outline")) {
      map.addLayer({
        id: "plots-outline",
        type: "line",
        source: "plots",
        paint: {
          "line-color": "#000",
          "line-width": 1,
        },
      });
    }

    if (geojsonRef.current && map.getSource("plots")) {
      map.getSource("plots").setData(geojsonRef.current);
    }
  };

  // إنشاء الخريطة
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: activeLayer,
      center: [0, 0],
      zoom: 1.2,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      addPlotsLayers(map);
      setPlotsLoaded(true);

      if (plots && plots.length) {
        const allCoords = plots
          .flatMap((p) => p.coordinates)
          .map((c) => (Array.isArray(c[0]) ? c : [c]))
          .flat()
          .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng))
          .map(([lat, lng]) => [lng, lat]);

        if (allCoords.length) {
          const bounds = allCoords.reduce(
            (b, coord) => b.extend(coord),
            new mapboxgl.LngLatBounds(allCoords[0], allCoords[0])
          );
          map.fitBounds(bounds, { padding: 40 });
        }
      }
    });
  }, [plots, activeLayer]);

  // تحديث البيانات وعرض قطعة الأرض المحددة
  useEffect(() => {
    if (!mapRef.current || !plotsLoaded || !plots) return;
    const map = mapRef.current;

    const geojson = {
      type: "FeatureCollection",
      features: plots.map((plot) => {
        const color =
          plot.status === "مستثمر"
            ? "red"
            : plot.status === "قيد الطرح"
            ? "orange"
            : "green";
        const height = selectedPlot?.id === plot.id ? 50 : 20;

        return {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [plot.coordinates.map(([lat, lng]) => [lng, lat])],
          },
          properties: { ...plot, color, height },
        };
      }),
    };

    geojsonRef.current = geojson;

    if (map.getSource("plots")) map.getSource("plots").setData(geojson);

    if (selectedPlot && selectedPlot.coordinates.length > 0) {
      try {
        const coordsArray = Array.isArray(selectedPlot.coordinates[0][0])
          ? selectedPlot.coordinates
          : [selectedPlot.coordinates];

        const validCoords = coordsArray
          .flat()
          .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

        if (validCoords.length) {
          const lats = validCoords.map(([lat]) => lat);
          const lngs = validCoords.map(([, lng]) => lng);
          const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
          const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

          map.easeTo({
            center: [centerLng, centerLat],
            zoom: 18,
            duration: 1200,
          });
        }
      } catch (err) {
        console.error("Invalid coordinates for selected plot:", err);
      }
    } else {
      const allCoords = plots
        .flatMap((p) => p.coordinates)
        .map((c) => (Array.isArray(c[0]) ? c : [c]))
        .flat()
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng))
        .map(([lat, lng]) => [lng, lat]);

      if (allCoords.length) {
        const bounds = allCoords.reduce(
          (b, coord) => b.extend(coord),
          new mapboxgl.LngLatBounds(allCoords[0], allCoords[0])
        );
        map.fitBounds(bounds, { padding: 40 });
      }
    }
  }, [plots, selectedPlot, plotsLoaded, use3D]);

  // التعامل مع الضغط على قطعة الأرض
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const handleClick = (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ["plots-fill"] });
      if (features.length) {
        const clickedId = features[0].properties.id;
        const plot = plots.find((p) => p.id === clickedId);
        if (plot) onSelectPlot && onSelectPlot(plot);
      }
    };

    map.on("click", handleClick);
    return () => map.off("click", handleClick);
  }, [onSelectPlot, plots]);

  // تعديل الطبقة تلقائيًا عند الزوم بشكل ديناميكي
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const originalLayer = "mapbox://styles/mapbox/streets-v12";
    const satelliteLayer = "mapbox://styles/mapbox/satellite-v9";

    const handleZoom = () => {
      const zoom = map.getZoom();

      if (zoom > 16 && activeLayer !== satelliteLayer) {
        setActiveLayer(satelliteLayer);
        map.setStyle(satelliteLayer);
        map.once("style.load", () => addPlotsLayers(map));
      } else if (zoom <= 16 && activeLayer !== originalLayer) {
        setActiveLayer(originalLayer);
        map.setStyle(originalLayer);
        map.once("style.load", () => addPlotsLayers(map));
      }
    };

    map.on("zoom", handleZoom);
    return () => map.off("zoom", handleZoom);
  }, [activeLayer]);

  const resetNorth = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({ bearing: 0, pitch: 0, duration: 1000 });
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
      {/* الخريطة */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* أدوات التحكم */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 z-10">
        <div className="bg-gray-100 backdrop-blur-sm rounded-lg shadow-md flex flex-col border border-gray-200">
          <button
            onClick={() => mapRef.current && mapRef.current.zoomIn({ duration: 500 })}
            className="w-12 h-12 flex items-center justify-center border-b border-gray-200"
          >
            +
          </button>
          <button
            onClick={() => mapRef.current && mapRef.current.zoomOut({ duration: 500 })}
            className="w-12 h-12 flex items-center justify-center"
          >
            -
          </button>
        </div>
        <div>
          <button onClick={resetNorth} className="w-12 h-12 flex items-center justify-center text-5xl ">
            🧭
          </button>
        </div>
      </div>

      {/* زر الطبقات */}
      <div className="absolute bottom-7 left-4 z-10 flex items-center gap-2 flex-col md:flex-row">
        <div className="bg-white/90 backdrop-blur-sm rounded-md shadow-xl border-2 border-gray-600 overflow-hidden w-24 h-24 relative">
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="w-full h-full flex flex-col items-center justify-center p-0 relative"
          >
            <img
              src={layers.find(layer => layer.style === activeLayer)?.img}
              alt="الخريطة الحالية"
              className="w-full h-full object-cover rounded-md"
            />
            <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" stroke="none" className="w-10 h-10 drop-shadow-lg">
                <path d="M4 6l8-3 8 3M4 12l8-3 8 3M4 18l8-3 8 3" />
              </svg>
              <span className="text-sm font-semibold text-white mt-1 drop-shadow-md">Maps</span>
            </div>
          </button>
        </div>
        {showLayers && (
          <div className="absolute md:bottom-0 md:left-28 bottom-full mb-2 flex md:flex-row flex-col gap-2 bg-white/90 backdrop-blur-md rounded-lg shadow-2xl border border-gray-300 p-2">
            {layers.map((layer, i) => (
              <button
                key={i}
                className={`flex flex-col items-center p-1 rounded transition-all duration-200 transform hover:scale-105 ${
                  activeLayer === layer.style ? "bg-blue-50 ring-2 ring-blue-500" : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  setActiveLayer(layer.style);
                  mapRef.current.setStyle(layer.style);
                  mapRef.current.on("style.load", () => addPlotsLayers(mapRef.current));
                  setShowLayers(false);
                }}
              >
                <div className="w-14 h-14 rounded overflow-hidden border border-gray-300">
                  <img src={layer.img} alt={layer.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-medium text-gray-700 mt-1">{layer.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
