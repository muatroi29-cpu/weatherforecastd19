"use client";

import { useMemo } from "react";
import { useWeather } from "@/lib/weather-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { WeatherIcon } from "@/components/weather-icons";
import { Brain, TrendingUp, Droplets, ChevronRight, Wind, Sun, Thermometer, TrendingDown, Minus } from "lucide-react";
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
} from "recharts";

// ── Helpers ────────────────────────────────────────────────────────────────
function getTempTrendLabel(daily: ReturnType<typeof useWeather>['dailyForecast']): string {
  if (daily.length < 2) return 'ổn định';
  const first = daily[0].tempMax;
  const last  = daily[daily.length - 1].tempMax;
  if (last - first >=  2) return 'tăng dần';
  if (first - last >=  2) return 'giảm dần';
  return 'ổn định';
}

function getAqiTrendLabel(aqis: { aqi: number }[]): string {
  if (aqis.length === 0) return 'trung bình';
  const avg = aqis.reduce((s, d) => s + d.aqi, 0) / aqis.length;
  if (avg <= 50)  return 'tốt';
  if (avg <= 100) return 'trung bình';
  if (avg <= 150) return 'kém';
  return 'xấu';
}

function buildAiInsight(
  daily:  ReturnType<typeof useWeather>['dailyForecast'],
  aqi:    ReturnType<typeof useWeather>['dailyAqiForecast'],
  hourly: ReturnType<typeof useWeather>['hourlyForecast'],
  current: ReturnType<typeof useWeather>['currentWeather'],
): string {
  if (!daily.length) return 'Đang phân tích dữ liệu thời tiết...';

  const tempMin = Math.min(...daily.map(d => d.tempMin));
  const tempMax = Math.max(...daily.map(d => d.tempMax));
  const trend   = getTempTrendLabel(daily);
  const aqiLabel = getAqiTrendLabel(aqi);

  const rainyDays = daily.filter(d => d.precipitation >= 50);
  const bestDay   = daily.find(d => d.precipitation < 30 && d.tempMax <= 34 && d.tempMax >= 22);
  const worstDay  = [...daily].sort((a, b) => b.precipitation - a.precipitation)[0];

  const next6hRain = hourly.slice(0, 6).some(h => h.precipitation >= 40);

  let insight = '';

  // Intro: nhiệt độ
  insight += `Nhiệt độ tuần này dao động ${tempMin}–${tempMax}°C, xu hướng ${trend}. `;

  // Cảnh báo mưa gần
  if (next6hRain) {
    insight += `⚠️ Có khả năng mưa trong 6 giờ tới – mang theo ô. `;
  }

  // Tổng quan mưa tuần
  if (rainyDays.length === 0) {
    insight += 'Không có ngày nào xác suất mưa vượt 50% trong tuần tới – thuận lợi cho hoạt động ngoài trời. ';
  } else if (rainyDays.length <= 2) {
    const names = rainyDays.map(d => d.dayName).join(' và ');
    insight += `Cẩn thận mưa vào ${names} (xác suất ${Math.max(...rainyDays.map(d => d.precipitation))}%). `;
  } else {
    insight += `Nhiều ngày mưa trong tuần (${rainyDays.length} ngày ≥50%), đặc biệt ${worstDay.dayName} có xác suất cao nhất (${worstDay.precipitation}%). `;
  }

  // AQI
  insight += `Chất lượng không khí tuần này ở mức ${aqiLabel}`;
  if (aqi.length > 0) {
    const bestAqiDay = [...aqi].sort((a, b) => a.aqi - b.aqi)[0];
    const worstAqiDay = [...aqi].sort((a, b) => b.aqi - a.aqi)[0];
    if (bestAqiDay.day !== worstAqiDay.day) {
      insight += ` (tốt nhất ${bestAqiDay.day}: AQI ${bestAqiDay.aqi}, xấu nhất ${worstAqiDay.day}: AQI ${worstAqiDay.aqi})`;
    }
  }
  insight += '. ';

  // Gợi ý ngày tốt nhất
  if (bestDay) {
    insight += `💡 ${bestDay.dayName} là ngày lý tưởng để hoạt động ngoài trời (${bestDay.tempMax}°C, mưa ${bestDay.precipitation}%).`;
  } else if (daily.length > 0) {
    const sortedByRain = [...daily].sort((a, b) => a.precipitation - b.precipitation);
    insight += `💡 ${sortedByRain[0].dayName} là ngày ít mưa nhất trong tuần (xác suất ${sortedByRain[0].precipitation}%).`;
  }

  return insight;
}

