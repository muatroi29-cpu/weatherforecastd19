"use client";

import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  CloudFog,
  CloudSun,
  type LucideProps
} from 'lucide-react';

interface WeatherIconProps extends LucideProps {
  condition: string;
  animated?: boolean;
}

export function WeatherIcon({ condition, animated = false, className, ...props }: WeatherIconProps) {
  const animationClass = animated ? 'animate-float' : '';
  const combinedClassName = `${animationClass} ${className || ''}`;

  switch (condition) {
    case 'sunny':
      return <Sun className={`text-yellow-500 ${combinedClassName}`} {...props} />;
    case 'partly-cloudy':
      return <CloudSun className={`text-blue-400 ${combinedClassName}`} {...props} />;
    case 'cloudy':
      return <Cloud className={`text-gray-400 ${combinedClassName}`} {...props} />;
    case 'rainy':
      return <CloudRain className={`text-blue-500 ${combinedClassName}`} {...props} />;
    case 'stormy':
      return <CloudLightning className={`text-purple-500 ${combinedClassName}`} {...props} />;
    case 'snowy':
      return <CloudSnow className={`text-cyan-300 ${combinedClassName}`} {...props} />;
    case 'foggy':
      return <CloudFog className={`text-gray-400 ${combinedClassName}`} {...props} />;
    default:
      return <Sun className={`text-yellow-500 ${combinedClassName}`} {...props} />;
  }
}

export function getWeatherGradient(condition: string): string {
  switch (condition) {
    case 'sunny':
      return 'from-amber-400 via-orange-400 to-yellow-300';
    case 'partly-cloudy':
      return 'from-blue-400 via-sky-400 to-cyan-300';
    case 'cloudy':
      return 'from-gray-400 via-slate-400 to-gray-500';
    case 'rainy':
      return 'from-blue-500 via-indigo-500 to-blue-600';
    case 'stormy':
      return 'from-purple-600 via-indigo-600 to-slate-700';
    case 'snowy':
      return 'from-cyan-200 via-blue-200 to-white';
    case 'foggy':
      return 'from-gray-300 via-slate-300 to-gray-400';
    default:
      return 'from-blue-400 via-sky-400 to-cyan-300';
  }
}
