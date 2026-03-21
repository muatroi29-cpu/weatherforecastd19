"use client";

import { useState } from "react";
import { useWeather } from "@/lib/weather-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { popularLocations } from "@/lib/mock-data";
import { Map, Wind, Layers, AlertTriangle, Heart, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Dữ liệu AQI mẫu cho các khu vực
const aqiRegionData = [
  { name: "Quận Hoàn Kiếm", aqi: 85, pm25: 32, pm10: 45, o3: 28, no2: 18, so2: 8, co: 0.8 },
  { name: "Quận Ba Đình", aqi: 72, pm25: 28, pm10: 38, o3: 25, no2: 15, so2: 6, co: 0.6 },
  { name: "Quận Đống Đa", aqi: 95, pm25: 38, pm10: 52, o3: 32, no2: 22, so2: 10, co: 1.0 },
  { name: "Quận Hai Bà Trưng", aqi: 88, pm25: 35, pm10: 48, o3: 30, no2: 20, so2: 9, co: 0.9 },
  { name: "Quận Tây Hồ", aqi: 58, pm25: 22, pm10: 30, o3: 20, no2: 12, so2: 5, co: 0.4 },
  { name: "Quận Thanh Xuân", aqi: 102, pm25: 42, pm10: 58, o3: 35, no2: 25, so2: 12, co: 1.2 },
  { name: "Quận Cầu Giấy", aqi: 78, pm25: 30, pm10: 42, o3: 26, no2: 17, so2: 7, co: 0.7 },
  { name: "Quận Long Biên", aqi: 65, pm25: 25, pm10: 35, o3: 22, no2: 14, so2: 6, co: 0.5 },
  { name: "Quận Hà Đông", aqi: 115, pm25: 48, pm10: 65, o3: 38, no2: 28, so2: 14, co: 1.4 },
  { name: "Quận Nam Từ Liêm", aqi: 92, pm25: 36, pm10: 50, o3: 31, no2: 21, so2: 10, co: 1.0 },
  { name: "Quận Bắc Từ Liêm", aqi: 82, pm25: 32, pm10: 44, o3: 28, no2: 18, so2: 8, co: 0.8 },
  { name: "Quận Hoàng Mai", aqi: 108, pm25: 44, pm10: 60, o3: 36, no2: 26, so2: 13, co: 1.3 },
];

export function HeatmapScreen() {
  const { currentWeather } = useWeather();
  const [selectedRegion, setSelectedRegion] = useState<typeof aqiRegionData[0] | null>(null);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "bg-green-500";
    if (aqi <= 100) return "bg-yellow-500";
    if (aqi <= 150) return "bg-orange-500";
    if (aqi <= 200) return "bg-red-500";
    if (aqi <= 300) return "bg-purple-500";
    return "bg-rose-900";
  };

  const getAQITextColor = (aqi: number) => {
    if (aqi <= 50) return "text-green-600";
    if (aqi <= 100) return "text-yellow-600";
    if (aqi <= 150) return "text-orange-600";
    if (aqi <= 200) return "text-red-600";
    if (aqi <= 300) return "text-purple-600";
    return "text-rose-900";
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return "Tốt";
    if (aqi <= 100) return "Trung bình";
    if (aqi <= 150) return "Kém cho nhóm nhạy cảm";
    if (aqi <= 200) return "Kém";
    if (aqi <= 300) return "Rất kém";
    return "Nguy hại";
  };

  const getHealthAdvice = (aqi: number) => {
    if (aqi <= 50) return "Chất lượng không khí tốt, phù hợp cho mọi hoạt động ngoài trời.";
    if (aqi <= 100) return "Chất lượng không khí chấp nhận được. Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời kéo dài.";
    if (aqi <= 150) return "Nhóm nhạy cảm (trẻ em, người già, người có bệnh hô hấp) nên hạn chế ra ngoài.";
    if (aqi <= 200) return "Mọi người nên giảm hoạt động ngoài trời. Đeo khẩu trang khi ra ngoài.";
    if (aqi <= 300) return "Cảnh báo sức khỏe nghiêm trọng. Hạn chế tối đa ra ngoài.";
    return "Nguy hiểm! Tránh ra ngoài hoàn toàn. Đóng kín cửa sổ.";
  };

  // Sắp xếp theo AQI để hiển thị
  const sortedRegions = [...aqiRegionData].sort((a, b) => b.aqi - a.aqi);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Bản đồ chất lượng không khí</h1>
          <p className="text-sm text-muted-foreground">Theo dõi AQI theo khu vực</p>
        </div>
      </div>

      {/* AQI Map Visualization */}
      <WeatherCard className="relative overflow-hidden">
        <WeatherCardHeader title="Bản đồ AQI khu vực" icon={<Layers size={16} />} />
        
        {/* Grid Map Visualization */}
        <div className="relative h-72 bg-gradient-to-b from-muted/30 to-muted/50 rounded-2xl overflow-hidden p-2">
          <div className="grid grid-cols-4 grid-rows-3 gap-1.5 h-full">
            {aqiRegionData.map((region, index) => (
              <button
                key={region.name}
                onClick={() => setSelectedRegion(region)}
                className={cn(
                  "relative rounded-xl flex flex-col items-center justify-center p-2 transition-all hover:scale-105 cursor-pointer",
                  getAQIColor(region.aqi),
                  selectedRegion?.name === region.name && "ring-2 ring-white ring-offset-2 ring-offset-background"
                )}
              >
                <span className="text-[10px] font-medium text-white drop-shadow-md text-center leading-tight">
                  {region.name.replace("Quận ", "Q.")}
                </span>
                <span className="text-lg font-bold text-white drop-shadow-md">
                  {region.aqi}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Tốt</span>
          <div className="flex gap-1">
            <span className="w-6 h-3 rounded bg-green-500" />
            <span className="w-6 h-3 rounded bg-yellow-500" />
            <span className="w-6 h-3 rounded bg-orange-500" />
            <span className="w-6 h-3 rounded bg-red-500" />
            <span className="w-6 h-3 rounded bg-purple-500" />
            <span className="w-6 h-3 rounded bg-rose-900" />
          </div>
          <span className="text-xs text-muted-foreground">Nguy hại</span>
        </div>
      </WeatherCard>

      {/* Selected Region Details */}
      {selectedRegion && (
        <WeatherCard className="border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{selectedRegion.name}</h3>
              <p className={cn("text-sm font-medium", getAQITextColor(selectedRegion.aqi))}>
                {getAQILevel(selectedRegion.aqi)}
              </p>
            </div>
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl",
              getAQIColor(selectedRegion.aqi)
            )}>
              {selectedRegion.aqi}
            </div>
          </div>

          {/* Pollutant Details */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">PM2.5</p>
              <p className="font-bold text-lg">{selectedRegion.pm25}</p>
              <p className="text-[10px] text-muted-foreground">µg/m³</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">PM10</p>
              <p className="font-bold text-lg">{selectedRegion.pm10}</p>
              <p className="text-[10px] text-muted-foreground">µg/m³</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">O₃</p>
              <p className="font-bold text-lg">{selectedRegion.o3}</p>
              <p className="text-[10px] text-muted-foreground">ppb</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">NO₂</p>
              <p className="font-bold text-lg">{selectedRegion.no2}</p>
              <p className="text-[10px] text-muted-foreground">ppb</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">SO₂</p>
              <p className="font-bold text-lg">{selectedRegion.so2}</p>
              <p className="text-[10px] text-muted-foreground">ppb</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">CO</p>
              <p className="font-bold text-lg">{selectedRegion.co}</p>
              <p className="text-[10px] text-muted-foreground">ppm</p>
            </div>
          </div>

          {/* Health Advice */}
          <div className="p-3 rounded-xl bg-muted/30">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                selectedRegion.aqi <= 100 ? "bg-green-500/20" : "bg-orange-500/20"
              )}>
                <Heart size={16} className={selectedRegion.aqi <= 100 ? "text-green-600" : "text-orange-600"} />
              </div>
              <div>
                <p className="text-sm font-medium">Khuyến nghị sức khỏe</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {getHealthAdvice(selectedRegion.aqi)}
                </p>
              </div>
            </div>
          </div>
        </WeatherCard>
      )}

      {/* Regional AQI Ranking */}
      <WeatherCard>
        <WeatherCardHeader title="Xếp hạng AQI theo khu vực" icon={<Activity size={16} />} />
        <div className="space-y-2">
          {sortedRegions.map((region, index) => (
            <button
              key={region.name}
              onClick={() => setSelectedRegion(region)}
              className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                selectedRegion?.name === region.name 
                  ? "bg-primary/10 ring-1 ring-primary/30" 
                  : "bg-muted/30 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index < 3 ? "bg-red-500/20 text-red-600" : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </span>
                <div className="text-left">
                  <span className="font-medium text-sm">{region.name}</span>
                  <p className={cn("text-xs", getAQITextColor(region.aqi))}>
                    {getAQILevel(region.aqi)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  getAQIColor(region.aqi)
                )} />
                <span className="font-bold">{region.aqi}</span>
              </div>
            </button>
          ))}
        </div>
      </WeatherCard>

      {/* AQI Information Card */}
      <WeatherCard>
        <WeatherCardHeader title="Thông tin về chỉ số AQI" icon={<AlertTriangle size={16} />} />
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <span className="w-4 h-4 rounded bg-green-500" />
            <div>
              <p className="text-sm font-medium">0 - 50: Tốt</p>
              <p className="text-xs text-muted-foreground">Chất lượng không khí tốt, an toàn cho mọi người</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <span className="w-4 h-4 rounded bg-yellow-500" />
            <div>
              <p className="text-sm font-medium">51 - 100: Trung bình</p>
              <p className="text-xs text-muted-foreground">Chất lượng chấp nhận được, nhóm nhạy cảm cần lưu ý</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <span className="w-4 h-4 rounded bg-orange-500" />
            <div>
              <p className="text-sm font-medium">101 - 150: Kém cho nhóm nhạy cảm</p>
              <p className="text-xs text-muted-foreground">Người có bệnh hô hấp, tim mạch nên hạn chế ra ngoài</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <span className="w-4 h-4 rounded bg-red-500" />
            <div>
              <p className="text-sm font-medium">151 - 200: Kém</p>
              <p className="text-xs text-muted-foreground">Mọi người có thể bị ảnh hưởng sức khỏe</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <span className="w-4 h-4 rounded bg-purple-500" />
            <div>
              <p className="text-sm font-medium">201 - 300: Rất kém</p>
              <p className="text-xs text-muted-foreground">Cảnh báo sức khỏe khẩn cấp</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <span className="w-4 h-4 rounded bg-rose-900" />
            <div>
              <p className="text-sm font-medium">300+: Nguy hại</p>
              <p className="text-xs text-muted-foreground">Cảnh báo khẩn cấp, tránh ra ngoài hoàn toàn</p>
            </div>
          </div>
        </div>
      </WeatherCard>
    </div>
  );
}
