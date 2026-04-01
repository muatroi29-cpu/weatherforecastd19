"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeather } from "@/lib/weather-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { Map, Wind, Layers, AlertTriangle, Heart, Activity, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const IQAIR_KEY = "8e0c6447-e5fb-4756-ba43-ec259ad1496a";

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

interface DistrictAqi {
  name:  string;
  aqi:   number;   // US AQI
  pm25:  number;   // µg/m³
  pm10:  number;
  temp:  number;
  humid: number;
}

/* ── colour helpers ─────────────────────────────────────── */
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
  if (aqi <= 150) return "Kém (nhóm nhạy cảm)";
  if (aqi <= 200) return "Kém";
  if (aqi <= 300) return "Rất kém";
  return "Nguy hại";
}
function getHealthAdvice(aqi: number) {
  if (aqi <= 50)  return "Chất lượng không khí tốt, phù hợp cho mọi hoạt động ngoài trời.";
  if (aqi <= 100) return "Chấp nhận được. Nhóm nhạy cảm nên hạn chế hoạt động kéo dài ngoài trời.";
  if (aqi <= 150) return "Nhóm nhạy cảm (trẻ em, người già, bệnh hô hấp) nên hạn chế ra ngoài.";
  if (aqi <= 200) return "Mọi người nên giảm hoạt động ngoài trời. Đeo khẩu trang khi ra ngoài.";
  if (aqi <= 300) return "Cảnh báo sức khỏe nghiêm trọng. Hạn chế tối đa ra ngoài.";
  return "Nguy hiểm! Tránh ra ngoài hoàn toàn. Đóng kín cửa sổ, dùng máy lọc không khí.";
}

/* ── fetch one district via IQAir nearest-city ──────────── */
async function fetchDistrictAqi(d: typeof HANOI_DISTRICTS[0]): Promise<DistrictAqi> {
  const url =
    `https://api.airvisual.com/v2/nearest_city?lat=${d.lat}&lon=${d.lon}&key=${IQAIR_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IQAir ${res.status}`);
  const json = await res.json();

  if (json.status !== "success") throw new Error(json.data?.message ?? "IQAir error");

  const pollution = json.data?.current?.pollution ?? {};
  const weather   = json.data?.current?.weather   ?? {};

  return {
    name:  d.name,
    aqi:   pollution.aqius  ?? 0,
    pm25:  pollution.p2?.v  ?? 0,
    pm10:  pollution.p1?.v  ?? 0,   // IQAir uses p1 for PM10
    temp:  weather.tp       ?? 0,
    humid: weather.hu       ?? 0,
  };
}

