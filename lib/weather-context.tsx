"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { WeatherData, HourlyForecast, DailyForecast } from './types';
import { mockWeatherData, mockHourlyForecast, mockDailyForecast, popularLocations } from './mock-data';

export interface DailyAqiForecast {
  day: string;
  aqi: number;
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

const API_KEY = 'ecd27c0bc5cf4eb6a70143329263003';

// WeatherAPI us-epa-index (1–6) → midpoint AQI value
const EPA_AQI: Record<number, number> = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 250, 6: 350 };
function epaToAqi(epa: number): number { return EPA_AQI[Math.round(epa)] ?? 50; }

function getAQILevel(aqi: number): WeatherData['aqiLevel'] {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
}

function getAQIDesc(aqi: number): string {
  if (aqi <= 50) return 'Chất lượng không khí tốt';
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
  if ([1087,1273,1276,1279,1282].includes(code)) return 'stormy';
  if ([1066,1069,1072,1114,1117,1204,1207,1210,1213,1216,
       1219,1222,1225,1237,1249,1252,1255,1258,1261,1264].includes(code)) return 'snowy';
  if ([1063,1150,1153,1168,1171,1180,1183,1186,1189,1192,
       1195,1198,1201,1240,1243,1246].includes(code)) return 'rainy';
  return 'cloudy';
}

function windDirVi(dir: string): string {
  const m: Record<string,string> = {
    N:'Bắc',NNE:'Bắc Đông Bắc',NE:'Đông Bắc',ENE:'Đông Đông Bắc',
    E:'Đông',ESE:'Đông Đông Nam',SE:'Đông Nam',SSE:'Nam Đông Nam',
    S:'Nam',SSW:'Nam Tây Nam',SW:'Tây Nam',WSW:'Tây Tây Nam',
    W:'Tây',WNW:'Tây Tây Bắc',NW:'Tây Bắc',NNW:'Bắc Tây Bắc',
  };
  return m[dir] ?? dir;
}

function dayShort(index: number): string {
  if (index === 0) return 'Hôm nay';
  if (index === 1) return 'Mai';
  const d = new Date(); d.setDate(d.getDate() + index);
  return ['CN','T2','T3','T4','T5','T6','T7'][d.getDay()];
}
function dayFull(index: number): string {
  if (index === 0) return 'Hôm nay';
  const d = new Date(); d.setDate(d.getDate() + index);
  return d.toLocaleDateString('vi-VN', { weekday: 'long' });
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [currentWeather,    setCurrentWeather]    = useState<WeatherData>(mockWeatherData);
  const [hourlyForecast,    setHourlyForecast]    = useState<HourlyForecast[]>(mockHourlyForecast);
  const [dailyForecast,     setDailyForecast]     = useState<DailyForecast[]>(mockDailyForecast);
  const [dailyAqiForecast,  setDailyAqiForecast]  = useState<DailyAqiForecast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [selectedLocation, setSelectedLocationState] = useState(popularLocations[0]);

  const fetchWeatherFromAPI = useCallback(async (lat: number, lon: number, locationName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Single WeatherAPI call: 7-day forecast + AQI per hour
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=7&aqi=yes&alerts=no`
      );
      if (!res.ok) throw new Error(`WeatherAPI ${res.status}`);
      const data = await res.json();

      const current      = data.current;
      const forecastDays = data.forecast.forecastday as any[];

      // ── Current AQI (exact from API, no rounding to midpoints) ──
      const aq        = current.air_quality ?? {};
      const epaRaw    = aq['us-epa-index'] ?? 1;
      const currentAqi = epaToAqi(epaRaw);

      // ── Weather ──────────────────────────────────────────────────
      const astro = forecastDays[0].astro;
      const newWeather: WeatherData = {
        location:       locationName,
        temperature:    Math.round(current.temp_c),
        feelsLike:      Math.round(current.feelslike_c),
        humidity:       current.humidity,
        windSpeed:      Math.round(current.wind_kph),
        windDirection:  windDirVi(current.wind_dir),
        pressure:       Math.round(current.pressure_mb),
        visibility:     Math.round(current.vis_km),
        uvIndex:        Math.round(current.uv),
        condition:      getCondition(current.condition.code, current.is_day),
        description:    current.condition.text,
        sunrise:        astro.sunrise,
        sunset:         astro.sunset,
        aqi:            currentAqi,
        aqiLevel:       getAQILevel(currentAqi),
        aqiDescription: getAQIDesc(currentAqi),
        coordinates:    { lat, lon },
      };

      // ── Hourly forecast (next 24 h) ──────────────────────────────
      const curHour    = new Date().getHours();
      const todayHours = forecastDays[0].hour as any[];
      const tmrwHours  = (forecastDays[1]?.hour ?? []) as any[];
      const next24     = [...todayHours.slice(curHour), ...tmrwHours].slice(0, 24);
      const newHourly: HourlyForecast[] = next24.map((h: any, i: number) => ({
        time:          i === 0 ? 'Bây giờ' : new Date(h.time).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }),
        temperature:   Math.round(h.temp_c),
        condition:     getCondition(h.condition.code, h.is_day),
        humidity:      h.humidity,
        windSpeed:     Math.round(h.wind_kph),
        precipitation: h.chance_of_rain,
      }));

      // ── 7-day daily forecast ─────────────────────────────────────
      const newDaily: DailyForecast[] = forecastDays.map((day: any, i: number) => ({
        date:          new Date(day.date).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' }),
        dayName:       dayFull(i),
        tempMax:       Math.round(day.day.maxtemp_c),
        tempMin:       Math.round(day.day.mintemp_c),
        condition:     getCondition(day.day.condition.code, 1),
        humidity:      day.day.avghumidity,
        precipitation: day.day.daily_chance_of_rain,
        confidence:    Math.max(60, 100 - i * 5),
      }));

      // ── Daily AQI forecast from hourly air_quality per day ───────
      // Use the MAXIMUM EPA index of each day's 24 hours (worst-case = most representative)
      const dailyAqiValues: number[] = forecastDays.map((day: any) => {
        const epas: number[] = (day.hour as any[])
          .map((h: any) => h.air_quality?.['us-epa-index'])
          .filter((v: any) => typeof v === 'number' && v >= 1);
        if (epas.length === 0) return currentAqi; // fallback to current
        // use the peak EPA of the day
        return epaToAqi(Math.max(...epas));
      });

      const newDailyAqi: DailyAqiForecast[] = dailyAqiValues.map((aqi, i) => {
        const prev = i === 0 ? aqi : dailyAqiValues[i - 1];
        const diff = aqi - prev;
        const trend: 'up' | 'down' | 'stable' =
          Math.abs(diff) <= 10 ? 'stable' : diff > 0 ? 'up' : 'down';
        return { day: dayShort(i), aqi, trend };
      });

      setCurrentWeather(newWeather);
      setHourlyForecast(newHourly);
      setDailyForecast(newDaily);
      setDailyAqiForecast(newDailyAqi);
    } catch (err) {
      console.error('WeatherAPI fetch error:', err);
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
