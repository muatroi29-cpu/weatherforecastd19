"use client";

import {
  createContext, useContext, useState, useCallback, useRef, type ReactNode,
} from 'react';
import type { WeatherData, HourlyForecast, DailyForecast } from './types';
import { mockWeatherData, mockHourlyForecast, mockDailyForecast, popularLocations } from './mock-data';
import { pm25ToAqi, epaToAqi, estimateFutureAqi } from './aqi-utils';

// ── Types ─────────────────────────────────────────────────────────────────
export interface DailyAqiForecast {
  day:      string;
  aqi:      number;
  pm25:     number;   // µg/m³, 0 nếu chỉ ước tính qua EPA
  trend:    'up' | 'down' | 'stable';
  isReal:   boolean;  // true = từ API thực, false = ước tính từ thời tiết
}

interface WeatherContextType {
  currentWeather:    WeatherData;
  hourlyForecast:    HourlyForecast[];
  dailyForecast:     DailyForecast[];
  dailyAqiForecast:  DailyAqiForecast[];
  isLoading:         boolean;
  error:             string | null;
  selectedLocation:  { name: string; lat: number; lon: number };
  setSelectedLocation: (loc: { name: string; lat: number; lon: number }) => void;
  refreshWeather:    () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);
const API_KEY = 'ecd27c0bc5cf4eb6a70143329263003';

// ── Pure helpers ──────────────────────────────────────────────────────────
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
  if ([1087,1273,1276,1279,1282].includes(code)) return 'stormy';
  if ([1066,1069,1072,1114,1117,1204,1207,1210,1213,1216,
       1219,1222,1225,1237,1249,1252,1255,1258,1261,1264].includes(code)) return 'snowy';
  if ([1063,1150,1153,1168,1171,1180,1183,1186,1189,1192,
       1195,1198,1201,1240,1243,1246].includes(code)) return 'rainy';
  return 'cloudy';
}

function getWindDirectionVi(dir: string): string {
  const m: Record<string, string> = {
    N:'Bắc', NNE:'Bắc-ĐB', NE:'Đông Bắc', ENE:'Đông-ĐB',
    E:'Đông', ESE:'Đông-ĐN', SE:'Đông Nam', SSE:'Nam-ĐN',
    S:'Nam',  SSW:'Nam-TN',  SW:'Tây Nam',  WSW:'Tây-TN',
    W:'Tây',  WNW:'Tây-TB',  NW:'Tây Bắc',  NNW:'Bắc-TB',
  };
  return m[dir] || dir;
}

function dayShort(index: number): string {
  if (index === 0) return 'Hôm nay';
  if (index === 1) return 'Mai';
  const d = new Date();
  d.setDate(d.getDate() + index);
  return ['CN','T2','T3','T4','T5','T6','T7'][d.getDay()];
}

function dayFull(index: number): string {
  if (index === 0) return 'Hôm nay';
  const d = new Date();
  d.setDate(d.getDate() + index);
  return d.toLocaleDateString('vi-VN', { weekday: 'long' });
}

// ── Lấy AQI thực từ hourly forecast (chỉ hoạt động trên plan trả phí) ────
function extractHourlyAqi(hours: any[]): { aqi: number; pm25: number } | null {
  if (!hours?.length) return null;

  const daytime = hours.filter((h: any) => {
    const hr = new Date(h.time).getHours();
    return hr >= 6 && hr <= 22;
  });
  const src = daytime.length >= 4 ? daytime : hours;

  // Thử lấy PM2.5
  const pm25s = src
    .map((h: any) => h.air_quality?.pm2_5)
    .filter((v: any): v is number => typeof v === 'number' && v >= 0);

  if (pm25s.length >= 3) {
    const avg = pm25s.reduce((a: number, b: number) => a + b, 0) / pm25s.length;
    return { aqi: pm25ToAqi(avg), pm25: Math.round(avg * 10) / 10 };
  }

  // Thử lấy EPA index
  const epas = src
    .map((h: any) => h.air_quality?.['us-epa-index'])
    .filter((v: any): v is number => typeof v === 'number' && v >= 1);

  if (epas.length >= 1) {
    const avg = epas.reduce((a: number, b: number) => a + b, 0) / epas.length;
    return { aqi: epaToAqi(Math.round(avg)), pm25: 0 };
  }

  return null; // API không trả AQI trong forecast (free tier)
}