/* ── component ──────────────────────────────────────────── */
export function HeatmapScreen() {
  const { currentWeather } = useWeather();
  const [districtData, setDistrictData]         = useState<DistrictAqi[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictAqi | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [lastUpdated, setLastUpdated]           = useState<Date | null>(null);
  const [fetchError, setFetchError]             = useState<string | null>(null);

  const fetchAllDistricts = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const results: DistrictAqi[] = [];

    // IQAir free plan: ~10 req/min — batch 3, delay 700 ms
    const BATCH = 3;
    try {
      for (let i = 0; i < HANOI_DISTRICTS.length; i += BATCH) {
        const batch = HANOI_DISTRICTS.slice(i, i + BATCH);
        const settled = await Promise.allSettled(batch.map(fetchDistrictAqi));

        settled.forEach((r, idx) => {
          if (r.status === "fulfilled") {
            results.push(r.value);
          } else {
            const d = batch[idx];
            const existing = districtData.find(x => x.name === d.name);
            results.push(existing ?? { name: d.name, aqi: 0, pm25: 0, pm10: 0, temp: 0, humid: 0 });
          }
        });

        if (i + BATCH < HANOI_DISTRICTS.length) {
          await new Promise(resolve => setTimeout(resolve, 700));
        }
      }

      setDistrictData(results);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("District AQI fetch error:", err);
      setFetchError("Không thể tải một số quận. Đang hiển thị dữ liệu một phần.");
      if (results.length > 0) setDistrictData(results);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchAllDistricts(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedDistricts = [...districtData]
    .filter(d => d.aqi > 0)
    .sort((a, b) => b.aqi - a.aqi);

  const validData = districtData.filter(d => d.aqi > 0);

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
              ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · IQAir`
              : "Đang tải dữ liệu thời gian thực…"}
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

      {fetchError && (
        <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm">
          {fetchError}
        </div>
      )}

      {/* AQI Map Grid */}
      <WeatherCard className="relative overflow-hidden">
        <WeatherCardHeader title="Bản đồ AQI khu vực Hà Nội" icon={<Layers size={16} />} />

        {loading && districtData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-muted-foreground">
              Đang tải dữ liệu {HANOI_DISTRICTS.length} quận từ IQAir…
            </p>
          </div>
        ) : (
          <>
            <div className="relative h-72 bg-gradient-to-b from-muted/30 to-muted/50 rounded-2xl overflow-hidden p-2">
              <div className="grid grid-cols-4 grid-rows-3 gap-1.5 h-full">
                {HANOI_DISTRICTS.map((district) => {
                  const d = districtData.find(x => x.name === district.name);
                  const aqi = d?.aqi ?? 0;
                  const isSelected = selectedDistrict?.name === district.name;
                  return (
                    <button
                      key={district.name}
                      onClick={() => d && setSelectedDistrict(d)}
                      disabled={!d || aqi === 0}
                      className={cn(
                        "relative rounded-xl flex flex-col items-center justify-center p-1.5 transition-all",
                        aqi > 0
                          ? `${getAQIBgColor(aqi)} hover:scale-105 cursor-pointer`
                          : "bg-muted/40 cursor-wait",
                        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-background scale-105"
                      )}
                    >
                      <span className="text-[10px] font-medium text-white drop-shadow-md text-center leading-tight">
                        {district.name.replace("Quận ", "Q.")}
                      </span>
                      {aqi > 0 ? (
                        <span className="text-base font-bold text-white drop-shadow-md">{aqi}</span>
                      ) : (
                        <Loader2 size={14} className="text-white/70 animate-spin mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Tốt</span>
              <div className="flex gap-1">
                {["bg-green-500","bg-yellow-500","bg-orange-500","bg-red-500","bg-purple-500","bg-rose-900"].map(c => (
                  <span key={c} className={`w-5 h-3 rounded ${c}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Nguy hại</span>
            </div>

            {validData.length > 0 && (
              <p className="text-center text-xs text-muted-foreground mt-1">
                AQI trung bình:{" "}
                <strong>{Math.round(validData.reduce((s, d) => s + d.aqi, 0) / validData.length)}</strong>
                {" "}· PM2.5 trung bình:{" "}
                <strong>
                  {(validData.filter(d => d.pm25 > 0).reduce((s, d) => s + d.pm25, 0) /
                   (validData.filter(d => d.pm25 > 0).length || 1)).toFixed(1)} µg/m³
                </strong>
              </p>
            )}
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
              "w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white",
              getAQIBgColor(selectedDistrict.aqi)
            )}>
              <span className="font-bold text-2xl leading-none">{selectedDistrict.aqi}</span>
              <span className="text-[9px] opacity-80 mt-0.5">AQI</span>
            </div>
          </div>

          {/* Pollutant / weather details */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "PM2.5", value: selectedDistrict.pm25.toFixed(1), unit: "µg/m³", highlight: true },
              { label: "PM10",  value: selectedDistrict.pm10.toFixed(1), unit: "µg/m³", highlight: false },
              { label: "Nhiệt độ", value: `${selectedDistrict.temp}`, unit: "°C",     highlight: false },
              { label: "Độ ẩm",   value: `${selectedDistrict.humid}`, unit: "%",      highlight: false },
            ].map(({ label, value, unit, highlight }) => (
              <div key={label} className={cn(
                "rounded-xl p-3 text-center",
                highlight ? "bg-primary/10" : "bg-muted/30"
              )}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("font-bold text-lg", highlight && "text-primary")}>{value}</p>
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
        ) : sortedDistricts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Đang tải dữ liệu…</p>
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
                      {d.pm25 > 0 && (
                        <span className="text-muted-foreground"> · PM2.5: {d.pm25.toFixed(1)} µg/m³</span>
                      )}
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
        <WeatherCardHeader title="Thang AQI & ý nghĩa" icon={<AlertTriangle size={16} />} />
        <div className="space-y-2">
          {[
            { range: "0–50",    level: "Tốt",                       desc: "An toàn cho mọi người",                          color: "bg-green-500"  },
            { range: "51–100",  level: "Trung bình",                 desc: "Nhóm nhạy cảm nên chú ý",                       color: "bg-yellow-500" },
            { range: "101–150", level: "Kém (nhóm nhạy cảm)",        desc: "Trẻ em, người già nên hạn chế ra ngoài",        color: "bg-orange-500" },
            { range: "151–200", level: "Kém",                        desc: "Mọi người có thể bị ảnh hưởng",                 color: "bg-red-500"    },
            { range: "201–300", level: "Rất kém",                    desc: "Cảnh báo sức khỏe khẩn cấp",                    color: "bg-purple-500" },
            { range: "300+",    level: "Nguy hại",                   desc: "Nguy hiểm – tránh ra ngoài hoàn toàn",          color: "bg-rose-900"   },
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
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
          * Dữ liệu AQI (US EPA) và PM2.5 thời gian thực từ IQAir / AirVisual.
        </p>
      </WeatherCard>
    </div>
  );
}
