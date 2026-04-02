"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import {
  Wind, Layers, AlertTriangle, Heart, Activity,
  Loader2, RefreshCw, Info, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────
   AQICN city slugs – only cities that have real stations.
   Slug = path used in https://aqicn.org/city/{slug}
   If a slug returns status≠"ok" it is skipped automatically.
───────────────────────────────────────────────────────────────── */
const STATIONS = [
  // Miền Bắc
  { name: "Hà Nội",       region: "Miền Bắc",   slug: "vietnam/hanoi"           },
  { name: "Hải Phòng",    region: "Miền Bắc",   slug: "vietnam/haiphong"        },
  { name: "Hạ Long",      region: "Miền Bắc",   slug: "vietnam/quangninh"       },
  { name: "Thái Nguyên",  region: "Miền Bắc",   slug: "vietnam/thainguyen"      },
  { name: "Việt Trì",     region: "Miền Bắc",   slug: "vietnam/vietphu"         },
  { name: "Nam Định",     region: "Miền Bắc",   slug: "vietnam/namdinh"         },
  // Miền Trung
  { name: "Vinh",         region: "Miền Trung",  slug: "vietnam/vinh"            },
  { name: "Huế",          region: "Miền Trung",  slug: "vietnam/hue"             },
  { name: "Đà Nẵng",     region: "Miền Trung",  slug: "vietnam/danang"          },
  { name: "Quy Nhơn",    region: "Miền Trung",  slug: "vietnam/quinhon"         },
  { name: "Nha Trang",   region: "Miền Trung",  slug: "vietnam/nhatrang"        },
  // Tây Nguyên
  { name: "Đà Lạt",      region: "Tây Nguyên", slug: "vietnam/dalat"           },
  { name: "Buôn Ma Thuột",region: "Tây Nguyên", slug: "vietnam/buonmathuot"     },
  // Miền Nam
  { name: "TP. HCM",     region: "Miền Nam",   slug: "vietnam/hochiminh"       },
  { name: "Vũng Tàu",   region: "Miền Nam",   slug: "vietnam/vungtau"         },
  { name: "Cần Thơ",    region: "Miền Nam",   slug: "vietnam/cantho"          },
  { name: "Cà Mau",     region: "Miền Nam",   slug: "vietnam/camau"           },
] as const;

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 phút
const REGIONS = ["Tất cả", "Miền Bắc", "Miền Trung", "Tây Nguyên", "Miền Nam"];

/* ─────────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────────── */
interface StationData {
  name:        string;
  region:      string;
  slug:        string;
  stationName: string;   // exact name from AQICN
  aqi:         number;
  dominentpol: string;
  updatedAt:   string;   // station's own timestamp e.g. "2024-03-15 14:00:00"
  pm25:        number | null;
  pm10:        number | null;
  no2:         number | null;
  o3:          number | null;
  so2:         number | null;
  co:          number | null;
  temp:        number | null;
  humid:       number | null;
  wind:        number | null;
}

type LoadState = "idle" | "loading" | "done" | "error";