// ── Provider ───────────────────────────────────────────────────────────────
export function WeatherProvider({ children }: { children: ReactNode }) {
  const [currentWeather,   setCurrentWeather]   = useState<WeatherData>(mockWeatherData);
  const [hourlyForecast,   setHourlyForecast]   = useState<HourlyForecast[]>(mockHourlyForecast);
  const [dailyForecast,    setDailyForecast]    = useState<DailyForecast[]>(mockDailyForecast);
  // Khởi tạo RỖNG – không dùng mock, chờ API thực
  const [dailyAqiForecast, setDailyAqiForecast] = useState<DailyAqiForecast[]>([]);
  const [isLoading, setIsLoading]               = useState(false);
  const [error,     setError]                   = useState<string | null>(null);
  const [selectedLocation, setSelectedLocationState] = useState(popularLocations[0]);

  // Dùng ref để track fetch mới nhất, tránh race condition
  const fetchId = useRef(0);

  const fetchWeatherFromAPI = useCallback(async (lat: number, lon: number, locationName: string) => {
    const id = ++fetchId.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json` +
        `?key=${API_KEY}&q=${lat},${lon}&days=7&aqi=yes&alerts=no`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Nếu fetch mới hơn đã bắt đầu thì huỷ
      if (id !== fetchId.current) return;

      const current      = data.current;
      const forecastDays = (data.forecast?.forecastday ?? []) as any[];

      // ── AQI hiện tại từ current (LUÔN có trên free tier) ──────
      const curPm25 = current.air_quality?.pm2_5;
      const curEpa  = current.air_quality?.['us-epa-index'] ?? 1;
      const curAqi  = (typeof curPm25 === 'number' && curPm25 >= 0)
        ? pm25ToAqi(curPm25)
        : epaToAqi(curEpa);
      const basePm25 = (typeof curPm25 === 'number' && curPm25 >= 0) ? curPm25 : null;

      // ── Current weather ────────────────────────────────────────
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
        aqi:            curAqi,
        aqiLevel:       getAQILevel(curAqi),
        aqiDescription: getAQIDescription(curAqi),
        coordinates:    { lat, lon },
      };

      // ── Hourly (next 24 h) ─────────────────────────────────────
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

      // ── 7-day daily forecast ───────────────────────────────────
      const newDaily: DailyForecast[] = forecastDays.map((day: any, i: number) => ({
        date:          new Date(day.date).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' }),
        dayName:       dayFull(i),
        tempMax:       Math.round(day.day.maxtemp_c),
        tempMin:       Math.round(day.day.mintemp_c),
        condition:     getCondition(day.day.condition.code, 1),
        humidity:      day.day.avghumidity,
        precipitation: day.day.daily_chance_of_rain ?? 0,
        confidence:    Math.max(60, 100 - i * 5),
      }));

      // ── 7-day AQI forecast ─────────────────────────────────────
      // Chiến lược 3 tầng:
      //   1) Thử lấy PM2.5/EPA từ hourly của từng ngày (plan trả phí)
      //   2) Nếu không có → ước tính từ PM2.5 hôm nay + thời tiết dự báo
      //   3) Nếu không có PM2.5 hôm nay → chỉ dùng EPA-based AQI hôm nay + thời tiết

      const aqiRows: DailyAqiForecast[] = forecastDays.map((day: any, i: number) => {
        const fromApi = extractHourlyAqi(day.hour ?? []);

        let aqi:    number;
        let pm25:   number;
        let isReal: boolean;

        if (fromApi && fromApi.aqi > 0) {
          // ✅ API trả data thực
          aqi    = fromApi.aqi;
          pm25   = fromApi.pm25;
          isReal = true;
        } else if (basePm25 !== null) {
          // ⚡ Ước tính từ PM2.5 thực hôm nay + thời tiết
          aqi    = estimateFutureAqi(
            basePm25,
            day.day.daily_chance_of_rain ?? 0,
            day.day.maxtemp_c,
            day.day.maxwind_kph ?? current.wind_kph ?? 10,
            day.day.avghumidity ?? current.humidity ?? 70,
          );
          pm25   = 0;
          isReal = false;
        } else {
          // 🔄 Không có PM2.5 → dùng EPA-based AQI hiện tại + điều chỉnh thời tiết
          const epaPm25Equiv = epaToAqi(curEpa) <= 50 ? 8 : epaToAqi(curEpa) <= 100 ? 25 : 45;
          aqi    = estimateFutureAqi(
            epaPm25Equiv,
            day.day.daily_chance_of_rain ?? 0,
            day.day.maxtemp_c,
            day.day.maxwind_kph ?? 10,
            day.day.avghumidity ?? 70,
          );
          pm25   = 0;
          isReal = false;
        }

        const prevAqi = i === 0 ? aqi : (aqiRows[i - 1]?.aqi ?? aqi);
        const diff    = aqi - prevAqi;
        const trend: 'up' | 'down' | 'stable' =
          Math.abs(diff) <= 8 ? 'stable' : diff > 0 ? 'up' : 'down';

        return { day: dayShort(i), aqi, pm25, trend, isReal };
      });

      setCurrentWeather(newWeather);
      setHourlyForecast(newHourly);
      setDailyForecast(newDaily);
      setDailyAqiForecast(aqiRows);

    } catch (err) {
      console.error('Weather fetch error:', err);
      if (id !== fetchId.current) return;
      setError('Không thể tải dữ liệu thời tiết.');
      // Giữ mock weather nhưng KHÔNG overwrite AQI với mock
    } finally {
      if (id === fetchId.current) setIsLoading(false);
    }
  }, []);

  const setSelectedLocation = useCallback(
    (loc: { name: string; lat: number; lon: number }) => {
      setSelectedLocationState(loc);
      setDailyAqiForecast([]); // xoá data cũ ngay lập tức khi đổi vị trí
      fetchWeatherFromAPI(loc.lat, loc.lon, loc.name);
    },
    [fetchWeatherFromAPI],
  );

  const refreshWeather = useCallback(async () => {
    await fetchWeatherFromAPI(
      selectedLocation.lat,
      selectedLocation.lon,
      selectedLocation.name,
    );
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
  if (!ctx) throw new Error('useWeather must be used within WeatherProvider');
  return ctx;
}
