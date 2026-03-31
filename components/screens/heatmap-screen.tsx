"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeather } from "@/lib/weather-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import {
  Map, Wind, Layers, AlertTriangle, Heart,
  Activity, Loader2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_KEY = 'ecd27c0bc5cf4eb6a70143329263003';

// All 12 inner Hanoi districts with precise coordinates
const DISTRICTS = [
  { name: "Q. Hoàn Kiếm",   lat: 21.0285, lon: 105.8542 },
  { name: "Q. Ba Đình",     lat: 21.0340, lon: 105.8180 },
  { name: "Q. Đống Đa",     lat: 21.0183, lon: 105.8281 },
  { name: "Q. Hai Bà Trưng",lat: 21.0064, lon: 105.8594 },
  { name: "Q. Tây Hồ",     lat: 21.0680, lon: 105.8230 },
  { name: "Q. Thanh Xuân",  lat: 20.9932, lon: 105.8098 },
  { name: "Q. Cầu Giấy",   lat: 21.0320, lon: 105.7880 },
  { name: "Q. Long Biên",   lat: 21.0470, lon: 105.8890 },
  { name: "Q. Hà Đông",    lat: 20.9720, lon: 105.7780 },
  { name: "Q. Nam Từ Liêm", lat: 21.0186, lon: 105.7560 },
  { name: "Q. Bắc Từ Liêm", lat: 21.0680, lon: 105.7450 },
  { name: "Q. Hoàng Mai",   lat: 20.9765, lon: 105.8645 },
];

// WeatherAPI us-epa-index 1–6 → representative AQI
const EPA_AQI: Record<number, number> = { 1:25, 2:75, 3:125, 4:175, 5:250, 6:350 };
function epaToAqi(epa: number) { return EPA_AQI[Math.round(epa)] ?? 50; }

interface DistrictData {
  name:  string;
  aqi:   number;
  pm25:  number;   // µg/m³
  pm10:  number;   // µg/m³
  o3:    number;   // µg/m³
  no2:   number;   // µg/m³
  so2:   number;   // µg/m³
  co:    number;   // µg/m³
}

function aqiBg(aqi: number) {
  if (aqi <= 50)  return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-rose-900";
}
function aqiText(aqi: number) {
  if (aqi <= 50)  return "text-green-600";
  if (aqi <= 100) return "text-yellow-600";
  if (aqi <= 150) return "text-orange-600";
  if (aqi <= 200) return "text-red-600";
  if (aqi <= 300) return "text-purple-600";
  return "text-rose-900";
}
function aqiLabel(aqi: number) {
  if (aqi <= 50)  return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Kém – nhóm nhạy cảm";
  if (aqi <= 200) return "Kém";
  if (aqi <= 300) return "Rất kém";
  return "Nguy hại";
}
function healthAdvice(aqi: number) {
  if (aqi <= 50)  return "Chất lượng không khí tốt, phù hợp cho mọi hoạt động ngoài trời.";
  if (aqi <= 100) return "Chấp nhận được. Nhóm nhạy cảm nên hạn chế hoạt động kéo dài ngoài trời.";
  if (aqi <= 150) return "Trẻ em, người già, người bệnh hô hấp/tim mạch nên hạn chế ra ngoài.";
  if (aqi <= 200) return "Mọi người nên giảm hoạt động ngoài trời. Đeo khẩu trang N95 khi ra ngoài.";
  if (aqi <= 300) return "Cảnh báo sức khỏe nghiêm trọng. Hạn chế tối đa ra ngoài, đóng cửa sổ.";
  return "Nguy hiểm! Ở trong nhà hoàn toàn. Dùng máy lọc không khí nếu có.";
}

export function HeatmapScreen() {
  const { selectedLocation } = useWeather();
  const [districts,  setDistricts]  = useState<DistrictData[]>([]);
  const [selected,   setSelected]   = useState<DistrictData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [updatedAt,  setUpdatedAt]  = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Batch: parallel fetch for all districts
      const results = await Promise.all(
        DISTRICTS.map(async (d) => {
          const res = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${d.lat},${d.lon}&aqi=yes`
          );
          if (!res.ok) throw new Error(`${d.name}: HTTP ${res.status}`);
          const json = await res.json();
          const aq   = json.current?.air_quality ?? {};

          return {
            name: d.name,
            // AQI from us-epa-index
            aqi:  epaToAqi(aq['us-epa-index'] ?? 1),
            // All pollutants — exact values from API (µg/m³ or ppm converted)
            pm25: parseFloat((aq.pm2_5  ?? 0).toFixed(1)),
            pm10: parseFloat((aq.pm10   ?? 0).toFixed(1)),
            o3:   parseFloat((aq.o3     ?? 0).toFixed(1)),
            no2:  parseFloat((aq.no2    ?? 0).toFixed(1)),
            so2:  parseFloat((aq.so2    ?? 0).toFixed(1)),
            // CO from ppm → µg/m³ (×1145 at 25°C)
            co:   parseFloat(((aq.co ?? 0) * 1145 / 1000).toFixed(2)),
          } as DistrictData;
        })
      );
      setDistricts(results);
      setUpdatedAt(new Date());
    } catch (err: any) {
      console.error('District AQI error:', err);
      setFetchError('Một số quận không thể tải. Dữ liệu có thể chưa đầy đủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const sorted = [...districts].sort((a, b) => b.aqi - a.aqi);

  return (
    <div className="space-y-4 pb-24">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="text-primary" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Chất lượng không khí</h1>
          <p className="text-sm text-muted-foreground">
            {loading && districts.length === 0
              ? `Đang tải ${DISTRICTS.length} quận nội thành Hà Nội...`
              : updatedAt
                ? `Realtime • cập nhật ${updatedAt.toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' })}`
                : 'Đang tải...'}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="p-2 rounded-full bg-card/80 hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={cn("text-muted-foreground", loading && "animate-spin")} />
        </button>
      </div>

      {fetchError && (
        <div className="px-4 py-2 rounded-xl bg-orange-500/10 text-orange-600 text-xs">{fetchError}</div>
      )}

      {/* Map grid */}
      <WeatherCard className="overflow-hidden">
        <WeatherCardHeader title="Bản đồ AQI – Nội thành Hà Nội" icon={<Layers size={16} />} />

        {loading && districts.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-muted-foreground">Đang kết nối WeatherAPI...</p>
          </div>
        ) : (
          <>
            <div className="h-72 bg-gradient-to-b from-muted/30 to-muted/50 rounded-2xl overflow-hidden p-2">
              <div className="grid grid-cols-4 grid-rows-3 gap-1.5 h-full">
                {districts.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => setSelected(d)}
                    className={cn(
                      "rounded-xl flex flex-col items-center justify-center p-1.5 transition-all hover:scale-105",
                      aqiBg(d.aqi),
                      selected?.name === d.name && "ring-2 ring-white ring-offset-2 ring-offset-background scale-105"
                    )}
                  >
                    <span className="text-[9px] font-medium text-white/90 text-center leading-tight">
                      {d.name.replace("Q. ", "")}
                    </span>
                    <span className="text-base font-bold text-white leading-tight">{d.aqi}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Tốt</span>
              {["bg-green-500","bg-yellow-500","bg-orange-500","bg-red-500","bg-purple-500","bg-rose-900"].map(c => (
                <span key={c} className={`w-5 h-2.5 rounded ${c}`} />
              ))}
              <span className="text-xs text-muted-foreground">Nguy hại</span>
            </div>
          </>
        )}
      </WeatherCard>

      {/* District detail */}
      {selected && (
        <WeatherCard className="border-2 border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{selected.name.replace("Q. ", "Quận ")}</h3>
              <p className={cn("text-sm font-medium", aqiText(selected.aqi))}>{aqiLabel(selected.aqi)}</p>
            </div>
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl",
              aqiBg(selected.aqi)
            )}>
              {selected.aqi}
            </div>
          </div>

          {/* Pollutants grid — all real values */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "PM2.5", value: selected.pm25, unit: "µg/m³", safe: 12  },
              { label: "PM10",  value: selected.pm10, unit: "µg/m³", safe: 54  },
              { label: "O₃",   value: selected.o3,   unit: "µg/m³", safe: 100 },
              { label: "NO₂",  value: selected.no2,  unit: "µg/m³", safe: 53  },
              { label: "SO₂",  value: selected.so2,  unit: "µg/m³", safe: 35  },
              { label: "CO",   value: selected.co,   unit: "mg/m³",  safe: 4   },
            ].map(({ label, value, unit, safe }) => (
              <div key={label} className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={cn("font-bold text-lg leading-tight", value > safe ? "text-red-500" : "text-green-600")}>
                  {value}
                </p>
                <p className="text-[9px] text-muted-foreground">{unit}</p>
                <p className="text-[9px] text-muted-foreground">ngưỡng an toàn: {safe}</p>
              </div>
            ))}
          </div>

          {/* Health advice */}
          <div className="p-3 rounded-xl bg-muted/30 flex items-start gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              selected.aqi <= 100 ? "bg-green-500/20" : "bg-orange-500/20"
            )}>
              <Heart size={16} className={selected.aqi <= 100 ? "text-green-600" : "text-orange-600"} />
            </div>
            <div>
              <p className="text-sm font-medium mb-0.5">Khuyến nghị sức khỏe</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{healthAdvice(selected.aqi)}</p>
            </div>
          </div>
        </WeatherCard>
      )}

      {/* Ranking */}
      <WeatherCard>
        <WeatherCardHeader title="Xếp hạng AQI các quận" icon={<Activity size={16} />} />
        {loading && districts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((d, i) => (
              <button
                key={d.name}
                onClick={() => setSelected(d)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                  selected?.name === d.name
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  i < 3 ? "bg-red-500/20 text-red-600" : "bg-muted text-muted-foreground"
                )}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <span className="font-medium text-sm">{d.name.replace("Q. ", "Quận ")}</span>
                  <p className={cn("text-xs", aqiText(d.aqi))}>{aqiLabel(d.aqi)}</p>
                </div>
                {/* Mini pollutant preview */}
                <div className="hidden sm:flex gap-3 text-xs text-muted-foreground">
                  <span>PM2.5: <b className="text-foreground">{d.pm25}</b></span>
                  <span>PM10: <b className="text-foreground">{d.pm10}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full flex-shrink-0", aqiBg(d.aqi))} />
                  <span className="font-bold w-8 text-right">{d.aqi}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </WeatherCard>

      {/* AQI scale */}
      <WeatherCard>
        <WeatherCardHeader title="Thông tin chỉ số AQI (US-EPA)" icon={<AlertTriangle size={16} />} />
        <div className="space-y-2.5">
          {[
            { range:"0 – 50",   label:"Tốt",                        desc:"An toàn cho mọi người",                                     color:"bg-green-500"  },
            { range:"51 – 100", label:"Trung bình",                  desc:"Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời kéo dài",    color:"bg-yellow-500" },
            { range:"101 – 150",label:"Kém – nhóm nhạy cảm",        desc:"Trẻ em, người già, người bệnh hô hấp nên ở trong nhà",       color:"bg-orange-500" },
            { range:"151 – 200",label:"Kém",                        desc:"Mọi người có thể bị ảnh hưởng, hạn chế ra ngoài",            color:"bg-red-500"    },
            { range:"201 – 300",label:"Rất kém",                    desc:"Cảnh báo sức khỏe khẩn cấp, hạn chế tối đa ra ngoài",       color:"bg-purple-500" },
            { range:"300+",     label:"Nguy hại",                   desc:"Tình trạng khẩn cấp, không được ra ngoài",                  color:"bg-rose-900"   },
          ].map(({ range, label, desc, color }) => (
            <div key={range} className="flex items-center gap-3">
              <span className={`w-4 h-4 rounded flex-shrink-0 ${color}`} />
              <div>
                <p className="text-sm font-medium">{range}: {label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </WeatherCard>
    </div>
  );
}
