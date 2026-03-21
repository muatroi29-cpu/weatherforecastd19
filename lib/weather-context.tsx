"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { WeatherData, HourlyForecast, DailyForecast } from './types';
import { mockWeatherData, mockHourlyForecast, mockDailyForecast, vietnamCities } from './mock-data';

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
  const [selectedLocation, setSelectedLocationState] = useState(vietnamCities[0]);

  const fetchWeatherFromAPI = useCallback(async (lat: number, lon: number, locationName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch current weather and hourly forecast
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=Asia/Ho_Chi_Minh&forecast_days=7`
      );

      // Fetch AQI data
      const aqiResponse = await fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi`
      );

      if (!weatherResponse.ok || !aqiResponse.ok) {
        throw new Error('Không thể tải dữ liệu thời tiết');
      }

      const weatherData = await weatherResponse.json();
      const aqiData = await aqiResponse.json();

      // Parse weather code to condition
      const getCondition = (code: number): WeatherData['condition'] => {
        if (code === 0 || code === 1) return 'sunny';
        if (code === 2) return 'partly-cloudy';
        if (code === 3) return 'cloudy';
        if (code >= 45 && code <= 48) return 'foggy';
        if (code >= 51 && code <= 67) return 'rainy';
        if (code >= 71 && code <= 77) return 'snowy';
        if (code >= 80 && code <= 99) return 'stormy';
        return 'cloudy';
      };

      const getDescription = (code: number): string => {
        if (code === 0) return 'Trời quang đãng';
        if (code === 1) return 'Trời hầu như quang đãng';
        if (code === 2) return 'Có mây rải rác';
        if (code === 3) return 'Trời âm u';
        if (code >= 45 && code <= 48) return 'Sương mù';
        if (code >= 51 && code <= 55) return 'Mưa phùn';
        if (code >= 61 && code <= 65) return 'Mưa';
        if (code >= 66 && code <= 67) return 'Mưa đóng băng';
        if (code >= 71 && code <= 75) return 'Tuyết rơi';
        if (code >= 80 && code <= 82) return 'Mưa rào';
        if (code >= 95 && code <= 99) return 'Giông bão';
        return 'Có mây';
      };

      const getWindDirection = (deg: number): string => {
        if (deg >= 337.5 || deg < 22.5) return 'Bắc';
        if (deg >= 22.5 && deg < 67.5) return 'Đông Bắc';
        if (deg >= 67.5 && deg < 112.5) return 'Đông';
        if (deg >= 112.5 && deg < 157.5) return 'Đông Nam';
        if (deg >= 157.5 && deg < 202.5) return 'Nam';
        if (deg >= 202.5 && deg < 247.5) return 'Tây Nam';
        if (deg >= 247.5 && deg < 292.5) return 'Tây';
        return 'Tây Bắc';
      };

      const aqi = aqiData.current?.us_aqi || 50;
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

      const current = weatherData.current;
      const daily = weatherData.daily;

      // Format sunrise/sunset
      const formatTime = (iso: string) => {
        const date = new Date(iso);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      };

      const newWeatherData: WeatherData = {
        location: locationName,
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: getWindDirection(current.wind_direction_10m),
        pressure: Math.round(current.surface_pressure),
        visibility: 10,
        uvIndex: Math.round(current.uv_index || 0),
        condition: getCondition(current.weather_code),
        description: getDescription(current.weather_code),
        sunrise: formatTime(daily.sunrise[0]),
        sunset: formatTime(daily.sunset[0]),
        aqi,
        aqiLevel: getAQILevel(aqi),
        aqiDescription: getAQIDescription(aqi),
        coordinates: { lat, lon }
      };

      // Parse hourly forecast
      const hourly = weatherData.hourly;
      const now = new Date();
      const currentHour = now.getHours();
      
      const newHourlyForecast: HourlyForecast[] = [];
      for (let i = 0; i < 24; i++) {
        const hourIndex = currentHour + i;
        if (hourIndex < hourly.time.length) {
          const time = i === 0 ? 'Bây giờ' : new Date(hourly.time[hourIndex]).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          newHourlyForecast.push({
            time,
            temperature: Math.round(hourly.temperature_2m[hourIndex]),
            condition: getCondition(hourly.weather_code[hourIndex]),
            humidity: hourly.relative_humidity_2m[hourIndex],
            windSpeed: Math.round(hourly.wind_speed_10m[hourIndex]),
            precipitation: hourly.precipitation_probability[hourIndex] || 0
          });
        }
      }

      // Parse daily forecast
      const getDayName = (index: number): string => {
        if (index === 0) return 'Hôm nay';
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date.toLocaleDateString('vi-VN', { weekday: 'long' });
      };

      const newDailyForecast: DailyForecast[] = daily.time.map((time: string, index: number) => ({
        date: new Date(time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        dayName: getDayName(index),
        tempMax: Math.round(daily.temperature_2m_max[index]),
        tempMin: Math.round(daily.temperature_2m_min[index]),
        condition: getCondition(daily.weather_code[index]),
        humidity: 70,
        precipitation: daily.precipitation_probability_max[index] || 0,
        confidence: Math.max(60, 100 - index * 5)
      }));

      setCurrentWeather(newWeatherData);
      setHourlyForecast(newHourlyForecast);
      setDailyForecast(newDailyForecast);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Không thể tải dữ liệu thời tiết. Sử dụng dữ liệu mẫu.');
      // Fall back to mock data
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