/* ─────────────────────────────────────────────────────────────────
   Colour helpers
───────────────────────────────────────────────────────────────── */
function aqiBg(aqi: number) {
  if (aqi <= 50)  return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-600";
  return "bg-rose-900";
}
function aqiBgLight(aqi: number) {
  if (aqi <= 50)  return "bg-green-500/15";
  if (aqi <= 100) return "bg-yellow-500/15";
  if (aqi <= 150) return "bg-orange-500/15";
  if (aqi <= 200) return "bg-red-500/15";
  if (aqi <= 300) return "bg-purple-600/15";
  return "bg-rose-900/15";
}
function aqiTextColor(aqi: number) {
  if (aqi <= 50)  return "text-green-600 dark:text-green-400";
  if (aqi <= 100) return "text-yellow-600 dark:text-yellow-400";
  if (aqi <= 150) return "text-orange-600 dark:text-orange-400";
  if (aqi <= 200) return "text-red-600 dark:text-red-400";
  if (aqi <= 300) return "text-purple-600 dark:text-purple-400";
  return "text-rose-700 dark:text-rose-400";
}
function aqiLabel(aqi: number) {
  if (aqi <= 50)  return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Hơi kém";
  if (aqi <= 200) return "Kém";
  if (aqi <= 300) return "Rất kém";
  return "Nguy hại";
}
function aqiLabelFull(aqi: number) {
  if (aqi <= 50)  return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Kém (nhóm nhạy cảm)";
  if (aqi <= 200) return "Kém";
  if (aqi <= 300) return "Rất kém";
  return "Nguy hại";
}
function aqiAdvice(aqi: number) {
  if (aqi <= 50)  return "Chất lượng tốt – phù hợp với mọi hoạt động ngoài trời.";
  if (aqi <= 100) return "Chấp nhận được. Nhóm nhạy cảm nên hạn chế vận động mạnh ngoài trời kéo dài.";
  if (aqi <= 150) return "Trẻ em, người già, người bệnh hô hấp / tim mạch nên hạn chế ra ngoài.";
  if (aqi <= 200) return "Mọi người nên giảm hoạt động ngoài trời. Đeo khẩu trang N95 khi cần ra ngoài.";
  if (aqi <= 300) return "Cảnh báo sức khỏe nghiêm trọng. Hạn chế tối đa ra ngoài.";
  return "Nguy hiểm! Nên ở trong nhà, đóng kín cửa.";
}

const get = (iaqi: Record<string, { v: number }>, key: string): number | null =>
  iaqi[key]?.v != null ? Math.round(iaqi[key].v * 10) / 10 : null;

const fmtTime = (s: string) => {
  // s = "2024-03-15 14:00:00" → "14:00 15/03"
  try {
    const d = new Date(s.replace(" ", "T"));
    return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  } catch { return s; }
};

