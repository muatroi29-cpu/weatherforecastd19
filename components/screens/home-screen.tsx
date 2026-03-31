"use client";

import { useWeather } from "@/lib/weather-context";
import { useAuth } from "@/lib/auth-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { WeatherIcon, getWeatherGradient } from "@/components/weather-icons";
import { LocationSelector } from "@/components/location-selector";
import { ThemeToggleCompact } from "@/components/theme-toggle";
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  Sun,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeScreen() {
  const { currentWeather, hourlyForecast, dailyAqiForecast, isLoading, refreshWeather } = useWeather();
  const { user } = useAuth();

  // ── Unit converters ────────────────────────────────────────────
  const convertTemp = (c: number) =>
    user?.preferences.temperatureUnit === 'fahrenheit' ? Math.round(c * 9 / 5 + 32) : c;
  const tempUnit = () => user?.preferences.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  const convertWind = (kmh: number) => {
    switch (user?.preferences.windSpeedUnit) {
      case 'mph': return Math.round(kmh * 0.621371);
      case 'ms':  return Math.round(kmh / 3.6);
      default:    return kmh;
    }
  };
  const windUnit = () => {
    switch (user?.preferences.windSpeedUnit) {
      case 'mph': return 'mph';
      case 'ms':  return 'm/s';
      default:    return 'km/h';
    }
  };

  const convertPressure = (hpa: number) =>
    user?.preferences.pressureUnit === 'mmhg' ? Math.round(hpa * 0.75006).toString() : hpa.toString();
  const pressureUnit = () => user?.preferences.pressureUnit === 'mmhg' ? 'mmHg' : 'hPa';

  // ── AQI helpers ────────────────────────────────────────────────
  const getAQIBg   = (aqi: number) => {
    if (aqi <= 50)  return "bg-green-500";
    if (aqi <= 100) return "bg-yellow-500";
    if (aqi <= 150) return "bg-orange-500";
    if (aqi <= 200) return "bg-red-500";
    if (aqi <= 300) return "bg-purple-500";
    return "bg-rose-900";
  };
  const getAQIText = (aqi: number) => {
    if (aqi <= 50)  return "text-green-500";
    if (aqi <= 100) return "text-yellow-600";
    if (aqi <= 150) return "text-orange-500";
    if (aqi <= 200) return "text-red-500";
    if (aqi <= 300) return "text-purple-500";
    return "text-rose-900";
  };
  const getAQILabel = (aqi: number) => {
    if (aqi <= 50)  return "Tốt";
    if (aqi <= 100) return "TB";
    if (aqi <= 150) return "Kém";
    if (aqi <= 200) return "Xấu";
    if (aqi <= 300) return "Rất xấu";
    return "Nguy hại";
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up')   return <TrendingUp   size={12} className="text-red-500" />;
    if (trend === 'down') return <TrendingDown size={12} className="text-green-500" />;
    return <Minus size={12} className="text-muted-foreground" />;
  };

  // Trend summary text for the AQI forecast card
  const bestDay  = dailyAqiForecast.reduce((a, b) => a.aqi < b.aqi ? a : b, dailyAqiForecast[0]);
  const worstDay = dailyAqiForecast.reduce((a, b) => a.aqi > b.aqi ? a : b, dailyAqiForecast[0]);

  return (
    <div className="space-y-4 pb-24">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <LocationSelector />
        <div className="flex items-center gap-2">
          <button
            onClick={refreshWeather}
            disabled={isLoading}
            className="p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={cn("text-muted-foreground", isLoading && "animate-spin")} />
          </button>
          <ThemeToggleCompact />
        </div>
      </div>

      {/* ── Main Weather Card ── */}
      <WeatherCard className={cn(
        "relative overflow-hidden bg-gradient-to-br text-white",
        getWeatherGradient(currentWeather.condition)
      )}>
        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1">{currentWeather.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-7xl font-light tracking-tight">
                {convertTemp(currentWeather.temperature)}{tempUnit()}
              </p>
              <p className="text-white/70 text-sm mt-1">
                Cảm giác như {convertTemp(currentWeather.feelsLike)}{tempUnit()}
              </p>
            </div>
            <WeatherIcon condition={currentWeather.condition} size={80} animated className="drop-shadow-lg" />
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Thermometer size={14} />
              Cao: {convertTemp(currentWeather.temperature + 3)}{tempUnit()}
            </span>
            <span className="flex items-center gap-1">
              <Thermometer size={14} />
              Thấp: {convertTemp(currentWeather.temperature - 5)}{tempUnit()}
            </span>
          </div>
        </div>
      </WeatherCard>

      {/* ── Current AQI Card ── */}
      <WeatherCard>
        <WeatherCardHeader title="Chất lượng không khí" icon={<Wind size={16} />} />
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl",
            getAQIBg(currentWeather.aqi)
          )}>
            {currentWeather.aqi}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">{currentWeather.aqiDescription}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentWeather.aqi <= 100
                ? "Phù hợp cho các hoạt động ngoài trời"
                : "Nhóm nhạy cảm nên hạn chế hoạt động ngoài trời"}
            </p>
          </div>
        </div>
        {/* AQI Scale */}
        <div className="mt-4">
          <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 via-red-500 via-purple-500 to-rose-900" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300+</span>
          </div>
        </div>
      </WeatherCard>

      {/* ── AQI 7-day Forecast (real data) ── */}
      <WeatherCard>
        <WeatherCardHeader title="Dự báo chất lượng không khí 7 ngày" icon={<Calendar size={16} />} />
        <p className="text-sm text-muted-foreground mb-4">
          Chỉ số AQI dự báo tại {currentWeather.location}
        </p>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {dailyAqiForecast.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center gap-2 min-w-[70px] py-3 px-3 rounded-2xl transition-colors",
                i === 0 ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/30"
              )}
            >
              <span className="text-xs font-medium text-muted-foreground">{item.day}</span>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                getAQIBg(item.aqi)
              )}>
                {item.aqi}
              </div>
              <div className="flex items-center gap-1">
                <TrendIcon trend={item.trend} />
                <span className={cn("text-xs font-medium", getAQIText(item.aqi))}>
                  {getAQILabel(item.aqi)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 rounded-xl bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Wind size={16} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Nhận xét xu hướng</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {bestDay && worstDay ? (
                  <>
                    Chất lượng không khí tốt nhất vào <strong>{bestDay.day}</strong> (AQI&nbsp;{bestDay.aqi}).
                    {worstDay.day !== bestDay.day && (
                      <> Xấu nhất vào <strong>{worstDay.day}</strong> (AQI&nbsp;{worstDay.aqi}).{' '}</>
                    )}
                    {currentWeather.aqi > 100
                      ? 'Nhóm nhạy cảm nên theo dõi và hạn chế ra ngoài những ngày chỉ số cao.'
                      : 'Nhìn chung tuần này không khí ở mức chấp nhận được.'}
                  </>
                ) : 'Đang cập nhật dữ liệu dự báo...'}
              </p>
            </div>
          </div>
        </div>
      </WeatherCard>

      {/* ── Hourly Forecast ── */}
      <WeatherCard>
        <WeatherCardHeader title="Dự báo theo giờ" icon={<Sun size={16} />} />
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {hourlyForecast.slice(0, 12).map((hour, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center gap-2 min-w-[60px] py-3 px-2 rounded-2xl transition-colors",
                i === 0 && "bg-primary/10"
              )}
            >
              <span className="text-xs text-muted-foreground">{hour.time}</span>
              <WeatherIcon condition={hour.condition} size={24} />
              <span className="font-semibold">{convertTemp(hour.temperature)}{tempUnit()}</span>
              {hour.precipitation > 0 && (
                <span className="text-xs text-blue-500 flex items-center gap-0.5">
                  <Droplets size={10} />{hour.precipitation}%
                </span>
              )}
            </div>
          ))}
        </div>
      </WeatherCard>

      {/* ── Detail Grid ── */}
      <div className="grid grid-cols-2 gap-3">
        <WeatherCard className="flex flex-col">
          <WeatherCardHeader title="Độ ẩm" icon={<Droplets size={16} />} />
          <p className="text-3xl font-semibold">{currentWeather.humidity}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentWeather.humidity > 70 ? "Độ ẩm cao" : "Độ ẩm trung bình"}
          </p>
        </WeatherCard>

        <WeatherCard className="flex flex-col">
          <WeatherCardHeader title="Gió" icon={<Wind size={16} />} />
          <p className="text-3xl font-semibold">
            {convertWind(currentWeather.windSpeed)}{" "}
            <span className="text-lg">{windUnit()}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">{currentWeather.windDirection}</p>
        </WeatherCard>

        <WeatherCard className="flex flex-col">
          <WeatherCardHeader title="Tầm nhìn" icon={<Eye size={16} />} />
          <p className="text-3xl font-semibold">{currentWeather.visibility} <span className="text-lg">km</span></p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentWeather.visibility >= 10 ? "Tầm nhìn tốt" : "Tầm nhìn hạn chế"}
          </p>
        </WeatherCard>

        <WeatherCard className="flex flex-col">
          <WeatherCardHeader title="Áp suất" icon={<Gauge size={16} />} />
          <p className="text-3xl font-semibold">{convertPressure(currentWeather.pressure)}</p>
          <p className="text-sm text-muted-foreground mt-1">{pressureUnit()}</p>
        </WeatherCard>

        <WeatherCard className="flex flex-col">
          <WeatherCardHeader title="Chỉ số UV" icon={<Sun size={16} />} />
          <p className="text-3xl font-semibold">{currentWeather.uvIndex}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentWeather.uvIndex <= 2 ? "Thấp"
              : currentWeather.uvIndex <= 5 ? "Trung bình"
              : currentWeather.uvIndex <= 7 ? "Cao"
              : "Rất cao"}
          </p>
        </WeatherCard>

        <WeatherCard className="flex flex-col">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Sunrise size={16} />
            <span className="text-xs uppercase tracking-wide">Mặt trời</span>
          </div>
          <div className="flex items-center gap-1">
            <Sunrise size={14} className="text-orange-400" />
            <span className="font-semibold">{currentWeather.sunrise}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Sunset size={14} className="text-orange-600" />
            <span className="font-semibold">{currentWeather.sunset}</span>
          </div>
        </WeatherCard>
      </div>
    </div>
  );
}
