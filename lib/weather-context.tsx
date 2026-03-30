"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { WeatherData, HourlyForecast, DailyForecast } from './types';
import { mockWeatherData, mockHourlyForecast, mockDailyForecast, popularLocations } from './mock-data';

interface WeatherContextType {
  currentWeather: WeatherData;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  isLoading: boolean;
  error: string | null;
  selectedLocation: { name: string; lat: number; lon: number };
  setSelectedLocation: (location: { name: string; lat: number; lon: number }) => void;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [currentWeather, setCurrentWeather] = useState<WeatherData>(mockWeatherData);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>(mockHourlyForecast);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>(mockDailyForecast);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocationState] = useState(popularLocations[0]);

  const fetchWeatherFromAPI = useCallback(async (lat: number, lon: number, locationName: string) => {
    setIsLoading(true);
    setError(null);

    const API_KEY = 'ecd27c0bc5cf4eb6a70143329263003';

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=7&aqi=yes&alerts=no`
      );

      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu thời tiết');
      }

      const data = await response.json();

      // Map WeatherAPI condition code to app condition
      const getCondition = (code: number, isDay: number): WeatherData['condition'] => {
        if (code === 1000) return isDay ? 'sunny' : 'partly-cloudy';
        if (code === 1003) return 'partly-cloudy';
        if (code === 1006 || code === 1009) return 'cloudy';
        if (code === 1030 || code === 1135 || code === 1147) return 'foggy';
        if ([1087, 1273, 1276, 1279, 1282].includes(code)) return 'stormy';
        if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(code)) return 'snowy';
        if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(code)) return 'rainy';
        return 'cloudy';
      };

      const getWindDirectionVi = (dir: string): string => {
        const map: Record<string, string> = {
          N: 'Bắc', NNE: 'Bắc Đông Bắc', NE: 'Đông Bắc', ENE: 'Đông Đông Bắc',
          E: 'Đông', ESE: 'Đông Đông Nam', SE: 'Đông Nam', SSE: 'Nam Đông Nam',
          S: 'Nam', SSW: 'Nam Tây Nam', SW: 'Tây Nam', WSW: 'Tây Tây Nam',
          W: 'Tây', WNW: 'Tây Tây Bắc', NW: 'Tây Bắc', NNW: 'Bắc Tây Bắc',
        };
        return map[dir] || dir;
      };

      const getAQILevel = (aqi: number): WeatherData['aqiLevel'] => {
        if (aqi <= 50) return 'good';
        if (aqi <= 100) return 'moderate';
        if (aqi <= 150) return 'unhealthy-sensitive';
        if (aqi <= 200) return 'unhealthy';
        if (aqi <= 300) return 'very-unhealthy';
        return 'hazardous';
      };

      const getAQIDescription = (aqi: number): string => {
        if (aqi <= 50) return 'Chất lượng không khí tốt';
        if (aqi <= 100) return 'Chất lượng không khí trung bình';
        if (aqi <= 150) return 'Không tốt cho nhóm nhạy cảm';
        if (aqi <= 200) return 'Chất lượng không khí không tốt';
        if (aqi <= 300) return 'Chất lượng không khí rất xấu';
        return 'Chất lượng không khí nguy hại';
      };

      const current = data.current;
      const airQuality = current.air_quality;
      // WeatherAPI returns us-epa-index as 1-6 category, convert to 0-300 AQI scale
      const epaIndex = airQuality?.['us-epa-index'] ?? 1;
      const aqiMap: Record<number, number> = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 250, 6: 350 };
      const aqiClamped = aqiMap[epaIndex] ?? 50;

      const todayAstro = data.forecast.forecastday[0].astro;

      const newWeatherData: WeatherData = {
        location: locationName,
        temperature: Math.round(current.temp_c),
        feelsLike: Math.round(current.feelslike_c),
        humidity: current.humidity,
        windSpeed: Math.round(current.wind_kph),
        windDirection: getWindDirectionVi(current.wind_dir),
        pressure: Math.round(current.pressure_mb),
        visibility: Math.round(current.vis_km),
        uvIndex: Math.round(current.uv),
        condition: getCondition(current.condition.code, current.is_day),
        description: current.condition.text,
        sunrise: todayAstro.sunrise,
        sunset: todayAstro.sunset,
        aqi: aqiClamped,
        aqiLevel: getAQILevel(aqiClamped),
        aqiDescription: getAQIDescription(aqiClamped),
        coordinates: { lat, lon }
      };

      // Parse hourly forecast (next 24 hours from current hour)
      const now = new Date();
      const currentHour = now.getHours();

      const todayHours = data.forecast.forecastday[0].hour;
      const tomorrowHours = data.forecast.forecastday[1]?.hour || [];
      const currentAndAfter = [
        ...todayHours.slice(currentHour),
        ...tomorrowHours
      ].slice(0, 24);

      const newHourlyForecast: HourlyForecast[] = currentAndAfter.map((hour: any, i: number) => ({
        time: i === 0 ? 'Bây giờ' : new Date(hour.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        temperature: Math.round(hour.temp_c),
        condition: getCondition(hour.condition.code, hour.is_day),
        humidity: hour.humidity,
        windSpeed: Math.round(hour.wind_kph),
        precipitation: hour.chance_of_rain,
      }));

      // Parse daily forecast
      const getDayName = (index: number): string => {
        if (index === 0) return 'Hôm nay';
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date.toLocaleDateString('vi-VN', { weekday: 'long' });
      };

      const newDailyForecast: DailyForecast[] = data.forecast.forecastday.map((day: any, index: number) => ({
        date: new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        dayName: getDayName(index),
        tempMax: Math.round(day.day.maxtemp_c),
        tempMin: Math.round(day.day.mintemp_c),
        condition: getCondition(day.day.condition.code, 1),
        humidity: day.day.avghumidity,
        precipitation: day.day.daily_chance_of_rain,
        confidence: Math.max(60, 100 - index * 5),
      }));

      setCurrentWeather(newWeatherData);
      setHourlyForecast(newHourlyForecast);
      setDailyForecast(newDailyForecast);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Không thể tải dữ liệu thời tiết. Sử dụng dữ liệu mẫu.');
      setCurrentWeather({ ...mockWeatherData, location: locationName });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setSelectedLocation = useCallback((location: { name: string; lat: number; lon: number }) => {
    setSelectedLocationState(location);
    fetchWeatherFromAPI(location.lat, location.lon, location.name);
  }, [fetchWeatherFromAPI]);

  const refreshWeather = useCallback(async () => {
    await fetchWeatherFromAPI(selectedLocation.lat, selectedLocation.lon, selectedLocation.name);
  }, [selectedLocation, fetchWeatherFromAPI]);

  return (
    <WeatherContext.Provider value={{
      currentWeather,
      hourlyForecast,
      dailyForecast,
      isLoading,
      error,
      selectedLocation,
      setSelectedLocation,
      refreshWeather
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