/* ─────────────────────────────────────────────────────────────────
   Fetch one station via proxy
───────────────────────────────────────────────────────────────── */
async function fetchStation(s: typeof STATIONS[number]): Promise<StationData | null> {
  try {
    const res  = await fetch(`/api/air-quality?slug=${encodeURIComponent(s.slug)}`);
    const json = await res.json();
    if (!res.ok || json.error) return null; // station not available – skip

    const d    = json.data;
    const iaqi = d.iaqi ?? {};

    return {
      name:        s.name,
      region:      s.region,
      slug:        s.slug,
      stationName: d.city?.name ?? s.name,
      aqi:         typeof d.aqi === "number" ? d.aqi : 0,
      dominentpol: d.dominentpol ?? "",
      updatedAt:   d.time?.s ?? "",
      pm25:  get(iaqi, "pm25"),
      pm10:  get(iaqi, "pm10"),
      no2:   get(iaqi, "no2"),
      o3:    get(iaqi, "o3"),
      so2:   get(iaqi, "so2"),
      co:    get(iaqi, "co"),
      temp:  get(iaqi, "t"),
      humid: get(iaqi, "h"),
      wind:  get(iaqi, "w"),
    };
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────────
   Countdown hook
───────────────────────────────────────────────────────────────── */
function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(targetMs);
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const reset = () => setRemaining(targetMs);
  const mins  = Math.floor(remaining / 60000);
  const secs  = Math.floor((remaining % 60000) / 1000);
  return { mins, secs, reset };
}

/* ─────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────── */
export function HeatmapScreen() {
  const [stations,     setStations]     = useState<StationData[]>([]);
  const [selected,     setSelected]     = useState<StationData | null>(null);
  const [loadState,    setLoadState]    = useState<LoadState>("idle");
  const [progress,     setProgress]     = useState(0);          // 0-100
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const [activeRegion, setActiveRegion] = useState("Tất cả");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── fetch all stations ── */
  const fetchAll = useCallback(async (isRefresh = false) => {
    setLoadState(isRefresh ? "loading" : "loading");
    if (!isRefresh) setProgress(0);

    const results: StationData[] = [];

    for (let i = 0; i < STATIONS.length; i++) {
      const s = STATIONS[i];
      const data = await fetchStation(s);
      if (data && data.aqi > 0) results.push(data);          // skip unavailable
      if (!isRefresh) setProgress(Math.round(((i + 1) / STATIONS.length) * 100));
      await new Promise(r => setTimeout(r, 180));            // ~180 ms gap
    }

    if (results.length === 0) {
      setLoadState("error");
    } else {
      setStations(results);
      setLastUpdated(new Date());
      setLoadState("done");
      // update selected if it was shown
      setSelected(prev =>
        prev ? results.find(r => r.slug === prev.slug) ?? prev : null
      );
    }
  }, []);

  /* ── auto-refresh every 10 min ── */
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      fetchAll(true).then(scheduleRefresh);
    }, REFRESH_INTERVAL_MS);
  }, [fetchAll]);

  useEffect(() => {
    fetchAll(false).then(scheduleRefresh);
    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); };
  }, []); // eslint-disable-line

  /* ── countdown to next refresh ── */
  const countdown = useCountdown(REFRESH_INTERVAL_MS);

  const handleManualRefresh = () => {
    countdown.reset();
    fetchAll(true).then(scheduleRefresh);
  };

  /* ── derived data ── */
  const validStations = stations.filter(s => s.aqi > 0);
  const sortedDesc    = [...validStations].sort((a, b) => b.aqi - a.aqi);
  const filtered      = activeRegion === "Tất cả"
    ? sortedDesc
    : sortedDesc.filter(s => s.region === activeRegion);

  const avgAqi  = validStations.length
    ? Math.round(validStations.reduce((s, d) => s + d.aqi, 0) / validStations.length)
    : 0;
  const avgPm25 = (() => {
    const vals = validStations.filter(s => s.pm25 != null).map(s => s.pm25!);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "–";
  })();

  const isLoading  = loadState === "loading";
  const firstLoad  = isLoading && stations.length === 0;

  /* ─────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-4 pb-24">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Wind className="text-primary" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">Chất lượng không khí</h1>
          <p className="text-sm text-muted-foreground truncate">
            {firstLoad
              ? `Đang tải… ${progress}%`
              : lastUpdated
              ? `Cập nhật ${lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
              : "Chưa có dữ liệu"}
          </p>
        </div>
        {/* Countdown + refresh button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!firstLoad && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} />
              <span>{countdown.mins}:{String(countdown.secs).padStart(2, "0")}</span>
            </div>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="p-2 rounded-full bg-card/80 hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={cn("text-muted-foreground", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Progress bar (first load only) */}
      {firstLoad && (
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error notice */}
      {loadState === "error" && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
          <Info size={15} className="mt-0.5 flex-shrink-0" />
          <span>Không tải được dữ liệu. Kiểm tra kết nối hoặc thử lại sau.</span>
        </div>
      )}

      {/* ── Summary cards ── */}
      {validStations.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <p className="text-xs text-muted-foreground mb-1">AQI TB</p>
            <p className={cn("text-2xl font-black", aqiTextColor(avgAqi))}>{avgAqi}</p>
            <p className={cn("text-[11px] font-semibold mt-0.5", aqiTextColor(avgAqi))}>
              {aqiLabel(avgAqi)}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <p className="text-xs text-muted-foreground mb-1">PM2.5 TB</p>
            <p className="text-2xl font-black">{avgPm25}</p>
            <p className="text-xs text-muted-foreground mt-0.5">µg/m³</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <p className="text-xs text-muted-foreground mb-1">Ô nhiễm nhất</p>
            <p className="text-sm font-black truncate">{sortedDesc[0]?.name ?? "–"}</p>
            <p className={cn("text-[11px] font-semibold mt-0.5", sortedDesc[0] ? aqiTextColor(sortedDesc[0].aqi) : "")}>
              {sortedDesc[0] ? `AQI ${sortedDesc[0].aqi}` : "–"}
            </p>
          </div>
        </div>
      )}

      {/* ── AQI Grid (square tiles) ── */}
      <WeatherCard>
        <WeatherCardHeader
          title={`Bản đồ AQI toàn quốc · ${validStations.length} trạm`}
          icon={<Layers size={16} />}
        />

        {firstLoad ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <div className="text-center">
              <p className="text-sm font-medium">Đang kết nối tới các trạm đo…</p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(progress * STATIONS.length / 100)}/{STATIONS.length} trạm
              </p>
            </div>
            <div className="w-44 bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : validStations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Không có dữ liệu.</p>
        ) : (
          <>
            {/* Grid of square tiles */}
            <div className="grid grid-cols-3 gap-2">
              {validStations
                .sort((a, b) => {
                  // sort by region order then by name
                  const order = ["Miền Bắc", "Miền Trung", "Tây Nguyên", "Miền Nam"];
                  return order.indexOf(a.region) - order.indexOf(b.region);
                })
                .map((s) => {
                  const isSel = selected?.slug === s.slug;
                  return (
                    <button
                      key={s.slug}
                      onClick={() => setSelected(isSel ? null : s)}
                      className={cn(
                        "relative rounded-2xl p-3 flex flex-col items-center justify-center gap-1 transition-all duration-200 aspect-square",
                        aqiBg(s.aqi),
                        isSel
                          ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-[0.97]"
                          : "hover:scale-[0.97] active:scale-95",
                      )}
                    >
                      {/* Refresh spinner overlay */}
                      {isLoading && (
                        <div className="absolute top-1.5 right-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                        </div>
                      )}

                      {/* City name */}
                      <span className="text-[10px] font-bold text-white/90 text-center leading-tight drop-shadow">
                        {s.name}
                      </span>

                      {/* AQI number */}
                      <span className="text-2xl font-black text-white drop-shadow-md leading-none">
                        {s.aqi}
                      </span>

                      {/* Label */}
                      <span className="text-[9px] font-semibold text-white/80 text-center leading-tight">
                        {aqiLabel(s.aqi)}
                      </span>

                      {/* PM2.5 mini */}
                      {s.pm25 != null && (
                        <span className="text-[8px] text-white/60 leading-none">
                          PM2.5: {s.pm25}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
              {[
                { label: "Tốt ≤50",      bg: "bg-green-500"  },
                { label: "TB 51-100",     bg: "bg-yellow-500" },
                { label: "Kém-NC 101-150",bg: "bg-orange-500" },
                { label: "Kém 151-200",   bg: "bg-red-500"    },
                { label: "Rất kém 201+",  bg: "bg-purple-600" },
              ].map(({ label, bg }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-sm ${bg}`} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Auto-refresh note */}
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              Tự động cập nhật sau {countdown.mins}:{String(countdown.secs).padStart(2, "0")}
              {" "}· Nguồn: AQICN / waqi.info
            </p>
          </>
        )}
      </WeatherCard>

      {/* ── Selected station detail ── */}
      {selected && (
        <WeatherCard className="border-2 border-primary/20">
          {/* Station header */}
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-lg leading-tight">{selected.name}</h3>
              <p className="text-xs text-muted-foreground">{selected.region}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                Trạm: {selected.stationName}
              </p>
              <p className={cn("text-sm font-semibold mt-1.5", aqiTextColor(selected.aqi))}>
                {aqiLabelFull(selected.aqi)}
                {selected.dominentpol && (
                  <span className="text-muted-foreground font-normal text-xs ml-1.5">
                    · {selected.dominentpol.toUpperCase()} chủ yếu
                  </span>
                )}
              </p>
              {selected.updatedAt && (
                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Clock size={9} />
                  Trạm cập nhật: {fmtTime(selected.updatedAt)}
                </p>
              )}
            </div>
            <div className={cn(
              "w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0",
              aqiBg(selected.aqi)
            )}>
              <span className="font-black text-3xl leading-none">{selected.aqi}</span>
              <span className="text-[9px] opacity-70 mt-1">US AQI</span>
            </div>
          </div>

          {/* ── Pollutant grid ── */}
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Các chỉ số ô nhiễm
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {([
              { label: "PM2.5", value: selected.pm25, unit: "µg/m³", hi: true  },
              { label: "PM10",  value: selected.pm10, unit: "µg/m³", hi: false },
              { label: "O₃",    value: selected.o3,   unit: "µg/m³", hi: false },
              { label: "NO₂",   value: selected.no2,  unit: "µg/m³", hi: false },
              { label: "SO₂",   value: selected.so2,  unit: "µg/m³", hi: false },
              { label: "CO",    value: selected.co,   unit: "mg/m³",  hi: false },
            ] as const).map(({ label, value, unit, hi }) => (
              <div key={label} className={cn(
                "rounded-xl p-3 text-center",
                value != null
                  ? (hi ? "bg-primary/10" : "bg-muted/40")
                  : "bg-muted/20 opacity-50"
              )}>
                <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
                <p className={cn(
                  "font-black text-lg leading-tight mt-0.5",
                  hi && value != null && "text-primary"
                )}>
                  {value != null ? value : "–"}
                </p>
                <p className="text-[9px] text-muted-foreground">{unit}</p>
              </div>
            ))}
          </div>

          {/* ── Weather from station ── */}
          {(selected.temp != null || selected.humid != null || selected.wind != null) && (
            <>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
                Thời tiết tại trạm
              </p>
              <div className="flex gap-2 mb-3 flex-wrap">
                {selected.temp  != null && (
                  <div className="flex items-center gap-1.5 bg-muted/30 rounded-xl px-3 py-2">
                    <span>🌡️</span>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Nhiệt độ</p>
                      <p className="font-bold text-sm">{selected.temp}°C</p>
                    </div>
                  </div>
                )}
                {selected.humid != null && (
                  <div className="flex items-center gap-1.5 bg-muted/30 rounded-xl px-3 py-2">
                    <span>💧</span>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Độ ẩm</p>
                      <p className="font-bold text-sm">{selected.humid}%</p>
                    </div>
                  </div>
                )}
                {selected.wind  != null && (
                  <div className="flex items-center gap-1.5 bg-muted/30 rounded-xl px-3 py-2">
                    <span>💨</span>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Gió</p>
                      <p className="font-bold text-sm">{selected.wind} m/s</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* PM2.5 vs WHO */}
          {selected.pm25 != null && (
            <div className="mb-3 p-3 rounded-xl bg-muted/20 flex items-center gap-2">
              <Wind size={13} className="text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">PM2.5 = {selected.pm25} µg/m³</span>
                {" "}· Chuẩn WHO 24h: 15 µg/m³
                {selected.pm25 > 15
                  ? <span className={cn("font-bold ml-1", aqiTextColor(selected.aqi))}>
                      — vượt {((selected.pm25 / 15 - 1) * 100).toFixed(0)}%
                    </span>
                  : <span className="text-green-600 font-bold ml-1">✓ đạt chuẩn</span>
                }
              </p>
            </div>
          )}

          {/* Health advice */}
          <div className={cn("p-3 rounded-xl flex items-start gap-3", aqiBgLight(selected.aqi))}>
            <Heart
              size={16}
              className={cn("flex-shrink-0 mt-0.5", aqiTextColor(selected.aqi))}
            />
            <div>
              <p className="text-sm font-bold">Khuyến nghị sức khỏe</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {aqiAdvice(selected.aqi)}
              </p>
            </div>
          </div>
        </WeatherCard>
      )}

      {/* ── Ranking list with region filter ── */}
      <WeatherCard>
        <WeatherCardHeader
          title="Xếp hạng AQI"
          icon={<Activity size={16} />}
        />

        {/* Region tabs */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {REGIONS.map(r => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeRegion === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {firstLoad ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            {activeRegion === "Tất cả" ? "Không có dữ liệu." : "Chưa có trạm đo trong khu vực này."}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((d, i) => (
              <button
                key={d.slug}
                onClick={() => setSelected(selected?.slug === d.slug ? null : d)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                  selected?.slug === d.slug
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                {/* Rank */}
                <span className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                  i === 0 ? "bg-red-500 text-white" :
                  i === 1 ? "bg-orange-400 text-white" :
                  i === 2 ? "bg-yellow-400 text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {i + 1}
                </span>

                {/* AQI color bar */}
                <div className={cn("w-1 h-10 rounded-full flex-shrink-0", aqiBg(d.aqi))} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.region}
                    {d.updatedAt && (
                      <span className="ml-1.5 opacity-60">· {fmtTime(d.updatedAt)}</span>
                    )}
                  </p>
                </div>

                {/* PM2.5 */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-muted-foreground">PM2.5</p>
                  <p className="text-xs font-bold">
                    {d.pm25 != null ? `${d.pm25}` : "–"} µg
                  </p>
                </div>

                {/* AQI badge */}
                <div className={cn(
                  "w-12 h-10 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0",
                  aqiBg(d.aqi)
                )}>
                  <span className="font-black text-sm leading-none">{d.aqi}</span>
                  <span className="text-[8px] opacity-75 mt-0.5">{aqiLabel(d.aqi)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </WeatherCard>

      {/* ── AQI Scale + Pollutant guide ── */}
      <WeatherCard>
        <WeatherCardHeader title="Thang AQI & Chỉ số ô nhiễm" icon={<AlertTriangle size={16} />} />

        <div className="space-y-1.5 mb-5">
          {[
            { range: "0–50",    level: "Tốt",             desc: "An toàn cho tất cả mọi người",                      bg: "bg-green-500"  },
            { range: "51–100",  level: "Trung bình",       desc: "Nhóm nhạy cảm nên hạn chế hoạt động mạnh ngoài trời",bg: "bg-yellow-500" },
            { range: "101–150", level: "Kém (nhóm NC)",    desc: "Trẻ em, người già, bệnh hô hấp hạn chế ra ngoài",   bg: "bg-orange-500" },
            { range: "151–200", level: "Kém",              desc: "Toàn bộ dân số bị ảnh hưởng – đeo khẩu trang N95",  bg: "bg-red-500"    },
            { range: "201–300", level: "Rất kém",          desc: "Cảnh báo khẩn cấp – hạn chế tối đa ra ngoài",       bg: "bg-purple-600" },
            { range: "300+",    level: "Nguy hại",         desc: "Nghiêm trọng – ở trong nhà, dùng máy lọc không khí",bg: "bg-rose-900"   },
          ].map(({ range, level, desc, bg }) => (
            <div key={range} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/20 transition-colors">
              <span className={`w-4 h-10 rounded-md flex-shrink-0 ${bg}`} />
              <div>
                <p className="text-sm font-bold">{range}: {level}</p>
                <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border/50">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
            Ý nghĩa các chỉ số
          </p>
          <div className="space-y-2.5">
            {[
              { id: "PM2.5", desc: "Bụi mịn < 2.5 µm — xâm nhập sâu vào phổi & tim mạch. WHO 24h ≤ 15 µg/m³" },
              { id: "PM10",  desc: "Bụi thô < 10 µm — kích ứng mắt, mũi, họng. WHO 24h ≤ 45 µg/m³" },
              { id: "O₃",    desc: "Ozone tầng thấp — tạo từ UV + NO₂ & VOC, gây ho & khó thở" },
              { id: "NO₂",   desc: "Khí thải giao thông & nhà máy nhiệt điện — viêm đường hô hấp" },
              { id: "SO₂",   desc: "Đốt than, dầu — tiền chất PM2.5, gây mưa axit & kích ứng phổi" },
              { id: "CO",    desc: "Khí thải xe cộ — cạnh tranh oxy trong máu, nguy hiểm trong không gian kín" },
            ].map(({ id, desc }) => (
              <div key={id} className="flex gap-2 text-xs leading-relaxed">
                <span className="font-black text-primary w-12 flex-shrink-0">{id}</span>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/40 leading-relaxed">
          * AQI chuẩn US EPA. Dữ liệu real-time từ <strong>AQICN · waqi.info</strong>.
          Tự động làm mới mỗi 10 phút.
        </p>
      </WeatherCard>
    </div>
  );
}
