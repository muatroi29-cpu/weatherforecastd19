"use client";

import { useWeather } from "@/lib/weather-context";
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
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dữ liệu dự báo AQI cho các ngày tiếp theo
const aqiForecast = [
  { day: "Hôm nay", aqi: 85, trend: "stable" as const },
  { day: "Mai", aqi: 92, trend: "up" as const },
  { day: "T3", aqi: 78, trend: "down" as const },
  { day: "T4", aqi: 65, trend: "down" as const },
  { day: "T5", aqi: 70, trend: "up" as const },
  { day: "T6", aqi: 88, trend: "up" as const },
  { day: "T7", aqi: 95, trend: "up" as const },
];

export function HomeScreen() {
  const { currentWeather, hourlyForecast, isLoading, refreshWeather } = useWeather();

  const getAQIColorClass = (aqi: number) => {
    if (aqi <= 50) return "bg-green-500";
    if (aqi <= 100) return "bg-yellow-500";
    if (aqi <= 150) return "bg-orange-500";
    if (aqi <= 200) return "bg-red-500";
    if (aqi <= 300) return "bg-purple-500";
    return "bg-rose-900";
  };

  const getAQITextColorClass = (aqi: number) => {
    if (aqi <= 50) return "text-green-500";
    if (aqi <= 100) return "text-yellow-600";
    if (aqi <= 150) return "text-orange-500";
    if (aqi <= 200) return "text-red-500";
    if (aqi <= 300) return "text-purple-500";
    return "text-rose-900";
  };

  const getAQILabel = (aqi: number) => {
    if (aqi <= 50) return "Tốt";
    if (aqi <= 100) return "TB";
    if (aqi <= 150) return "Kém";
    if (aqi <= 200) return "Xấu";
    if (aqi <= 300) return "Rất xấu";
    return "Nguy hại";
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") return <TrendingUp size={12} className="text-red-500" />;
    if (trend === "down") return <TrendingDown size={12} className="text-green-500" />;
    return <Minus size={12} className="text-muted-foreground" />;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
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

      {/* Main Weather Card */}
      <WeatherCard className={cn(
        "relative overflow-hidden bg-gradient-to-br text-white",
        getWeatherGradient(currentWeather.condition)
      )}>
        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1">{currentWeather.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-7xl font-light tracking-tight">
                {currentWeather.temperature}°
              </p>
              <p className="text-white/70 text-sm mt-1">
                Cảm giác như {currentWeather.feelsLike}°
              </p>
            </div>
            <WeatherIcon 
              condition={currentWeather.condition} 
              size={80} 
              animated 
              className="drop-shadow-lg"
            />
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Thermometer size={14} />
              Cao: {currentWeather.temperature + 3}°
            </span>
            <span className="flex items-center gap-1">
              <Thermometer size={14} />
              Thấp: {currentWeather.temperature - 5}°
            </span>
          </div>
        </div>
      </WeatherCard>

      {/* AQI Card */}
      <WeatherCard>
        <WeatherCardHeader title="Chất lượng không khí" icon={<Wind size={16} />} />
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl",
            getAQIColorClass(currentWeather.aqi)
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
            <span>0</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
            <span>300+</span>
          </div>
        </div>
      </WeatherCard>

      {/* AQI Forecast for Upcoming Days */}
      <WeatherCard>
        <WeatherCardHeader title="Dự báo chất lượng không khí" icon={<Calendar size={16} />} />
        <p className="text-sm text-muted-foreground mb-4">
          Dự báo AQI cho 7 ngày tới tại {currentWeather.location}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {aqiForecast.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center gap-2 min-w-[70px] py-3 px-3 rounded-2xl transition-colors",
                index === 0 ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/30"
              )}
            >
              <span className="text-xs font-medium text-muted-foreground">{item.day}</span>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                getAQIColorClass(item.aqi)
              )}>
                {item.aqi}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(item.trend)}
                <span className={cn("text-xs font-medium", getAQITextColorClass(item.aqi))}>
                  {getAQILabel(item.aqi)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* AQI Forecast Summary */}
        <div className="mt-4 p-3 rounded-xl bg-muted/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Wind size={16} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Nhận xét xu hướng</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Chất lượng không khí có xu hướng cải thiện vào giữa tuần (T3-T4) với AQI dự kiến xuống mức 65-78. 
                Cuối tuần có thể tăng nhẹ do hoạt động giao thông. Người nhạy cảm nên hạn chế ra ngoài vào T7.
              </p>
            </div>
          </div>
        </div>
      </WeatherCard>

      {/* Hourly Forecast */}
      <WeatherCard>
        <WeatherCardHeader title="Dự báo theo giờ" icon={<Sun size={16} />} />
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {hourlyForecast.slice(0, 12).map((hour, index) => (
            <div 
              key={index} 
              className={cn(
                "flex flex-col items-center gap-2 min-w-[60px] py-3 px-2 rounded-2xl transition-colors",
                index === 0 && "bg-primary/10"
              )}
            >
              <span className="text-xs text-muted-foreground">{hour.time}</span>
              <WeatherIcon condition={hour.condition} size={24} />
              <span className="font-semibold">{hour.temperature}°</span>
              {hour.precipitation > 0 && (
                <span className="text-xs text-blue-500 flex items-center gap-0.5">
                  <Droplets size={10} />
                  {hour.precipitation}%
                </span>
              )}
            </div>
          ))}
        </div>
      </WeatherCard>

      {/* Weather Details Grid */}
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
          <p className="text-3xl font-semibold">{currentWeather.windSpeed} <span className="text-lg">km/h</span></p>
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
          <p className="text-3xl font-semibold">{currentWeather.pressure}</p>
          <p className="text-sm text-muted-foreground mt-1">hPa</p>
        </WeatherCard>

        <WeatherCard className="flex flex-col">
          <WeatherCardHeader title="Chỉ số UV" icon={<Sun size={16} />} />
          <p className="text-3xl font-semibold">{currentWeather.uvIndex}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentWeather.uvIndex <= 2 ? "Thấp" : 
             currentWeather.uvIndex <= 5 ? "Trung bình" : 
             currentWeather.uvIndex <= 7 ? "Cao" : "Rất cao"}
          </p>
        </WeatherCard>

        <WeatherCard className="flex flex-col">
          <div className="flex items-center justify-between">
            <div>
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
            </div>
          </div>
        </WeatherCard>
      </div>
    </div>
  );
}
