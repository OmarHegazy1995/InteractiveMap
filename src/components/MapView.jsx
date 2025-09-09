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
  const [isZoomedOnPlot, setIsZoomedOnPlot] = useState(false);

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

  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 0],
      zoom: 1.2,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addSource("satellite", {
        type: "raster",
        url: "mapbox://mapbox.satellite",
        tileSize: 256,
      });

      map.addLayer(
        {
          id: "satellite-layer",
          type: "raster",
          source: "satellite",
          layout: { visibility: "none" },
        },
        "waterway-label"
      );

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

    map.on("zoom", () => {
      if (isZoomedOnPlot) return;
      const zoom = map.getZoom();
      if (zoom >= 15) map.setLayoutProperty("satellite-layer", "visibility", "visible");
      else map.setLayoutProperty("satellite-layer", "visibility", "none");
    });
  }, [plots, isZoomedOnPlot]);

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

        const validCoords = coordsArray.flat().filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

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

          map.setLayoutProperty("satellite-layer", "visibility", "visible");
          setIsZoomedOnPlot(true);
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

        map.setLayoutProperty("satellite-layer", "visibility", "none");
        setIsZoomedOnPlot(false);
      }
    }
  }, [plots, selectedPlot, plotsLoaded, use3D]);

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

  const resetNorth = () => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({ bearing: 0, pitch: 0, duration: 1000 });
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />

      {/* أيقونات التكبير والتصغير في إطار مربع والبوصلة مستقلة */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 z-10">
        {/* إطار مربع للتكبير والتصغير */}
        <div className="bg-gray-100 backdrop-blur-sm rounded-lg shadow-md flex flex-col border border-gray-200">
          <button
            onClick={() => mapRef.current && mapRef.current.zoomIn({ duration: 500 })}
            className="w-12 h-12 flex items-center justify-center text-gray-800 hover:text-blue-600 transition duration-200 border-b border-gray-200"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => mapRef.current && mapRef.current.zoomOut({ duration: 500 })}
            className="w-12 h-12 flex items-center justify-center text-gray-800 hover:text-blue-600 transition duration-200"
            title="Zoom Out"
          >
            -
          </button>
        </div>

        {/* أيقونة البوصلة */}
        <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200">
          <button
            onClick={resetNorth}
            className="w-12 h-12 flex items-center justify-center text-gray-800 hover:text-blue-600 transition duration-200"
            title="Reset North"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className="w-6 h-6"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
            >
              <circle cx="50" cy="50" r="48" />
              <polygon points="50,10 58,50 50,45 42,50" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      {selectedPlot && <LandInfoCard selectedLand={selectedPlot} />}
    </div>
  );
}
