"use client";

import { useState, useEffect } from "react";
import { useWeather } from "@/lib/weather-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { Map, Wind, Layers, AlertTriangle, Heart, Activity, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const API_KEY = 'ecd27c0bc5cf4eb6a70143329263003';

const HANOI_DISTRICTS = [
  { name: "Quận Hoàn Kiếm", lat: 21.0285, lon: 105.8542 },
  { name: "Quận Ba Đình",    lat: 21.0340, lon: 105.8180 },
  { name: "Quận Đống Đa",    lat: 21.0183, lon: 105.8281 },
  { name: "Quận Hai Bà Trưng", lat: 21.0064, lon: 105.8594 },
  { name: "Quận Tây Hồ",    lat: 21.0680, lon: 105.8230 },
  { name: "Quận Thanh Xuân", lat: 20.9932, lon: 105.8098 },
  { name: "Quận Cầu Giấy",  lat: 21.0320, lon: 105.7880 },
  { name: "Quận Long Biên",  lat: 21.0470, lon: 105.8890 },
  { name: "Quận Hà Đông",   lat: 20.9720, lon: 105.7780 },
  { name: "Quận Nam Từ Liêm", lat: 21.0186, lon: 105.7560 },
  { name: "Quận Bắc Từ Liêm", lat: 21.0680, lon: 105.7450 },
  { name: "Quận Hoàng Mai", lat: 20.9765, lon: 105.8645 },
];

const EPA_TO_AQI: Record<number, number> = { 1:25, 2:75, 3:125, 4:175, 5:250, 6:350 };

interface DistrictAqi {
  name:  string;
  aqi:   number;
  pm25:  number;
  pm10:  number;
  o3:    number;
  no2:   number;
  so2:   number;
  co:    number;
}

function getAQIBgColor(aqi: number) {
  if (aqi <= 50)  return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-rose-900";
}
function getAQITextColor(aqi: number) {
  if (aqi <= 50)  return "text-green-600";
  if (aqi <= 100) return "text-yellow-600";
  if (aqi <= 150) return "text-orange-600";
  if (aqi <= 200) return "text-red-600";
  if (aqi <= 300) return "text-purple-600";
  return "text-rose-900";
}
function getAQILevel(aqi: number) {
  if (aqi <= 50)  return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Kém cho nhóm nhạy cảm";
  if (aqi <= 200) return "Kém";
  if (aqi <= 300) return "Rất kém";
  return "Nguy hại";
}
function getHealthAdvice(aqi: number) {
  if (aqi <= 50)  return "Chất lượng không khí tốt, phù hợp cho mọi hoạt động ngoài trời.";
  if (aqi <= 100) return "Chất lượng không khí chấp nhận được. Nhóm nhạy cảm nên hạn chế hoạt động kéo dài.";
  if (aqi <= 150) return "Nhóm nhạy cảm (trẻ em, người già, người có bệnh hô hấp) nên hạn chế ra ngoài.";
  if (aqi <= 200) return "Mọi người nên giảm hoạt động ngoài trời. Đeo khẩu trang khi ra ngoài.";
  if (aqi <= 300) return "Cảnh báo sức khỏe nghiêm trọng. Hạn chế tối đa ra ngoài.";
  return "Nguy hiểm! Tránh ra ngoài hoàn toàn. Đóng kín cửa sổ.";
}

