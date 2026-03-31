"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { WeatherData, HourlyForecast, DailyForecast } from './types';
import { mockWeatherData, mockHourlyForecast, mockDailyForecast, popularLocations } from './mock-data';
import { pm25ToAqi, epaIndexToAqi } from './aqi-utils';

export interface DailyAqiForecast {
  day: string;
  aqi: number;
  pm25: number;
  trend: 'up' | 'down' | 'stable';
}

interface WeatherContextType {
  currentWeather: WeatherData;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  dailyAqiForecast: DailyAqiForecast[];
  isLoading: boolean;
  error: string | null;
  selectedLocation: { name: string; lat: number; lon: number };
  setSelectedLocation: (location: { name: string; lat: number; lon: number }) => void;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

// ── Helpers ────────────────────────────────────────────────────────────────

function getAQILevel(aqi: number): WeatherData['aqiLevel'] {
  if (aqi <= 50)  return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
}

function getAQIDescription(aqi: number): string {
  if (aqi <= 50)  return 'Chất lượng không khí tốt';
  if (aqi <= 100) return 'Chất lượng không khí trung bình';
  if (aqi <= 150) return 'Không tốt cho nhóm nhạy cảm';
  if (aqi <= 200) return 'Chất lượng không khí không tốt';
  if (aqi <= 300) return 'Chất lượng không khí rất xấu';
  return 'Chất lượng không khí nguy hại';
}

function getCondition(code: number, isDay: number): WeatherData['condition'] {
  if (code === 1000) return isDay ? 'sunny' : 'partly-cloudy';
  if (code === 1003) return 'partly-cloudy';
  if (code === 1006 || code === 1009) return 'cloudy';
  if (code === 1030 || code === 1135 || code === 1147) return 'foggy';
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'stormy';
  if ([1066,1069,1072,1114,1117,1204,1207,1210,1213,1216,
       1219,1222,1225,1237,1249,1252,1255,1258,1261,1264].includes(code)) return 'snowy';
  if ([1063,1150,1153,1168,1171,1180,1183,1186,1189,1192,
       1195,1198,1201,1240,1243,1246].includes(code)) return 'rainy';
  return 'cloudy';
}

function getWindDirectionVi(dir: string): string {
  const map: Record<string, string> = {
    N:'Bắc', NNE:'Bắc Đông Bắc', NE:'Đông Bắc', ENE:'Đông Đông Bắc',
    E:'Đông', ESE:'Đông Đông Nam', SE:'Đông Nam', SSE:'Nam Đông Nam',
    S:'Nam', SSW:'Nam Tây Nam', SW:'Tây Nam', WSW:'Tây Tây Nam',
    W:'Tây', WNW:'Tây Tây Bắc', NW:'Tây Bắc', NNW:'Bắc Tây Bắc',
  };
  return map[dir] || dir;
}

function getDayShort(index: number): string {
  if (index === 0) return 'Hôm nay';
  if (index === 1) return 'Mai';
  const d = new Date();
  d.setDate(d.getDate() + index);
  const names = ['CN','T2','T3','T4','T5','T6','T7'];
  return names[d.getDay()];
}

function getDayFull(index: number): string {
  if (index === 0) return 'Hôm nay';
  const d = new Date();
  d.setDate(d.getDate() + index);
  return d.toLocaleDateString('vi-VN', { weekday: 'long' });
}

/**
 * Tính AQI đại diện cho một ngày từ dữ liệu giờ.
 * Ưu tiên dùng PM2.5 → nếu không có thì dùng EPA index.
 * Lấy trung bình ban ngày (6h–22h) để phản ánh thực tế sinh hoạt.
 */
function calcDailyAqi(hours: any[]): { aqi: number; pm25: number } {
  const daytime = hours.filter((h: any) => {
    const hr = new Date(h.time).getHours();
    return hr >= 6 && hr <= 22;
  });
  const src = daytime.length >= 4 ? daytime : hours;

  // PM2.5 path (chuẩn nhất)
  const pm25Vals = src
    .map((h: any) => h.air_quality?.pm2_5)
    .filter((v: any) => typeof v === 'number' && !isNaN(v) && v >= 0);

  if (pm25Vals.length >= 3) {
    const avg = pm25Vals.reduce((a: number, b: number) => a + b, 0) / pm25Vals.length;
    return { aqi: pm25ToAqi(avg), pm25: Math.round(avg * 10) / 10 };
  }

  // EPA fallback
  const epaVals = src
    .map((h: any) => h.air_quality?.['us-epa-index'])
    .filter((v: any) => typeof v === 'number' && !isNaN(v) && v >= 1);

  if (epaVals.length >= 1) {
    const avgEpa = epaVals.reduce((a: number, b: number) => a + b, 0) / epaVals.length;
    return { aqi: epaIndexToAqi(Math.round(avgEpa)), pm25: 0 };
  }

  return { aqi: 0, pm25: 0 };
}

// ── Mock fallback ─────────────────────────────────────────────────────────
const mockDailyAqi: DailyAqiForecast[] = [
  { day: 'Hôm nay', aqi: 85,  pm25: 24.2, trend: 'stable' },
  { day: 'Mai',     aqi: 92,  pm25: 26.8, trend: 'up'     },
  { day: 'T3',      aqi: 78,  pm25: 21.5, trend: 'down'   },
  { day: 'T4',      aqi: 65,  pm25: 17.1, trend: 'down'   },
  { day: 'T5',      aqi: 70,  pm25: 18.9, trend: 'up'     },
  { day: 'T6',      aqi: 88,  pm25: 25.0, trend: 'up'     },
  { day: 'T7',      aqi: 95,  pm25: 27.4, trend: 'up'     },
];

// ── Provider ──────────────────────────────────────────────────────────────
export function WeatherProvider({ children }: { children: ReactNode }) {
  const [currentWeather, setCurrentWeather]       = useState<WeatherData>(mockWeatherData);
  const [hourlyForecast, setHourlyForecast]       = useState<HourlyForecast[]>(mockHourlyForecast);
  const [dailyForecast, setDailyForecast]         = useState<DailyForecast[]>(mockDailyForecast);
  const [dailyAqiForecast, setDailyAqiForecast]   = useState<DailyAqiForecast[]>(mockDailyAqi);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [selectedLocation, setSelectedLocationState] = useState(popularLocations[0]);

  const fetchWeatherFromAPI = useCallback(async (lat: number, lon: number, locationName: string) => {
    setIsLoading(true);
    setError(null);

    const API_KEY = 'ecd27c0bc5cf4eb6a70143329263003';

    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=7&aqi=yes&alerts=no`
      );
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();

      const current      = data.current;
      const forecastDays = data.forecast?.forecastday as any[] ?? [];

      // ── Current AQI: ưu tiên PM2.5 ──────────────────────────────
      const currentPm25 = current.air_quality?.pm2_5;
      const currentEpa  = current.air_quality?.['us-epa-index'] ?? 1;
      const currentAqi  = (typeof currentPm25 === 'number' && currentPm25 >= 0)
        ? pm25ToAqi(currentPm25)
        : epaIndexToAqi(currentEpa);

      // ── Current weather ──────────────────────────────────────────
      const astro = forecastDays[0]?.astro ?? {};
      const newWeather: WeatherData = {
        location:       locationName,
        temperature:    Math.round(current.temp_c),
        feelsLike:      Math.round(current.feelslike_c),
        humidity:       current.humidity,
        windSpeed:      Math.round(current.wind_kph),
        windDirection:  getWindDirectionVi(current.wind_dir),
        pressure:       Math.round(current.pressure_mb),
        visibility:     Math.round(current.vis_km),
        uvIndex:        Math.round(current.uv),
        condition:      getCondition(current.condition.code, current.is_day),
        description:    current.condition.text,
        sunrise:        astro.sunrise ?? '05:30',
        sunset:         astro.sunset  ?? '18:30',
        aqi:            currentAqi,
        aqiLevel:       getAQILevel(currentAqi),
        aqiDescription: getAQIDescription(currentAqi),
        coordinates:    { lat, lon },
      };

      // ── Hourly forecast (next 24 h) ──────────────────────────────
      const curHour    = new Date().getHours();
      const todayHours = (forecastDays[0]?.hour ?? []) as any[];
      const tmrwHours  = (forecastDays[1]?.hour ?? []) as any[];
      const next24     = [...todayHours.slice(curHour), ...tmrwHours].slice(0, 24);

      const newHourly: HourlyForecast[] = next24.map((h: any, i: number) => ({
        time:          i === 0 ? 'Bây giờ' : new Date(h.time).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }),
        temperature:   Math.round(h.temp_c),
        condition:     getCondition(h.condition.code, h.is_day),
        humidity:      h.humidity,
        windSpeed:     Math.round(h.wind_kph),
        precipitation: h.chance_of_rain ?? 0,
      }));

      // ── 7-day daily forecast ─────────────────────────────────────
      const newDaily: DailyForecast[] = forecastDays.map((day: any, i: number) => ({
        date:          new Date(day.date).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' }),
        dayName:       getDayFull(i),
        tempMax:       Math.round(day.day.maxtemp_c),
        tempMin:       Math.round(day.day.mintemp_c),
        condition:     getCondition(day.day.condition.code, 1),
        humidity:      day.day.avghumidity,
        precipitation: day.day.daily_chance_of_rain ?? 0,
        confidence:    Math.max(60, 100 - i * 5),
      }));

      // ── Daily AQI forecast (PM2.5 average per day) ───────────────
      const aqiPerDay = forecastDays.map((day: any) => calcDailyAqi(day.hour ?? []));

      // Nếu tất cả bằng 0 (API không trả AQI trong forecast), dùng currentAqi + nhỏ biến đổi
      const hasRealAqi = aqiPerDay.some(d => d.aqi > 0);
      const newDailyAqi: DailyAqiForecast[] = aqiPerDay.map((d, i) => {
        const aqi  = hasRealAqi ? (d.aqi > 0 ? d.aqi : currentAqi) : currentAqi;
        const pm25 = d.pm25 > 0 ? d.pm25 : (typeof currentPm25 === 'number' ? Math.round(currentPm25 * 10) / 10 : 0);
        const prev = i === 0 ? aqi : aqiPerDay[i - 1].aqi || currentAqi;
        const diff = aqi - prev;
        const trend: 'up' | 'down' | 'stable' = Math.abs(diff) <= 8 ? 'stable' : diff > 0 ? 'up' : 'down';
        return { day: getDayShort(i), aqi, pm25, trend };
      });

      setCurrentWeather(newWeather);
      setHourlyForecast(newHourly);
      setDailyForecast(newDaily);
      setDailyAqiForecast(newDailyAqi);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Không thể tải dữ liệu thời tiết. Đang dùng dữ liệu mẫu.');
      setCurrentWeather({ ...mockWeatherData, location: locationName });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setSelectedLocation = useCallback((loc: { name: string; lat: number; lon: number }) => {
    setSelectedLocationState(loc);
    fetchWeatherFromAPI(loc.lat, loc.lon, loc.name);
  }, [fetchWeatherFromAPI]);

  const refreshWeather = useCallback(async () => {
    await fetchWeatherFromAPI(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
  }, [selectedLocation, fetchWeatherFromAPI]);

  return (
    <WeatherContext.Provider value={{
      currentWeather, hourlyForecast, dailyForecast, dailyAqiForecast,
      isLoading, error, selectedLocation, setSelectedLocation, refreshWeather,
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within a WeatherProvider');
  return ctx;
}
