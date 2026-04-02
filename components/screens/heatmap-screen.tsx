"use client";

import { useState, useEffect, useCallback } from "react";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import {
  Map, Layers, AlertTriangle, Heart, Activity,
  Loader2, RefreshCw, Wind, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Vietnam cities – toạ độ chuẩn
───────────────────────────────────────────── */
const VN_CITIES = [
  // Miền Bắc
  { name: "Hà Nội",         region: "Miền Bắc",   lat: 21.0285, lon: 105.8542 },
  { name: "Hải Phòng",      region: "Miền Bắc",   lat: 20.8648, lon: 106.6835 },
  { name: "Hạ Long",        region: "Miền Bắc",   lat: 20.9511, lon: 107.0790 },
  { name: "Thái Nguyên",    region: "Miền Bắc",   lat: 21.5944, lon: 105.8480 },
  { name: "Nam Định",       region: "Miền Bắc",   lat: 20.4200, lon: 106.1683 },
  { name: "Việt Trì",       region: "Miền Bắc",   lat: 21.3220, lon: 105.4020 },
  // Miền Trung
  { name: "Vinh",           region: "Miền Trung",  lat: 18.6734, lon: 105.6922 },
  { name: "Đồng Hới",      region: "Miền Trung",  lat: 17.4684, lon: 106.6221 },
  { name: "Huế",            region: "Miền Trung",  lat: 16.4637, lon: 107.5909 },
  { name: "Đà Nẵng",       region: "Miền Trung",  lat: 16.0544, lon: 108.2022 },
  { name: "Quy Nhơn",      region: "Miền Trung",  lat: 13.7830, lon: 109.2197 },
  { name: "Nha Trang",     region: "Miền Trung",  lat: 12.2388, lon: 109.1967 },
  // Tây Nguyên
  { name: "Pleiku",         region: "Tây Nguyên", lat: 13.9830, lon: 108.0000 },
  { name: "Buôn Ma Thuột", region: "Tây Nguyên", lat: 12.6667, lon: 108.0500 },
  { name: "Đà Lạt",        region: "Tây Nguyên", lat: 11.9404, lon: 108.4583 },
  // Miền Nam
  { name: "TP. HCM",       region: "Miền Nam",   lat: 10.8231, lon: 106.6297 },
  { name: "Vũng Tàu",     region: "Miền Nam",   lat: 10.4114, lon: 107.1362 },
  { name: "Cần Thơ",      region: "Miền Nam",   lat: 10.0452, lon: 105.7469 },
  { name: "Phú Quốc",     region: "Miền Nam",   lat: 10.2899, lon: 103.9840 },
  { name: "Cà Mau",       region: "Miền Nam",   lat:  9.1767, lon: 105.1524 },
] as const;

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface CityAqi {
  name:        string;
  region:      string;
  lat:         number;
  lon:         number;
  aqi:         number;    // US AQI – trả về trực tiếp từ AQICN
  dominentpol: string;    // chất ô nhiễm chính
  stationName: string;    // tên trạm đo AQICN gần nhất
  pm25:        number | null;
  pm10:        number | null;
  no2:         number | null;
  o3:          number | null;
  so2:         number | null;
  co:          number | null;
  temp:        number | null;
  humid:       number | null;
}

/* ─────────────────────────────────────────────
   Colour helpers
───────────────────────────────────────────── */
function aqiBg(aqi: number) {
  if (aqi <= 50)  return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-600";
  return "bg-rose-900";
}
function aqiText(aqi: number) {
  if (aqi <= 50)  return "text-green-600 dark:text-green-400";
  if (aqi <= 100) return "text-yellow-600 dark:text-yellow-400";
  if (aqi <= 150) return "text-orange-600 dark:text-orange-400";
  if (aqi <= 200) return "text-red-600 dark:text-red-400";
  if (aqi <= 300) return "text-purple-600 dark:text-purple-400";
  return "text-rose-800 dark:text-rose-400";
}
function aqiLabel(aqi: number) {
  if (aqi <= 50)  return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Kém (nhạy cảm)";
  if (aqi <= 200) return "Kém";
  if (aqi <= 300) return "Rất kém";
  return "Nguy hại";
}
function aqiAdvice(aqi: number) {
  if (aqi <= 50)  return "Chất lượng tốt – phù hợp với mọi hoạt động ngoài trời.";
  if (aqi <= 100) return "Chấp nhận được. Nhóm nhạy cảm nên hạn chế vận động mạnh ngoài trời kéo dài.";
  if (aqi <= 150) return "Trẻ em, người già, người mắc bệnh hô hấp / tim mạch nên hạn chế ra ngoài.";
  if (aqi <= 200) return "Mọi người nên giảm hoạt động ngoài trời. Đeo khẩu trang N95 khi cần ra ngoài.";
  if (aqi <= 300) return "Cảnh báo sức khỏe nghiêm trọng. Hạn chế tối đa ra ngoài.";
  return "Nguy hiểm! Ở trong nhà, đóng kín cửa, dùng máy lọc không khí.";
}

/* ─────────────────────────────────────────────
   Map coordinates  (VN bounding box)
───────────────────────────────────────────── */
const LAT_MAX = 23.5, LAT_MIN = 8.2, LON_MIN = 102.1, LON_MAX = 109.8;
function toPercent(lat: number, lon: number) {
  return {
    top:  Math.min(95, Math.max(2, ((LAT_MAX - lat)  / (LAT_MAX - LAT_MIN)) * 100)),
    left: Math.min(95, Math.max(2, ((lon - LON_MIN)  / (LON_MAX - LON_MIN)) * 100)),
  };
}

/* ─────────────────────────────────────────────
   Fetch one city via our proxy  →  /api/air-quality
   AQICN response:  { status:"ok", data:{ aqi, dominentpol, iaqi:{...}, city:{name} } }
───────────────────────────────────────────── */
async function fetchCityAqi(c: typeof VN_CITIES[number]): Promise<CityAqi> {
  const res = await fetch(`/api/air-quality?lat=${c.lat}&lon=${c.lon}`);
  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }

  const d    = json.data;
  const iaqi = d.iaqi ?? {};

  const get = (key: string): number | null =>
    iaqi[key]?.v != null ? Math.round(iaqi[key].v * 10) / 10 : null;

  return {
    name:        c.name,
    region:      c.region,
    lat:         c.lat,
    lon:         c.lon,
    aqi:         typeof d.aqi === "number" ? d.aqi : 0,
    dominentpol: d.dominentpol ?? "",
    stationName: d.city?.name  ?? c.name,
    pm25:        get("pm25"),
    pm10:        get("pm10"),
    no2:         get("no2"),
    o3:          get("o3"),
    so2:         get("so2"),
    co:          get("co"),
    temp:        get("t"),
    humid:       get("h"),
  };
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const REGIONS = ["Tất cả", "Miền Bắc", "Miền Trung", "Tây Nguyên", "Miền Nam"];

const fmt = (v: number | null, dec = 1) =>
  v != null ? v.toFixed(dec) : "–";

export function HeatmapScreen() {
  const [cityData,      setCityData]      = useState<CityAqi[]>([]);
  const [selected,      setSelected]      = useState<CityAqi | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [progress,      setProgress]      = useState(0);
  const [lastUpdated,   setLastUpdated]   = useState<Date | null>(null);
  const [fetchError,    setFetchError]    = useState<string | null>(null);
  const [activeRegion,  setActiveRegion]  = useState("Tất cả");

  /* fetch all cities one-by-one (AQICN free: ~1000 req/day) */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    setProgress(0);

    const results: CityAqi[] = [];
    let errCount = 0;

    for (let i = 0; i < VN_CITIES.length; i++) {
      const city = VN_CITIES[i];
      try {
        results.push(await fetchCityAqi(city));
      } catch (err: any) {
        errCount++;
        // keep stale value if we have it
        const stale = cityData.find(x => x.name === city.name);
        if (stale) results.push(stale);
        console.warn(`[AQI] ${city.name}:`, err.message);
      }
      setProgress(Math.round(((i + 1) / VN_CITIES.length) * 100));
      // small pause – avoid hammering proxy
      if (i < VN_CITIES.length - 1)
        await new Promise(r => setTimeout(r, 200));
    }

    if (results.length === 0) {
      setFetchError("Không tải được dữ liệu. Kiểm tra kết nối mạng hoặc API key.");
    } else {
      if (errCount > 0)
        setFetchError(`${errCount} địa điểm không tải được – hiển thị dữ liệu một phần.`);
      setCityData(results);
      setLastUpdated(new Date());
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const validData  = cityData.filter(d => d.aqi > 0);
  const sortedDesc = [...validData].sort((a, b) => b.aqi - a.aqi);
  const filtered   = activeRegion === "Tất cả"
    ? sortedDesc
    : sortedDesc.filter(d => d.region === activeRegion);

  const avgAqi  = validData.length
    ? Math.round(validData.reduce((s, d) => s + d.aqi, 0) / validData.length) : 0;
  const avgPm25 = (() => {
    const vals = validData.filter(d => d.pm25 != null).map(d => d.pm25!);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "–";
  })();

  /* ── render ── */
  return (
    <div className="space-y-4 pb-24">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="text-primary" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">Bản đồ AQI Việt Nam</h1>
          <p className="text-sm text-muted-foreground truncate">
            {loading
              ? `Đang tải… ${progress}% (${Math.round(progress * VN_CITIES.length / 100)}/${VN_CITIES.length})`
              : lastUpdated
              ? `Cập nhật ${lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · AQICN / waqi.info`
              : "Chưa có dữ liệu"}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="p-2 rounded-full bg-card/80 hover:bg-accent transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw size={18} className={cn("text-muted-foreground", loading && "animate-spin")} />
        </button>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {fetchError && (
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm flex items-start gap-2">
          <Info size={15} className="mt-0.5 flex-shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Summary cards */}
      {validData.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <p className="text-xs text-muted-foreground mb-1">AQI TB cả nước</p>
            <p className={cn("text-2xl font-bold", aqiText(avgAqi))}>{avgAqi}</p>
            <p className={cn("text-[11px] font-medium mt-0.5", aqiText(avgAqi))}>{aqiLabel(avgAqi)}</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <p className="text-xs text-muted-foreground mb-1">PM2.5 TB</p>
            <p className="text-2xl font-bold">{avgPm25}</p>
            <p className="text-xs text-muted-foreground mt-0.5">µg/m³</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <p className="text-xs text-muted-foreground mb-1">Ô nhiễm nhất</p>
            <p className="text-sm font-bold truncate">{sortedDesc[0]?.name ?? "–"}</p>
            <p className={cn("text-[11px] font-medium mt-0.5", sortedDesc[0] ? aqiText(sortedDesc[0].aqi) : "")}>
              {sortedDesc[0] ? `AQI ${sortedDesc[0].aqi}` : "–"}
            </p>
          </div>
        </div>
      )}

      {/* Visual map */}
      <WeatherCard>
        <WeatherCardHeader title="Bản đồ AQI toàn quốc" icon={<Layers size={16} />} />

        {loading && cityData.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={36} />
            <div className="text-center">
              <p className="text-sm font-medium">Đang lấy dữ liệu chất lượng không khí…</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(progress * VN_CITIES.length / 100)}/{VN_CITIES.length} thành phố
              </p>
            </div>
            <div className="w-48 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Map */}
            <div
              className="relative w-full rounded-2xl overflow-hidden select-none"
              style={{
                height: 440,
                background: "linear-gradient(170deg, hsl(var(--muted)/0.4) 0%, hsl(var(--accent)/0.2) 100%)",
              }}
            >
              {/* Grid */}
              <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
                {[20, 40, 60, 80].map(p => (
                  <g key={p}>
                    <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="currentColor" strokeWidth="1" />
                  </g>
                ))}
              </svg>

              {/* Region labels */}
              {[
                { label: "BẮC",    top: "4%"  },
                { label: "TRUNG",  top: "36%" },
                { label: "TÂY NG",top: "57%" },
                { label: "NAM",    top: "74%" },
              ].map(({ label, top }) => (
                <span
                  key={label}
                  className="absolute left-2 text-[8px] font-black text-muted-foreground/30 tracking-widest pointer-events-none"
                  style={{ top }}
                >
                  {label}
                </span>
              ))}

              {/* City bubbles */}
              {VN_CITIES.map((city) => {
                const data  = cityData.find(d => d.name === city.name);
                const { top, left } = toPercent(city.lat, city.lon);
                const isSel = selected?.name === city.name;
                const ready = data && data.aqi > 0;

                return (
                  <button
                    key={city.name}
                    onClick={() => ready && setSelected(isSel ? null : data)}
                    disabled={!ready}
                    style={{
                      position:  "absolute",
                      top:       `${top}%`,
                      left:      `${left}%`,
                      transform: "translate(-50%,-50%)",
                      zIndex:    isSel ? 20 : 10,
                    }}
                    className="flex flex-col items-center gap-0.5 group focus:outline-none"
                  >
                    {/* Pulse ring */}
                    {isSel && ready && (
                      <span className={cn(
                        "absolute rounded-full animate-ping opacity-30 w-14 h-14",
                        aqiBg(data.aqi)
                      )} />
                    )}

                    {/* Bubble */}
                    <div className={cn(
                      "rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-200",
                      ready ? aqiBg(data.aqi) : "bg-muted/50",
                      isSel
                        ? "w-13 h-13 w-[52px] h-[52px] text-sm ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110"
                        : "w-9 h-9 text-[11px] hover:scale-110",
                    )}>
                      {ready
                        ? data.aqi
                        : <Loader2 size={10} className="animate-spin text-muted-foreground" />
                      }
                    </div>

                    {/* City name – always shown when selected, hover otherwise */}
                    <span className={cn(
                      "text-[9px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded-md leading-none shadow pointer-events-none",
                      "bg-background/90 backdrop-blur-sm text-foreground",
                      isSel
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                    )}>
                      {city.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              {[
                { label: "Tốt (≤50)",      bg: "bg-green-500"  },
                { label: "TB (51-100)",      bg: "bg-yellow-500" },
                { label: "Kém-NC (101-150)",bg: "bg-orange-500" },
                { label: "Kém (151-200)",   bg: "bg-red-500"    },
                { label: "Rất kém (201+)",  bg: "bg-purple-600" },
              ].map(({ label, bg }) => (
                <div key={label} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${bg}`} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-1.5">
              Chạm vào bong bóng để xem chi tiết · Chạm lại để đóng
            </p>
          </>
        )}
      </WeatherCard>

      {/* Selected city detail */}
      {selected && (
        <WeatherCard className="border-2 border-primary/20">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-lg leading-tight">{selected.name}</h3>
              <p className="text-xs text-muted-foreground">{selected.region}</p>
              {selected.stationName !== selected.name && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Trạm: {selected.stationName}
                </p>
              )}
              <p className={cn("text-sm font-semibold mt-1", aqiText(selected.aqi))}>
                {aqiLabel(selected.aqi)}
                {selected.dominentpol && (
                  <span className="text-muted-foreground font-normal ml-1">
                    · Chính: {selected.dominentpol.toUpperCase()}
                  </span>
                )}
              </p>
            </div>
            <div className={cn(
              "w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0",
              aqiBg(selected.aqi)
            )}>
              <span className="font-black text-3xl leading-none">{selected.aqi}</span>
              <span className="text-[10px] opacity-80 mt-1">US AQI</span>
            </div>
          </div>

          {/* Pollutant grid – all 6 pollutants from AQICN */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {([
              { label: "PM2.5", value: selected.pm25, unit: "µg/m³", hi: true  },
              { label: "PM10",  value: selected.pm10,  unit: "µg/m³", hi: false },
              { label: "O₃",    value: selected.o3,    unit: "µg/m³", hi: false },
              { label: "NO₂",   value: selected.no2,   unit: "µg/m³", hi: false },
              { label: "SO₂",   value: selected.so2,   unit: "µg/m³", hi: false },
              { label: "CO",    value: selected.co,    unit: "mg/m³",  hi: false },
            ] as const).map(({ label, value, unit, hi }) => (
              <div key={label} className={cn(
                "rounded-xl p-3 text-center",
                hi ? "bg-primary/10" : "bg-muted/30"
              )}>
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className={cn("font-bold text-base leading-tight mt-0.5", hi && "text-primary")}>
                  {value != null ? value : "–"}
                </p>
                <p className="text-[10px] text-muted-foreground">{unit}</p>
              </div>
            ))}
          </div>

          {/* Temp / Humidity if available */}
          {(selected.temp != null || selected.humid != null) && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {selected.temp != null && (
                <div className="bg-muted/20 rounded-xl p-2.5 flex items-center gap-2">
                  <span className="text-lg">🌡️</span>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Nhiệt độ</p>
                    <p className="font-bold text-sm">{selected.temp}°C</p>
                  </div>
                </div>
              )}
              {selected.humid != null && (
                <div className="bg-muted/20 rounded-xl p-2.5 flex items-center gap-2">
                  <span className="text-lg">💧</span>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Độ ẩm</p>
                    <p className="font-bold text-sm">{selected.humid}%</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PM2.5 vs WHO */}
          {selected.pm25 != null && (
            <div className="mb-3 p-3 rounded-xl bg-muted/20 flex items-center gap-2">
              <Wind size={14} className="text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">PM2.5 = {selected.pm25} µg/m³</span>
                {" "}· Tiêu chuẩn WHO (24h): 15 µg/m³
                {selected.pm25 > 15 && (
                  <span className={cn("font-semibold ml-1", aqiText(selected.aqi))}>
                    — vượt {((selected.pm25 / 15 - 1) * 100).toFixed(0)}%
                  </span>
                )}
                {selected.pm25 <= 15 && (
                  <span className="text-green-600 font-semibold ml-1">✓ đạt chuẩn</span>
                )}
              </p>
            </div>
          )}

          {/* Health advice */}
          <div className="p-3 rounded-xl bg-muted/30 flex items-start gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              selected.aqi <= 100 ? "bg-green-500/20" : "bg-orange-500/20"
            )}>
              <Heart size={16} className={selected.aqi <= 100 ? "text-green-600" : "text-orange-600"} />
            </div>
            <div>
              <p className="text-sm font-semibold">Khuyến nghị sức khỏe</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {aqiAdvice(selected.aqi)}
              </p>
            </div>
          </div>
        </WeatherCard>
      )}

      {/* Ranking with region filter */}
      <WeatherCard>
        <WeatherCardHeader title="Xếp hạng AQI các tỉnh thành" icon={<Activity size={16} />} />

        {/* Region tabs */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                activeRegion === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {loading && cityData.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Đang tải dữ liệu…</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((d, i) => (
              <button
                key={d.name}
                onClick={() => setSelected(selected?.name === d.name ? null : d)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left",
                  selected?.name === d.name
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    i < 3 ? "bg-red-500/20 text-red-600" : "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.region}
                      <span className={cn("ml-1 font-medium", aqiText(d.aqi))}>
                        · {aqiLabel(d.aqi)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">PM2.5</p>
                    <p className="text-xs font-semibold">
                      {d.pm25 != null ? `${d.pm25} µg` : "–"}
                    </p>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full", aqiBg(d.aqi))} />
                  <span className="font-bold text-sm w-9 text-right">{d.aqi}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </WeatherCard>

      {/* AQI scale + pollutant guide */}
      <WeatherCard>
        <WeatherCardHeader title="Thang AQI & Ý nghĩa chỉ số" icon={<AlertTriangle size={16} />} />

        <div className="space-y-2 mb-5">
          {[
            { range: "0–50",    level: "Tốt",             desc: "An toàn cho mọi hoạt động ngoài trời",              bg: "bg-green-500"  },
            { range: "51–100",  level: "Trung bình",       desc: "Nhóm nhạy cảm nên hạn chế vận động mạnh",          bg: "bg-yellow-500" },
            { range: "101–150", level: "Kém (nhóm NC)",    desc: "Trẻ em, người già, bệnh hô hấp hạn chế ra ngoài",  bg: "bg-orange-500" },
            { range: "151–200", level: "Kém",              desc: "Toàn dân bị ảnh hưởng – đeo khẩu trang N95",       bg: "bg-red-500"    },
            { range: "201–300", level: "Rất kém",          desc: "Cảnh báo sức khoẻ khẩn cấp",                       bg: "bg-purple-600" },
            { range: "300+",    level: "Nguy hại",         desc: "Tránh ra ngoài – ở trong nhà, dùng máy lọc khí",   bg: "bg-rose-900"   },
          ].map(({ range, level, desc, bg }) => (
            <div key={range} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20 transition-colors">
              <span className={`w-4 h-4 rounded flex-shrink-0 ${bg}`} />
              <div>
                <p className="text-sm font-medium">{range}: {level}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border/40">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2.5">
            Ý nghĩa các chỉ số ô nhiễm
          </p>
          <div className="space-y-2">
            {[
              { id: "PM2.5", desc: "Bụi mịn < 2.5 µm — xâm nhập sâu phổi & tim mạch. WHO 24h ≤ 15 µg/m³" },
              { id: "PM10",  desc: "Bụi thô < 10 µm — kích ứng mắt, mũi, họng. WHO 24h ≤ 45 µg/m³" },
              { id: "O₃",    desc: "Ozone tầng thấp — tạo từ UV + NO₂, gây ho & khó thở" },
              { id: "NO₂",   desc: "Khí thải giao thông & nhà máy — viêm đường hô hấp" },
              { id: "SO₂",   desc: "Đốt than/dầu — gây mưa axit, kích ứng phổi" },
              { id: "CO",    desc: "Khí thải xe — cạnh tranh oxy trong máu, nguy hiểm không gian kín" },
            ].map(({ id, desc }) => (
              <div key={id} className="flex gap-2 text-xs leading-relaxed">
                <span className="font-bold text-primary w-12 flex-shrink-0">{id}</span>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/40">
          * AQI US EPA. Dữ liệu real-time từ <strong>AQICN / waqi.info</strong> — mạng lưới trạm đo toàn cầu.
        </p>
      </WeatherCard>
    </div>
  );
}
