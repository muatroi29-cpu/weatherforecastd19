"use client";

import { useState, useEffect, useCallback } from "react";
import { useWeather } from "@/lib/weather-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { WeatherIcon } from "@/components/weather-icons";
import { Brain, TrendingUp, Droplets, ChevronRight, Loader2, RefreshCw, Wind, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from "recharts";

// ── Open-Meteo helpers ──────────────────────────────────────────
function omCodeToCondition(code: number): string {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if (code >= 45 && code <= 48) return "foggy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code >= 80 && code <= 99) return "stormy";
  return "cloudy";
}

function omCodeToDesc(code: number): string {
  if (code === 0) return "Trời quang đãng";
  if (code === 1) return "Hầu như quang đãng";
  if (code === 2) return "Có mây rải rác";
  if (code === 3) return "Trời âm u";
  if (code >= 45 && code <= 48) return "Sương mù";
  if (code >= 51 && code <= 55) return "Mưa phùn";
  if (code >= 61 && code <= 65) return "Mưa";
  if (code >= 80 && code <= 82) return "Mưa rào";
  if (code >= 95 && code <= 99) return "Giông bão";
  return "Có mây";
}

function getDayName(index: number): string {
  if (index === 0) return "Hôm nay";
  if (index === 1) return "Ngày mai";
  const d = new Date();
  d.setDate(d.getDate() + index);
  return d.toLocaleDateString("vi-VN", { weekday: "long" });
}

function getDayShort(dateStr: string, index: number): string {
  if (index === 0) return "Hôm nay";
  if (index === 1) return "Mai";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { weekday: "short" })
    .replace("Thứ ", "T")
    .replace("Chủ nhật", "CN");
}

interface HourlyPoint {
  time: string;
  temperature: number;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

interface DailyPoint {
  date: string;
  dayName: string;
  dayShort: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  precipitation: number;
  desc: string;
}

interface OmData {
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  fetchedAt: Date;
}

// ── Component ───────────────────────────────────────────────────
export function ForecastScreen() {
  const { selectedLocation, currentWeather } = useWeather();
  const [data, setData]       = useState<OmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchOpenMeteo = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}&longitude=${lon}` +
        `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weathercode,windspeed_10m` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&timezone=Asia%2FHo_Chi_Minh&forecast_days=7`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Open-Meteo error");
      const json = await res.json();

      // --- hourly: pick next 24 h starting from current hour ---
      const nowHour = new Date().getHours();
      const todayStr = new Date().toISOString().slice(0, 10);
      const startIdx = json.hourly.time.findIndex(
        (t: string) => t.startsWith(todayStr) && parseInt(t.slice(11, 13)) >= nowHour
      );
      const base = startIdx >= 0 ? startIdx : 0;
      const hourlySlice = json.hourly.time.slice(base, base + 24);

      const hourly: HourlyPoint[] = hourlySlice.map((t: string, i: number) => {
        const idx = base + i;
        const date = new Date(t);
        return {
          time:          i === 0 ? "Bây giờ" : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          temperature:   Math.round(json.hourly.temperature_2m[idx] ?? 0),
          precipitation: json.hourly.precipitation_probability[idx] ?? 0,
          humidity:      json.hourly.relative_humidity_2m[idx] ?? 0,
          windSpeed:     Math.round(json.hourly.windspeed_10m[idx] ?? 0),
        };
      });

      // --- daily: 7 days ---
      const daily: DailyPoint[] = json.daily.time.map((dateStr: string, i: number) => ({
        date:        dateStr,
        dayName:     getDayName(i),
        dayShort:    getDayShort(dateStr, i),
        tempMax:     Math.round(json.daily.temperature_2m_max[i] ?? 0),
        tempMin:     Math.round(json.daily.temperature_2m_min[i] ?? 0),
        condition:   omCodeToCondition(json.daily.weathercode[i] ?? 0),
        precipitation: json.daily.precipitation_probability_max[i] ?? 0,
        desc:        omCodeToDesc(json.daily.weathercode[i] ?? 0),
      }));