export function HeatmapScreen() {
  const { currentWeather } = useWeather();
  const [districtData, setDistrictData]       = useState<DistrictAqi[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictAqi | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [lastUpdated, setLastUpdated]         = useState<Date | null>(null);

  const fetchAllDistricts = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        HANOI_DISTRICTS.map(async (d) => {
          const res = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${d.lat},${d.lon}&aqi=yes`
          );
          if (!res.ok) throw new Error('fetch failed');
          const json = await res.json();
          const aq   = json.current?.air_quality ?? {};
          const epa  = aq['us-epa-index'] ?? 1;
          return {
            name: d.name,
            aqi:  EPA_TO_AQI[Math.round(epa)] ?? 50,
            pm25: Math.round(aq.pm2_5   ?? 0),
            pm10: Math.round(aq.pm10    ?? 0),
            o3:   Math.round(aq.o3      ?? 0),
            no2:  Math.round(aq.no2     ?? 0),
            so2:  Math.round(aq.so2     ?? 0),
            co:   parseFloat((aq.co     ?? 0).toFixed(1)),
          } as DistrictAqi;
        })
      );
      setDistrictData(results);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('District AQI fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDistricts();
  }, []);

  const sortedDistricts = [...districtData].sort((a, b) => b.aqi - a.aqi);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="text-primary" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Bản đồ chất lượng không khí</h1>
          <p className="text-sm text-muted-foreground">
            {lastUpdated
              ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' })}`
              : 'Đang tải dữ liệu thời gian thực...'}
          </p>
        </div>
        <button
          onClick={fetchAllDistricts}
          disabled={loading}
          className="p-2 rounded-full bg-card/80 hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={cn("text-muted-foreground", loading && "animate-spin")} />
        </button>
      </div>

      {/* AQI Map Grid */}
      <WeatherCard className="relative overflow-hidden">
        <WeatherCardHeader title="Bản đồ AQI khu vực Hà Nội" icon={<Layers size={16} />} />

        {loading && districtData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu {HANOI_DISTRICTS.length} quận...</p>
          </div>
        ) : (
          <>
            <div className="relative h-72 bg-gradient-to-b from-muted/30 to-muted/50 rounded-2xl overflow-hidden p-2">
              <div className="grid grid-cols-4 grid-rows-3 gap-1.5 h-full">
                {districtData.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => setSelectedDistrict(d)}
                    className={cn(
                      "relative rounded-xl flex flex-col items-center justify-center p-2 transition-all hover:scale-105 cursor-pointer",
                      getAQIBgColor(d.aqi),
                      selectedDistrict?.name === d.name && "ring-2 ring-white ring-offset-2 ring-offset-background"
                    )}
                  >
                    <span className="text-[10px] font-medium text-white drop-shadow-md text-center leading-tight">
                      {d.name.replace("Quận ", "Q.")}
                    </span>
                    <span className="text-lg font-bold text-white drop-shadow-md">{d.aqi}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Tốt</span>
              <div className="flex gap-1">
                {["bg-green-500","bg-yellow-500","bg-orange-500","bg-red-500","bg-purple-500","bg-rose-900"].map(c => (
                  <span key={c} className={`w-6 h-3 rounded ${c}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Nguy hại</span>
            </div>
          </>
        )}
      </WeatherCard>

      {/* Selected District Detail */}
      {selectedDistrict && (
        <WeatherCard className="border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{selectedDistrict.name}</h3>
              <p className={cn("text-sm font-medium", getAQITextColor(selectedDistrict.aqi))}>
                {getAQILevel(selectedDistrict.aqi)}
              </p>
            </div>
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl",
              getAQIBgColor(selectedDistrict.aqi)
            )}>
              {selectedDistrict.aqi}
            </div>
          </div>

          {/* Pollutant Details */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "PM2.5", value: selectedDistrict.pm25, unit: "µg/m³" },
              { label: "PM10",  value: selectedDistrict.pm10, unit: "µg/m³" },
              { label: "O₃",    value: selectedDistrict.o3,   unit: "µg/m³" },
              { label: "NO₂",   value: selectedDistrict.no2,  unit: "µg/m³" },
              { label: "SO₂",   value: selectedDistrict.so2,  unit: "µg/m³" },
              { label: "CO",    value: selectedDistrict.co,   unit: "µg/m³" },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-muted/30 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-bold text-lg">{value}</p>
                <p className="text-[10px] text-muted-foreground">{unit}</p>
              </div>
            ))}
          </div>

          {/* Health Advice */}
          <div className="p-3 rounded-xl bg-muted/30">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                selectedDistrict.aqi <= 100 ? "bg-green-500/20" : "bg-orange-500/20"
              )}>
                <Heart size={16} className={selectedDistrict.aqi <= 100 ? "text-green-600" : "text-orange-600"} />
              </div>
              <div>
                <p className="text-sm font-medium">Khuyến nghị sức khỏe</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {getHealthAdvice(selectedDistrict.aqi)}
                </p>
              </div>
            </div>
          </div>
        </WeatherCard>
      )}

      {/* Ranking */}
      <WeatherCard>
        <WeatherCardHeader title="Xếp hạng AQI theo khu vực" icon={<Activity size={16} />} />
        {loading && districtData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : (
          <div className="space-y-2">
            {sortedDistricts.map((d, index) => (
              <button
                key={d.name}
                onClick={() => setSelectedDistrict(d)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                  selectedDistrict?.name === d.name
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
                    <span className="font-medium text-sm">{d.name}</span>
                    <p className={cn("text-xs", getAQITextColor(d.aqi))}>
                      {getAQILevel(d.aqi)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", getAQIBgColor(d.aqi))} />
                  <span className="font-bold">{d.aqi}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </WeatherCard>

      {/* AQI Scale Info */}
      <WeatherCard>
        <WeatherCardHeader title="Thông tin về chỉ số AQI" icon={<AlertTriangle size={16} />} />
        <div className="space-y-3">
          {[
            { range: "0 – 50",   level: "Tốt",                          desc: "Chất lượng không khí tốt, an toàn cho mọi người",              color: "bg-green-500" },
            { range: "51 – 100", level: "Trung bình",                    desc: "Chấp nhận được, nhóm nhạy cảm cần lưu ý",                    color: "bg-yellow-500" },
            { range: "101 – 150",level: "Kém cho nhóm nhạy cảm",         desc: "Người có bệnh hô hấp, tim mạch nên hạn chế ra ngoài",        color: "bg-orange-500" },
            { range: "151 – 200",level: "Kém",                           desc: "Mọi người có thể bị ảnh hưởng sức khỏe",                     color: "bg-red-500" },
            { range: "201 – 300",level: "Rất kém",                       desc: "Cảnh báo sức khỏe khẩn cấp",                                 color: "bg-purple-500" },
            { range: "300+",     level: "Nguy hại",                      desc: "Cảnh báo khẩn cấp, tránh ra ngoài hoàn toàn",                color: "bg-rose-900" },
          ].map(({ range, level, desc, color }) => (
            <div key={range} className="flex items-center gap-3 p-2 rounded-lg">
              <span className={`w-4 h-4 rounded flex-shrink-0 ${color}`} />
              <div>
                <p className="text-sm font-medium">{range}: {level}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </WeatherCard>
    </div>
  );
}
