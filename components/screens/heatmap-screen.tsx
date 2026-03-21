"use client";

import { useState } from "react";
import { useWeather } from "@/lib/weather-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { mockHeatmapData, vietnamCities } from "@/lib/mock-data";
import { Map, Thermometer, Droplets, Wind, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type MapType = "temperature" | "humidity" | "wind";

export function HeatmapScreen() {
  const { currentWeather } = useWeather();
  const [mapType, setMapType] = useState<MapType>("temperature");

  const mapTypes = [
    { id: "temperature" as const, label: "Nhiệt độ", icon: Thermometer },
    { id: "humidity" as const, label: "Độ ẩm", icon: Droplets },
    { id: "wind" as const, label: "Gió", icon: Wind },
  ];

  const getHeatColor = (value: number, type: MapType) => {
    if (type === "temperature") {
      if (value < 20) return "bg-blue-400";
      if (value < 25) return "bg-cyan-400";
      if (value < 28) return "bg-green-400";
      if (value < 30) return "bg-yellow-400";
      if (value < 32) return "bg-orange-400";
      return "bg-red-500";
    }
    if (type === "humidity") {
      if (value < 40) return "bg-yellow-300";
      if (value < 60) return "bg-green-400";
      if (value < 80) return "bg-blue-400";
      return "bg-blue-600";
    }
    // wind
    if (value < 10) return "bg-green-300";
    if (value < 20) return "bg-yellow-400";
    if (value < 30) return "bg-orange-400";
    return "bg-red-500";
  };

  const generateMockValue = (baseValue: number, type: MapType) => {
    const variance = Math.random() * 10 - 5;
    if (type === "temperature") return Math.round(baseValue + variance);
    if (type === "humidity") return Math.round(70 + variance * 2);
    return Math.round(12 + variance);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Bản đồ nhiệt</h1>
          <p className="text-sm text-muted-foreground">Xem phân bố thời tiết theo khu vực</p>
        </div>
      </div>

      {/* Map Type Selector */}
      <div className="flex gap-2">
        {mapTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setMapType(type.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl transition-all",
                mapType === type.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-accent"
              )}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Simplified Map Visualization */}
      <WeatherCard className="relative overflow-hidden">
        <WeatherCardHeader title="Bản đồ khu vực" icon={<Layers size={16} />} />
        
        {/* Vietnam Map Grid Visualization */}
        <div className="relative h-80 bg-gradient-to-b from-muted/30 to-muted/50 rounded-2xl overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 gap-1 p-2">
            {vietnamCities.slice(0, 10).map((city, index) => {
              const value = generateMockValue(currentWeather.temperature, mapType);
              return (
                <div
                  key={city.name}
                  className={cn(
                    "relative rounded-xl flex flex-col items-center justify-center p-2 transition-all hover:scale-105 cursor-pointer",
                    getHeatColor(value, mapType),
                    index === 0 && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  style={{
                    gridColumn: `span ${index === 0 || index === 1 ? 2 : 1}`,
                    gridRow: `span ${index < 2 ? 2 : 1}`,
                  }}
                >
                  <span className="text-xs font-medium text-white drop-shadow-md">
                    {city.name}
                  </span>
                  <span className="text-lg font-bold text-white drop-shadow-md">
                    {value}{mapType === "temperature" ? "°" : mapType === "humidity" ? "%" : " km/h"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">
            {mapType === "temperature" ? "Lạnh" : mapType === "humidity" ? "Khô" : "Nhẹ"}
          </span>
          <div className="flex gap-1">
            {mapType === "temperature" && (
              <>
                <span className="w-6 h-3 rounded bg-blue-400" />
                <span className="w-6 h-3 rounded bg-cyan-400" />
                <span className="w-6 h-3 rounded bg-green-400" />
                <span className="w-6 h-3 rounded bg-yellow-400" />
                <span className="w-6 h-3 rounded bg-orange-400" />
                <span className="w-6 h-3 rounded bg-red-500" />
              </>
            )}
            {mapType === "humidity" && (
              <>
                <span className="w-6 h-3 rounded bg-yellow-300" />
                <span className="w-6 h-3 rounded bg-green-400" />
                <span className="w-6 h-3 rounded bg-blue-400" />
                <span className="w-6 h-3 rounded bg-blue-600" />
              </>
            )}
            {mapType === "wind" && (
              <>
                <span className="w-6 h-3 rounded bg-green-300" />
                <span className="w-6 h-3 rounded bg-yellow-400" />
                <span className="w-6 h-3 rounded bg-orange-400" />
                <span className="w-6 h-3 rounded bg-red-500" />
              </>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {mapType === "temperature" ? "Nóng" : mapType === "humidity" ? "Ẩm" : "Mạnh"}
          </span>
        </div>
      </WeatherCard>

      {/* Regional Data */}
      <WeatherCard>
        <WeatherCardHeader title="Dữ liệu theo khu vực" />
        <div className="space-y-2">
          {mockHeatmapData.slice(0, 6).map((data, index) => {
            const value = mapType === "temperature" 
              ? data.value 
              : mapType === "humidity" 
                ? Math.round(65 + Math.random() * 20)
                : Math.round(8 + Math.random() * 15);
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    getHeatColor(value, mapType)
                  )} />
                  <span className="font-medium">{data.label}</span>
                </div>
                <span className="font-semibold">
                  {value}{mapType === "temperature" ? "°C" : mapType === "humidity" ? "%" : " km/h"}
                </span>
              </div>
            );
          })}
        </div>
      </WeatherCard>
    </div>
  );
}