// ── Trend icon ─────────────────────────────────────────────────────────────
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up')   return <TrendingUp   size={12} className="text-red-500"  />;
  if (trend === 'down') return <TrendingDown size={12} className="text-green-500" />;
  return <Minus size={12} className="text-muted-foreground" />;
}

function getAqiBg(aqi: number) {
  if (aqi <= 50)  return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-rose-900";
}

function getAqiText(aqi: number) {
  if (aqi <= 50)  return "text-green-500";
  if (aqi <= 100) return "text-yellow-600";
  if (aqi <= 150) return "text-orange-600";
  if (aqi <= 200) return "text-red-600";
  return "text-purple-600";
}

function getAqiLabel(aqi: number) {
  if (aqi <= 50)  return "Tốt";
  if (aqi <= 100) return "TB";
  if (aqi <= 150) return "Kém";
  if (aqi <= 200) return "Xấu";
  return "Rất xấu";
}

// ── Component ──────────────────────────────────────────────────────────────
export function ForecastScreen() {
  const { hourlyForecast, dailyForecast, dailyAqiForecast, currentWeather } = useWeather();

  const chartData = hourlyForecast.slice(0, 24).map((hour) => ({
    time:          hour.time,
    temperature:   hour.temperature,
    humidity:      hour.humidity,
    precipitation: hour.precipitation,
  }));

  const aiInsight = useMemo(
    () => buildAiInsight(dailyForecast, dailyAqiForecast, hourlyForecast, currentWeather),
    [dailyForecast, dailyAqiForecast, hourlyForecast, currentWeather],
  );

  // Summary stats
  const tempRange = dailyForecast.length > 0 ? {
    min: Math.min(...dailyForecast.map(d => d.tempMin)),
    max: Math.max(...dailyForecast.map(d => d.tempMax)),
  } : null;
  const maxRainDay = dailyForecast.length > 0
    ? dailyForecast.reduce((a, b) => a.precipitation > b.precipitation ? a : b)
    : null;

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Dự báo AI</h1>
          <p className="text-sm text-muted-foreground">Phân tích thông minh – {currentWeather.location}</p>
        </div>
      </div>

      {/* Quick stat row */}
      {tempRange && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <Thermometer size={16} className="text-orange-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Nhiệt độ tuần</p>
            <p className="font-bold text-sm">{tempRange.min}°–{tempRange.max}°C</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <Droplets size={16} className="text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Mưa cao nhất</p>
            <p className="font-bold text-sm">{maxRainDay?.precipitation ?? 0}%</p>
            <p className="text-xs text-muted-foreground">{maxRainDay?.dayName ?? '–'}</p>
          </div>
          <div className="bg-card rounded-2xl p-3 text-center weather-card">
            <Wind size={16} className="text-teal-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">AQI hiện tại</p>
            <p className={cn("font-bold text-sm", getAqiText(currentWeather.aqi))}>{currentWeather.aqi}</p>
            <p className="text-xs text-muted-foreground">{getAqiLabel(currentWeather.aqi)}</p>
          </div>
        </div>
      )}

      {/* 24h Temperature Chart */}
      <WeatherCard>
        <WeatherCardHeader
          title="Biểu đồ nhiệt độ 24 giờ"
          icon={<TrendingUp size={16} />}
        />
        <div className="h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', opacity: 0.7 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', opacity: 0.7 }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={v => `${v}°`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '2px solid #ef4444', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,.15)' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(v: number) => [`${v}°C`, 'Nhiệt độ']}
              />
              <Area type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={3} fill="url(#tempGradient)" dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </WeatherCard>

      {/* Precipitation Chart */}
      <WeatherCard>
        <WeatherCardHeader
          title="Xác suất mưa 24 giờ tới"
          icon={<Droplets size={16} />}
        />
        <div className="h-32 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', opacity: 0.7 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', opacity: 0.7 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '2px solid #3b82f6', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,.15)' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(v: number) => [`${v}%`, 'Xác suất mưa']}
              />
              <Area type="monotone" dataKey="precipitation" stroke="#3b82f6" strokeWidth={3} fill="url(#precipGradient)" dot={{ fill: '#3b82f6', r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </WeatherCard>

      {/* 7-Day AQI Forecast */}
      {dailyAqiForecast.length > 0 && (
        <WeatherCard>
          <WeatherCardHeader
            title="AQI dự báo 7 ngày"
            icon={<Wind size={16} />}
          />
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {dailyAqiForecast.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center gap-1.5 min-w-[68px] py-3 px-2 rounded-2xl",
                  i === 0 ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/30"
                )}
              >
                <span className="text-xs font-medium text-muted-foreground">{item.day}</span>
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm", getAqiBg(item.aqi))}>
                  {item.aqi}
                </div>
                <div className="flex items-center gap-0.5">
                  <TrendIcon trend={item.trend} />
                  <span className={cn("text-[10px] font-medium", getAqiText(item.aqi))}>
                    {getAqiLabel(item.aqi)}
                  </span>
                </div>
                {item.pm25 > 0 && (
                  <span className="text-[9px] text-muted-foreground">{item.pm25}µg</span>
                )}
              </div>
            ))}
          </div>
        </WeatherCard>
      )}

      {/* 7-Day Forecast */}
      <WeatherCard>
        <WeatherCardHeader
          title="Dự báo 7 ngày tới"
          icon={<Sun size={16} />}
        />
        <div className="space-y-1">
          {dailyForecast.map((day, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-colors",
                index === 0 && "bg-primary/5"
              )}
            >
              <div className="w-20 flex-shrink-0">
                <p className="font-medium text-sm">{day.dayName}</p>
                <p className="text-xs text-muted-foreground">{day.date}</p>
              </div>

              <WeatherIcon condition={day.condition} size={26} className="mx-1 flex-shrink-0" />

              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <Droplets size={11} className="text-blue-500 flex-shrink-0" />
                <span className="text-xs text-blue-500">{day.precipitation}%</span>
                {day.precipitation >= 50 && (
                  <span className="text-xs text-blue-400">☔</span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-semibold text-sm">{day.tempMax}°</span>
                <span className="text-muted-foreground text-sm">{day.tempMin}°</span>
              </div>

              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: day.precipitation >= 70 ? '#3b82f6' :
                    day.precipitation >= 40 ? '#93c5fd' : '#d1d5db'
                }}
              />
            </div>
          ))}
        </div>
      </WeatherCard>

      {/* AI Insight – fully dynamic */}
      <WeatherCard className="bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Brain className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-1.5">
              Phân tích AI
              <span className="text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">
                Dữ liệu thực
              </span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{aiInsight}</p>
          </div>
        </div>

        {/* Mini stats from real data */}
        {dailyForecast.length > 0 && (
          <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-background/50 rounded-xl p-2.5">
              <p className="text-muted-foreground">Ngày nhiều mưa nhất</p>
              <p className="font-semibold mt-0.5">
                {[...dailyForecast].sort((a, b) => b.precipitation - a.precipitation)[0]?.dayName}
                {' '}({[...dailyForecast].sort((a, b) => b.precipitation - a.precipitation)[0]?.precipitation}%)
              </p>
            </div>
            <div className="bg-background/50 rounded-xl p-2.5">
              <p className="text-muted-foreground">Ngày nóng nhất</p>
              <p className="font-semibold mt-0.5">
                {[...dailyForecast].sort((a, b) => b.tempMax - a.tempMax)[0]?.dayName}
                {' '}({[...dailyForecast].sort((a, b) => b.tempMax - a.tempMax)[0]?.tempMax}°C)
              </p>
            </div>
            {dailyAqiForecast.length > 0 && (
              <>
                <div className="bg-background/50 rounded-xl p-2.5">
                  <p className="text-muted-foreground">AQI tốt nhất</p>
                  <p className="font-semibold mt-0.5">
                    {[...dailyAqiForecast].sort((a, b) => a.aqi - b.aqi)[0]?.day}
                    {' '}(AQI {[...dailyAqiForecast].sort((a, b) => a.aqi - b.aqi)[0]?.aqi})
                  </p>
                </div>
                <div className="bg-background/50 rounded-xl p-2.5">
                  <p className="text-muted-foreground">AQI xấu nhất</p>
                  <p className="font-semibold mt-0.5">
                    {[...dailyAqiForecast].sort((a, b) => b.aqi - a.aqi)[0]?.day}
                    {' '}(AQI {[...dailyAqiForecast].sort((a, b) => b.aqi - a.aqi)[0]?.aqi})
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </WeatherCard>
    </div>
  );
}