      setData({ hourly, daily, fetchedAt: new Date() });
    } catch (e) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpenMeteo(selectedLocation.lat, selectedLocation.lon);
  }, [selectedLocation.lat, selectedLocation.lon, fetchOpenMeteo]);

  // chart data: every 3 hours label, all 24 points rendered
  const chartData = (data?.hourly ?? []).map((h, i) => ({
    time:          i % 3 === 0 ? h.time : "",
    temperature:   h.temperature,
    precipitation: h.precipitation,
    humidity:      h.humidity,
    windSpeed:     h.windSpeed,
  }));

  const avgTemp = data
    ? Math.round(data.hourly.reduce((s, h) => s + h.temperature, 0) / data.hourly.length)
    : null;
  const maxTemp = data ? Math.max(...data.hourly.map(h => h.temperature)) : null;
  const minTemp = data ? Math.min(...data.hourly.map(h => h.temperature)) : null;
  const maxRain = data ? Math.max(...data.hourly.map(h => h.precipitation)) : null;

  // AI insight text derived from real data
  const aiInsight = () => {
    if (!data) return "";
    const rainyDays  = data.daily.filter(d => d.precipitation >= 50).length;
    const sunnyDays  = data.daily.filter(d => d.condition === "sunny" || d.condition === "partly-cloudy").length;
    const bestDay    = [...data.daily].sort((a, b) => a.precipitation - b.precipitation)[0];
    const worstDay   = [...data.daily].sort((a, b) => b.precipitation - a.precipitation)[0];
    const tempRange  = `${Math.min(...data.daily.map(d => d.tempMin))}–${Math.max(...data.daily.map(d => d.tempMax))}°C`;

    let text = `Nhiệt độ tuần này dao động ${tempRange}. `;
    if (rainyDays >= 4) {
      text += `Phần lớn các ngày có mưa (${rainyDays}/7 ngày), hãy chuẩn bị áo mưa khi ra ngoài. `;
    } else if (rainyDays === 0) {
      text += `Tuần này không có mưa, thời tiết khô ráo thuận lợi cho hoạt động ngoài trời. `;
    } else {
      text += `Có ${rainyDays} ngày khả năng mưa, ${sunnyDays} ngày quang đãng. `;
    }
    text += `Thời điểm lý tưởng nhất để ra ngoài là ${bestDay.dayName} (${bestDay.desc}, mưa ${bestDay.precipitation}%). `;
    if (worstDay.precipitation >= 60) {
      text += `Lưu ý hạn chế di chuyển vào ${worstDay.dayName} do xác suất mưa cao (${worstDay.precipitation}%).`;
    }
    return text;
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading && !data) {
    return (
      <div className="space-y-4 pb-24">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="text-primary" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Dự báo AI</h1>
            <p className="text-sm text-muted-foreground">Đang tải dữ liệu từ Open-Meteo...</p>
          </div>
        </div>
        <WeatherCard className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-sm text-muted-foreground">Đang phân tích dữ liệu khí tượng...</p>
        </WeatherCard>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="text-primary" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Dự báo AI</h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `${currentWeather.location} • Cập nhật ${data.fetchedAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
              : currentWeather.location}
          </p>
        </div>
        <button
          onClick={() => fetchOpenMeteo(selectedLocation.lat, selectedLocation.lon)}
          disabled={loading}
          className="p-2 rounded-full bg-card/80 hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={cn("text-muted-foreground", loading && "animate-spin")} />
        </button>
      </div>

      {error && (
        <WeatherCard className="bg-red-500/10 border-red-500/20">
          <p className="text-sm text-red-500 text-center">{error}</p>
        </WeatherCard>
      )}

      {/* ── Summary Stats ── */}
      {data && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "TB hôm nay", value: `${avgTemp}°`, icon: <Thermometer size={14} className="text-orange-400" /> },
            { label: "Cao nhất",   value: `${maxTemp}°`, icon: <TrendingUp   size={14} className="text-red-400" /> },
            { label: "Thấp nhất",  value: `${minTemp}°`, icon: <TrendingUp   size={14} className="text-blue-400 rotate-180" /> },
            { label: "Mưa tối đa", value: `${maxRain}%`, icon: <Droplets     size={14} className="text-blue-500" /> },
          ].map(({ label, value, icon }) => (
            <WeatherCard key={label} className="flex flex-col items-center py-3 px-1 gap-1">
              {icon}
              <span className="font-bold text-base">{value}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
            </WeatherCard>
          ))}
        </div>
      )}

      {/* ── 24h Temperature Chart ── */}
      <WeatherCard>
        <WeatherCardHeader title="Nhiệt độ 24 giờ tới" icon={<TrendingUp size={16} />} />
        <div className="h-48 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--foreground))", opacity: 0.65 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--foreground))", opacity: 0.65 }} tickLine={false} axisLine={false}
                domain={["dataMin - 1", "dataMax + 1"]} tickFormatter={v => `${v}°`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "2px solid #ef4444", borderRadius: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))", fontSize: 11 }}
                formatter={(v: number) => [`${v}°C`, "Nhiệt độ"]}
              />
              <Area type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2.5}
                fill="url(#tempGrad)" dot={false} activeDot={{ r: 5, fill: "#ef4444" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </WeatherCard>

      {/* ── 24h Precipitation Bar Chart ── */}
      <WeatherCard>
        <WeatherCardHeader title="Xác suất mưa 24 giờ tới" icon={<Droplets size={16} />} />
        <div className="h-36 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--foreground))", opacity: 0.65 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--foreground))", opacity: 0.65 }} tickLine={false} axisLine={false}
                domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "2px solid #3b82f6", borderRadius: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))", fontSize: 11 }}
                formatter={(v: number) => [`${v}%`, "Xác suất mưa"]}
              />
              <Bar dataKey="precipitation" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </WeatherCard>

      {/* ── 24h Humidity & Wind Line ── */}
      <WeatherCard>
        <WeatherCardHeader title="Độ ẩm & Tốc độ gió 24 giờ" icon={<Wind size={16} />} />
        <div className="h-44 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--foreground))", opacity: 0.65 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="hum" tick={{ fontSize: 10, fill: "#06b6d4", opacity: 0.8 }} tickLine={false} axisLine={false}
                domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <YAxis yAxisId="wind" orientation="right" tick={{ fontSize: 10, fill: "#f59e0b", opacity: 0.8 }} tickLine={false} axisLine={false}
                tickFormatter={v => `${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))", fontSize: 11 }}
                formatter={(v: number, name: string) =>
                  name === "humidity" ? [`${v}%`, "Độ ẩm"] : [`${v} km/h`, "Tốc độ gió"]
                }
              />
              <Line yAxisId="hum"  type="monotone" dataKey="humidity"  stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line yAxisId="wind" type="monotone" dataKey="windSpeed" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 mt-2 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-4 h-0.5 bg-cyan-500 inline-block" /> Độ ẩm (%)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-4 h-0.5 bg-amber-500 inline-block border-dashed border-b border-amber-500" /> Gió (km/h)
          </span>
        </div>
      </WeatherCard>

      {/* ── 7-Day Daily Forecast ── */}
      <WeatherCard>
        <WeatherCardHeader title="Dự báo 7 ngày tới" icon={<Brain size={16} />} />
        <div className="space-y-1">
          {(data?.daily ?? []).map((day, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-colors",
                i === 0 && "bg-primary/5"
              )}
            >
              <div className="w-24 flex-shrink-0">
                <p className="font-medium text-sm">{day.dayName}</p>
                <p className="text-xs text-muted-foreground">{day.desc}</p>
              </div>

              <WeatherIcon condition={day.condition} size={26} className="mx-1 flex-shrink-0" />

              <div className="flex-1 flex items-center gap-1.5">
                <Droplets size={12} className="text-blue-400" />
                <span className="text-xs text-blue-500 font-medium">{day.precipitation}%</span>
              </div>

              {/* Temp bar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-400 font-medium w-8 text-right">{day.tempMin}°</span>
                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-red-400"
                    style={{
                      marginLeft: `${Math.max(0, ((day.tempMin - (minTemp ?? 20)) / Math.max(1, (maxTemp ?? 35) - (minTemp ?? 20))) * 100)}%`,
                      width: `${Math.max(8, ((day.tempMax - day.tempMin) / Math.max(1, (maxTemp ?? 35) - (minTemp ?? 20))) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-red-400 font-medium w-8">{day.tempMax}°</span>
              </div>

              <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </WeatherCard>

      {/* ── AI Insight (derived from real data) ── */}
      <WeatherCard className="bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Brain className="text-primary" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">Phân tích AI</h3>
              {data && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Open-Meteo • Realtime
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data ? aiInsight() : "Đang phân tích..."}
            </p>
          </div>
        </div>
      </WeatherCard>

    </div>
  );
}
