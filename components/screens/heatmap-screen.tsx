"use client";

import { useState, useEffect, useCallback } from "react";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import {
  Map, Wind, Layers, AlertTriangle, Heart, Activity,
  Loader2, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const OWM_KEY = "268ccfe12a9e618e973719a39684b957181d5bea";

/* ── Vietnam cities ────────────────────────────────────────── */
const VN_CITIES = [
  { name: "Hà Nội",        region: "Miền Bắc",   lat: 21.0285, lon: 105.8542 },
  { name: "Hải Phòng",     region: "Miền Bắc",   lat: 20.8648, lon: 106.6835 },
  { name: "Hạ Long",       region: "Miền Bắc",   lat: 20.9511, lon: 107.0790 },
  { name: "Thái Nguyên",   region: "Miền Bắc",   lat: 21.5944, lon: 105.8480 },
  { name: "Nam Định",      region: "Miền Bắc",   lat: 20.4200, lon: 106.1683 },
  { name: "Vinh",          region: "Miền Trung",  lat: 18.6734, lon: 105.6922 },
  { name: "Đồng Hới",     region: "Miền Trung",  lat: 17.4684, lon: 106.6221 },
  { name: "Huế",           region: "Miền Trung",  lat: 16.4637, lon: 107.5909 },
  { name: "Đà Nẵng",      region: "Miền Trung",  lat: 16.0544, lon: 108.2022 },
  { name: "Quy Nhơn",     region: "Miền Trung",  lat: 13.7830, lon: 109.2197 },
  { name: "Nha Trang",    region: "Miền Trung",  lat: 12.2388, lon: 109.1967 },
  { name: "Pleiku",        region: "Tây Nguyên", lat: 13.9830, lon: 108.0000 },
  { name: "Buôn Ma Thuột",region: "Tây Nguyên", lat: 12.6667, lon: 108.0500 },
  { name: "Đà Lạt",       region: "Tây Nguyên", lat: 11.9404, lon: 108.4583 },
  { name: "TP. HCM",      region: "Miền Nam",   lat: 10.8231, lon: 106.6297 },
  { name: "Vũng Tàu",    region: "Miền Nam",   lat: 10.4114, lon: 107.1362 },
  { name: "Cần Thơ",     region: "Miền Nam",   lat: 10.0452, lon: 105.7469 },
  { name: "Phú Quốc",    region: "Miền Nam",   lat: 10.2899, lon: 103.9840 },
  { name: "Cà Mau",      region: "Miền Nam",   lat:  9.1767, lon: 105.1524 },
] as const;

/* ── Types ─────────────────────────────────────────────────── */
interface CityAqi {
  name:    string;
  region:  string;
  lat:     number;
  lon:     number;
  aqi:     number;   // US AQI from PM2.5
  pm25:    number;
  pm10:    number;
  no2:     number;
  o3:      number;
  so2:     number;
  co:      number;   // mg/m³
}

/* ── PM2.5 → US AQI ────────────────────────────────────────── */
function pm25ToUsAqi(pm: number): number {
  const bp: [number, number, number, number][] = [
    [0.0,    12.0,   0,  50],
    [12.1,   35.4,  51, 100],
    [35.5,   55.4, 101, 150],
    [55.5,  150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
  ];
  for (const [pLo, pHi, aLo, aHi] of bp) {
    if (pm >= pLo && pm <= pHi)
      return Math.round(((aHi - aLo) / (pHi - pLo)) * (pm - pLo) + aLo);
  }
  return 500;
}

/* ── Colour helpers ─────────────────────────────────────────── */
function aqiBg(aqi: number) {
  if (aqi <= 50)  return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-600";
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
  if (aqi <= 150) return "Kém (nhạy cảm)";
  if (aqi <= 200) return "Kém";
  if (aqi <= 300) return "Rất kém";
  return "Nguy hại";
}
function aqiAdvice(aqi: number) {
  if (aqi <= 50)  return "Chất lượng tốt, phù hợp mọi hoạt động ngoài trời.";
  if (aqi <= 100) return "Chấp nhận được. Nhóm nhạy cảm nên hạn chế vận động mạnh ngoài trời.";
  if (aqi <= 150) return "Trẻ em, người già, bệnh hô hấp nên hạn chế ra ngoài.";
  if (aqi <= 200) return "Mọi người nên giảm hoạt động ngoài trời và đeo khẩu trang.";
  if (aqi <= 300) return "Cảnh báo sức khỏe nghiêm trọng. Hạn chế tối đa ra ngoài.";
  return "Nguy hiểm! Ở trong nhà, đóng cửa, dùng máy lọc không khí.";
}

/* ── Map coordinate helpers ─────────────────────────────────── */
// VN bounding box
const LAT_MAX = 23.5, LAT_MIN = 8.4, LON_MIN = 102.1, LON_MAX = 109.8;
function toPercent(lat: number, lon: number) {
  const top  = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  const left = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  return {
    top:  Math.min(95, Math.max(2, top)),
    left: Math.min(95, Math.max(2, left)),
  };
}

/* ── Fetch one city from OWM Air Pollution API ──────────────── */
async function fetchCityAqi(c: typeof VN_CITIES[number]): Promise<CityAqi> {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${c.lat}&lon=${c.lon}&appid=${OWM_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OWM ${res.status}`);
  const json = await res.json();
  const item = json.list?.[0];
  const comp = item?.components ?? {};
  const pm25raw = comp.pm2_5 ?? 0;
  return {
    name:   c.name,
    region: c.region,
    lat:    c.lat,
    lon:    c.lon,
    aqi:    pm25ToUsAqi(pm25raw),
    pm25:   Math.round(pm25raw * 10) / 10,
    pm10:   Math.round((comp.pm10 ?? 0) * 10) / 10,
    no2:    Math.round((comp.no2  ?? 0) * 10) / 10,
    o3:     Math.round((comp.o3   ?? 0) * 10) / 10,
    so2:    Math.round((comp.so2  ?? 0) * 10) / 10,
    co:     Math.round((comp.co   ?? 0) / 1000 * 100) / 100,
  };
}

/* ── Component ──────────────────────────────────────────────── */
export function HeatmapScreen() {
  const [cityData, setCityData]     = useState<CityAqi[]>([]);
  const [selected, setSelected]     = useState<CityAqi | null>(null);
  const [loading, setLoading]       = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>("Tất cả");

  const regions = ["Tất cả", "Miền Bắc", "Miền Trung", "Tây Nguyên", "Miền Nam"];

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    const results: CityAqi[] = [];
    const BATCH = 5;
    try {
      for (let i = 0; i < VN_CITIES.length; i += BATCH) {
        const batch = [...VN_CITIES].slice(i, i + BATCH);
        const settled = await Promise.allSettled(batch.map(fetchCityAqi));
        settled.forEach((r, idx) => {
          if (r.status === "fulfilled") {
            results.push(r.value);
          } else {
            const c = batch[idx];
            const prev = cityData.find(x => x.name === c.name);
            if (prev) results.push(prev);
          }
        });
        if (i + BATCH < VN_CITIES.length)
          await new Promise(r => setTimeout(r, 350));
      }
      setCityData(results);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setFetchError("Không thể tải một số địa điểm. Hiển thị dữ liệu một phần.");
      if (results.length) setCityData(results);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchAll(); }, []); // eslint-disable-line

  const validData   = cityData.filter(d => d.aqi > 0);
  const sortedDesc  = [...validData].sort((a, b) => b.aqi - a.aqi);
  const filtered    = activeRegion === "Tất cả"
    ? sortedDesc
    : sortedDesc.filter(d => d.region === activeRegion);

  const avgAqi  = validData.length
    ? Math.round(validData.reduce((s, d) => s + d.aqi, 0) / validData.length)
    : 0;
  const avgPm25 = validData.length
    ? (validData.reduce((s, d) => s + d.pm25, 0) / validData.length).toFixed(1)
    : "–";

  return (
    <div className="space-y-4 pb-24">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="text-primary" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Bản đồ AQI Việt Nam</h1>
          <p className="text-sm text-muted-foreground">
            {lastUpdated
              ? `Cập nhật ${lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · OpenWeatherMap Air Pollution`
              : "Đang tải dữ liệu thời gian thực…"}
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
        <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm">
          {fetchError}
        </div>
      )}

      {/* ── Summary bar ── */}
      {validData.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <p className="text-xs text-muted-foreground mb-1">AQI TB cả nước</p>
            <p className={cn("text-xl font-bold", aqiText(avgAqi))}>{avgAqi}</p>
            <p className={cn("text-xs font-medium", aqiText(avgAqi))}>{aqiLabel(avgAqi)}</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <p className="text-xs text-muted-foreground mb-1">PM2.5 TB</p>
            <p className="text-xl font-bold">{avgPm25}</p>
            <p className="text-xs text-muted-foreground">µg/m³</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <p className="text-xs text-muted-foreground mb-1">Ô nhiễm nhất</p>
            <p className="text-sm font-bold truncate">{sortedDesc[0]?.name ?? "–"}</p>
            <p className={cn("text-xs font-medium", sortedDesc[0] ? aqiText(sortedDesc[0].aqi) : "")}>
              AQI {sortedDesc[0]?.aqi ?? "–"}
            </p>
          </div>
        </div>
      )}

      {/* ── Visual Map ── */}
      <WeatherCard>
        <WeatherCardHeader title="Bản đồ AQI toàn quốc" icon={<Layers size={16} />} />

        {loading && cityData.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-muted-foreground">Đang tải {VN_CITIES.length} điểm đo…</p>
          </div>
        ) : (
          <>
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                height: 420,
                background:
                  "linear-gradient(160deg, hsl(var(--muted)/0.35) 0%, hsl(var(--accent)/0.25) 100%)",
              }}
            >
              {/* Subtle grid lines */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                {[20,40,60,80].map(p => (
                  <g key={p}>
                    <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="currentColor" strokeWidth="1" />
                  </g>
                ))}
              </svg>

              {/* Region bands */}
              {[
                { label: "BẮC", pct: "6%" },
                { label: "TRUNG", pct: "38%" },
                { label: "NAM", pct: "73%" },
              ].map(({ label, pct }) => (
                <span
                  key={label}
                  className="absolute left-1.5 text-[9px] font-bold text-muted-foreground/40 tracking-widest"
                  style={{ top: pct }}
                >
                  {label}
                </span>
              ))}

              {/* City markers */}
              {VN_CITIES.map((city) => {
                const data = cityData.find(d => d.name === city.name);
                const { top, left } = toPercent(city.lat, city.lon);
                const isSel = selected?.name === city.name;

                return (
                  <button
                    key={city.name}
                    onClick={() => data && setSelected(isSel ? null : data)}
                    disabled={!data}
                    style={{
                      position: "absolute",
                      top: `${top}%`,
                      left: `${left}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isSel ? 20 : 10,
                    }}
                    className="flex flex-col items-center gap-0.5 group focus:outline-none"
                  >
                    {/* Ripple when selected */}
                    {isSel && data && (
                      <span
                        className={cn(
                          "absolute rounded-full animate-ping opacity-30 w-10 h-10",
                          aqiBg(data.aqi)
                        )}
                      />
                    )}

                    {/* Bubble */}
                    <div className={cn(
                      "rounded-full flex items-center justify-center text-white font-bold shadow-md transition-all duration-200",
                      data ? aqiBg(data.aqi) : "bg-muted/60",
                      isSel
                        ? "w-12 h-12 text-sm ring-2 ring-white ring-offset-1 scale-110"
                        : "w-8 h-8 text-[11px] hover:scale-110",
                    )}>
                      {data
                        ? data.aqi
                        : <Loader2 size={10} className="animate-spin text-muted-foreground" />
                      }
                    </div>

                    {/* City name label */}
                    <span className={cn(
                      "text-[9px] font-semibold whitespace-nowrap px-1.5 py-0.5 rounded-md leading-none shadow-sm",
                      "bg-background/90 backdrop-blur-sm text-foreground",
                      isSel ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity",
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
                { label: "Tốt (0-50)",      bg: "bg-green-500"  },
                { label: "TB (51-100)",       bg: "bg-yellow-500" },
                { label: "Kém-NC (101-150)", bg: "bg-orange-500" },
                { label: "Kém (151-200)",    bg: "bg-red-500"    },
                { label: "Rất kém (201+)",   bg: "bg-purple-600" },
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

      {/* ── Selected City Detail ── */}
      {selected && (
        <WeatherCard className="border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{selected.name}</h3>
              <p className="text-xs text-muted-foreground">{selected.region}</p>
              <p className={cn("text-sm font-semibold mt-0.5", aqiText(selected.aqi))}>
                {aqiLabel(selected.aqi)}
              </p>
            </div>
            <div className={cn(
              "w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg",
              aqiBg(selected.aqi)
            )}>
              <span className="font-bold text-3xl leading-none">{selected.aqi}</span>
              <span className="text-[10px] opacity-80 mt-1">US AQI</span>
            </div>
          </div>

          {/* Pollutants */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "PM2.5", value: selected.pm25, unit: "µg/m³", hi: true },
              { label: "PM10",  value: selected.pm10,  unit: "µg/m³", hi: false },
              { label: "NO₂",   value: selected.no2,   unit: "µg/m³", hi: false },
              { label: "O₃",    value: selected.o3,    unit: "µg/m³", hi: false },
              { label: "SO₂",   value: selected.so2,   unit: "µg/m³", hi: false },
              { label: "CO",    value: selected.co,    unit: "mg/m³",  hi: false },
            ].map(({ label, value, unit, hi }) => (
              <div
                key={label}
                className={cn(
                  "rounded-xl p-3 text-center",
                  hi ? "bg-primary/10" : "bg-muted/30"
                )}
              >
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className={cn("font-bold text-base leading-tight", hi && "text-primary")}>
                  {value}
                </p>
                <p className="text-[10px] text-muted-foreground">{unit}</p>
              </div>
            ))}
          </div>

          {/* PM2.5 vs WHO */}
          <div className="mb-3 p-3 rounded-xl bg-muted/20 flex items-center gap-3">
            <Wind size={16} className="text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">PM2.5 = {selected.pm25} µg/m³</span>
              {" "}· Tiêu chuẩn WHO (24h): 15 µg/m³
              {selected.pm25 > 15 && (
                <span className={cn("font-semibold ml-1", aqiText(selected.aqi))}>
                  (vượt {((selected.pm25 / 15 - 1) * 100).toFixed(0)}%)
                </span>
              )}
            </p>
          </div>

          {/* Health advice */}
          <div className="p-3 rounded-xl bg-muted/30">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                selected.aqi <= 100 ? "bg-green-500/20" : "bg-orange-500/20"
              )}>
                <Heart size={16} className={selected.aqi <= 100 ? "text-green-600" : "text-orange-600"} />
              </div>
              <div>
                <p className="text-sm font-medium">Khuyến nghị sức khỏe</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {aqiAdvice(selected.aqi)}
                </p>
              </div>
            </div>
          </div>
        </WeatherCard>
      )}

      {/* ── Ranking with region filter ── */}
      <WeatherCard>
        <WeatherCardHeader title="Xếp hạng AQI các tỉnh thành" icon={<Activity size={16} />} />

        {/* Region tabs */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
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
          <p className="text-sm text-muted-foreground text-center py-6">Đang tải…</p>
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
                    <p className="font-medium text-sm truncate">{d.name}</p>
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
                    <p className="text-xs font-semibold">{d.pm25} µg</p>
                  </div>
                  <div className={cn("w-3 h-3 rounded-full", aqiBg(d.aqi))} />
                  <span className="font-bold text-sm w-9 text-right">{d.aqi}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </WeatherCard>

      {/* ── AQI Scale & Pollutant Guide ── */}
      <WeatherCard>
        <WeatherCardHeader title="Thang AQI & Ý nghĩa chỉ số" icon={<AlertTriangle size={16} />} />

        <div className="space-y-2 mb-5">
          {[
            { range: "0–50",    level: "Tốt",              desc: "An toàn cho mọi người",                         bg: "bg-green-500"  },
            { range: "51–100",  level: "Trung bình",        desc: "Nhóm nhạy cảm nên hạn chế hoạt động mạnh",     bg: "bg-yellow-500" },
            { range: "101–150", level: "Kém (nhóm NC)",     desc: "Trẻ em, người già, bệnh hô hấp hạn chế ra ngoài", bg: "bg-orange-500" },
            { range: "151–200", level: "Kém",               desc: "Toàn dân bị ảnh hưởng, đeo khẩu trang",        bg: "bg-red-500"    },
            { range: "201–300", level: "Rất kém",           desc: "Cảnh báo sức khoẻ khẩn cấp",                   bg: "bg-purple-600" },
            { range: "300+",    level: "Nguy hại",          desc: "Tránh ra ngoài hoàn toàn",                      bg: "bg-rose-900"   },
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
            Ý nghĩa các chỉ số ô nhiễm
          </p>
          <div className="space-y-2">
            {[
              { id: "PM2.5", desc: "Bụi mịn < 2.5 µm — xâm nhập sâu vào phổi, gây bệnh tim mạch. WHO 24h: 15 µg/m³" },
              { id: "PM10",  desc: "Bụi thô < 10 µm — kích ứng mắt, mũi, họng. WHO 24h: 45 µg/m³" },
              { id: "NO₂",   desc: "Khí thải giao thông & công nghiệp — gây viêm đường hô hấp" },
              { id: "O₃",    desc: "Ozone tầng thấp — hình thành từ bức xạ UV + NO₂, gây khó thở" },
              { id: "SO₂",   desc: "Đốt than/dầu — gây mưa axit, kích ứng phổi" },
              { id: "CO",    desc: "Khí thải xe cộ — cạnh tranh oxy trong máu, nguy hiểm không gian kín" },
            ].map(({ id, desc }) => (
              <div key={id} className="flex gap-2 text-xs leading-relaxed">
                <span className="font-bold text-primary w-12 flex-shrink-0">{id}</span>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/40">
          * AQI tính theo chuẩn US EPA từ nồng độ PM2.5. Nguồn: OpenWeatherMap Air Pollution API (real-time).
        </p>
      </WeatherCard>
    </div>
  );
}
