export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'partly-cloudy';
  description: string;
  sunrise: string;
  sunset: string;
  aqi: number;
  aqiLevel: 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  aqiDescription: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  humidity: number;
  precipitation: number;
  confidence: number;
}

export interface HealthAlert {
  id: string;
  type: 'uv' | 'heat' | 'cold' | 'air-quality' | 'storm' | 'rain';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
}

export interface ActivitySuggestion {
  id: string;
  activity: string;
  icon: string;
  suitability: 'excellent' | 'good' | 'moderate' | 'poor';
  reason: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'ms' | 'mph';
  notifications: boolean;
  favoriteLocations: string[];
  theme: 'light' | 'dark' | 'system';
}

export interface HeatmapData {
  lat: number;
  lon: number;
  value: number;
  label?: string;
}
