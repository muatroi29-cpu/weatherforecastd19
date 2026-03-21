"use client";

import { useWeather } from "@/lib/weather-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { WeatherIcon } from "@/components/weather-icons";
import { Brain, TrendingUp, Droplets, ChevronRight, Sparkles } from "lucide-react";
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

export function ForecastScreen() {
  const { hourlyForecast, dailyForecast, currentWeather } = useWeather();

  // Prepare chart data
  const chartData = hourlyForecast.slice(0, 24).map((hour, index) => ({
    time: hour.time,
    temperature: hour.temperature,
    humidity: hour.humidity,
    precipitation: hour.precipitation,
  }));

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-500 bg-green-500/10";
    if (confidence >= 70) return "text-yellow-500 bg-yellow-500/10";
    return "text-orange-500 bg-orange-500/10";
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Dự báo AI</h1>
          <p className="text-sm text-muted-foreground">Phân tích thông minh cho {currentWeather.location}</p>
        </div>
      </div>

      {/* AI Confidence Badge */}
      <WeatherCard className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="text-primary" size={24} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Độ tin cậy dự báo hôm nay</p>
            <p className="text-sm text-muted-foreground">Dựa trên dữ liệu khí tượng thực tế</p>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-full font-bold",
            getConfidenceColor(dailyForecast[0]?.confidence || 95)
          )}>
            {dailyForecast[0]?.confidence || 95}%
          </div>
        </div>
      </WeatherCard>

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
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
                tickFormatter={(value) => `${value}°`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value}°C`, 'Nhiệt độ']}
              />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#tempGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </WeatherCard>

      {/* Precipitation Chart */}
      <WeatherCard>
        <WeatherCardHeader 
          title="Xác suất mưa 24 giờ" 
          icon={<Droplets size={16} />} 
        />
        <div className="h-32 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
                formatter={(value: number) => [`${value}%`, 'Xác suất mưa']}
              />
              <Line
                type="monotone"
                dataKey="precipitation"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </WeatherCard>

      {/* 7-Day Forecast */}
      <WeatherCard>
        <WeatherCardHeader 
          title="Dự báo 7 ngày tới" 
          icon={<Brain size={16} />} 
        />
        <div className="space-y-2">
          {dailyForecast.map((day, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl transition-colors",
                index === 0 && "bg-primary/5"
              )}
            >
              <div className="w-20">
                <p className="font-medium text-sm">{day.dayName}</p>
                <p className="text-xs text-muted-foreground">{day.date}</p>
              </div>
              
              <WeatherIcon condition={day.condition} size={28} className="mx-2" />
              
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm text-blue-500 flex items-center gap-1">
                  <Droplets size={12} />
                  {day.precipitation}%
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-semibold">{day.tempMax}°</span>
                <span className="text-muted-foreground">{day.tempMin}°</span>
              </div>

              <div className={cn(
                "px-2 py-1 rounded-lg text-xs font-medium",
                getConfidenceColor(day.confidence)
              )}>
                {day.confidence}%
              </div>

              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          ))}
        </div>
      </WeatherCard>

      {/* AI Insight */}
      <WeatherCard className="bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Brain className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Phân tích AI</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dự báo cho thấy xu hướng thời tiết ổn định trong 3 ngày tới với nhiệt độ dao động từ 22-31°C. 
              Có khả năng mưa vào cuối tuần với xác suất khoảng 65-80%. 
              Khuyến nghị lên kế hoạch hoạt động ngoài trời vào đầu tuần.
            </p>
          </div>
        </div>
      </WeatherCard>
    </div>
  );
}
