import type { 
  WeatherData, 
  HourlyForecast, 
  DailyForecast, 
  HealthAlert, 
  ActivitySuggestion,
  HeatmapData 
} from './types';

export const mockWeatherData: WeatherData = {
  location: "Hà Nội, Việt Nam",
  temperature: 28,
  feelsLike: 32,
  humidity: 75,
  windSpeed: 12,
  windDirection: "Đông Nam",
  pressure: 1013,
  visibility: 10,
  uvIndex: 7,
  condition: "partly-cloudy",
  description: "Trời có mây rải rác, nắng nhẹ",
  sunrise: "05:42",
  sunset: "18:25",
  aqi: 85,
  aqiLevel: "moderate",
  aqiDescription: "Chất lượng không khí trung bình",
  coordinates: {
    lat: 21.0285,
    lon: 105.8542
  }
};

export const mockHourlyForecast: HourlyForecast[] = [
  { time: "Bây giờ", temperature: 28, condition: "partly-cloudy", humidity: 75, windSpeed: 12, precipitation: 0 },
  { time: "14:00", temperature: 30, condition: "sunny", humidity: 70, windSpeed: 14, precipitation: 0 },
  { time: "15:00", temperature: 31, condition: "sunny", humidity: 68, windSpeed: 15, precipitation: 0 },
  { time: "16:00", temperature: 30, condition: "partly-cloudy", humidity: 70, windSpeed: 13, precipitation: 5 },
  { time: "17:00", temperature: 29, condition: "cloudy", humidity: 72, windSpeed: 12, precipitation: 10 },
  { time: "18:00", temperature: 27, condition: "cloudy", humidity: 78, windSpeed: 10, precipitation: 15 },
  { time: "19:00", temperature: 26, condition: "rainy", humidity: 82, windSpeed: 8, precipitation: 30 },
  { time: "20:00", temperature: 25, condition: "rainy", humidity: 85, windSpeed: 7, precipitation: 45 },
  { time: "21:00", temperature: 24, condition: "rainy", humidity: 88, windSpeed: 6, precipitation: 35 },
  { time: "22:00", temperature: 24, condition: "cloudy", humidity: 85, windSpeed: 5, precipitation: 15 },
  { time: "23:00", temperature: 23, condition: "partly-cloudy", humidity: 82, windSpeed: 4, precipitation: 5 },
  { time: "00:00", temperature: 23, condition: "partly-cloudy", humidity: 80, windSpeed: 4, precipitation: 0 },
  { time: "01:00", temperature: 22, condition: "cloudy", humidity: 78, windSpeed: 3, precipitation: 0 },
  { time: "02:00", temperature: 22, condition: "cloudy", humidity: 76, windSpeed: 3, precipitation: 0 },
  { time: "03:00", temperature: 21, condition: "partly-cloudy", humidity: 75, windSpeed: 3, precipitation: 0 },
  { time: "04:00", temperature: 21, condition: "partly-cloudy", humidity: 74, windSpeed: 4, precipitation: 0 },
  { time: "05:00", temperature: 22, condition: "sunny", humidity: 72, windSpeed: 5, precipitation: 0 },
  { time: "06:00", temperature: 23, condition: "sunny", humidity: 70, windSpeed: 6, precipitation: 0 },
  { time: "07:00", temperature: 24, condition: "sunny", humidity: 68, windSpeed: 8, precipitation: 0 },
  { time: "08:00", temperature: 25, condition: "sunny", humidity: 65, windSpeed: 9, precipitation: 0 },
  { time: "09:00", temperature: 26, condition: "partly-cloudy", humidity: 68, windSpeed: 10, precipitation: 0 },
  { time: "10:00", temperature: 27, condition: "partly-cloudy", humidity: 70, windSpeed: 11, precipitation: 0 },
  { time: "11:00", temperature: 28, condition: "partly-cloudy", humidity: 72, windSpeed: 12, precipitation: 0 },
  { time: "12:00", temperature: 29, condition: "sunny", humidity: 70, windSpeed: 13, precipitation: 0 },
];

export const mockDailyForecast: DailyForecast[] = [
  { date: "21/03", dayName: "Hôm nay", tempMax: 31, tempMin: 22, condition: "partly-cloudy", humidity: 75, precipitation: 20, confidence: 95 },
  { date: "22/03", dayName: "Chủ nhật", tempMax: 29, tempMin: 21, condition: "rainy", humidity: 85, precipitation: 65, confidence: 88 },
  { date: "23/03", dayName: "Thứ 2", tempMax: 27, tempMin: 20, condition: "rainy", humidity: 88, precipitation: 80, confidence: 82 },
  { date: "24/03", dayName: "Thứ 3", tempMax: 28, tempMin: 21, condition: "cloudy", humidity: 78, precipitation: 40, confidence: 75 },
  { date: "25/03", dayName: "Thứ 4", tempMax: 30, tempMin: 22, condition: "partly-cloudy", humidity: 72, precipitation: 15, confidence: 70 },
  { date: "26/03", dayName: "Thứ 5", tempMax: 32, tempMin: 23, condition: "sunny", humidity: 65, precipitation: 5, confidence: 65 },
  { date: "27/03", dayName: "Thứ 6", tempMax: 33, tempMin: 24, condition: "sunny", humidity: 60, precipitation: 0, confidence: 60 },
];

export const mockHealthAlerts: HealthAlert[] = [
  {
    id: "1",
    type: "uv",
    severity: "high",
    title: "Chỉ số UV cao",
    description: "Chỉ số UV đạt mức 7, có thể gây hại cho da nếu tiếp xúc lâu.",
    recommendation: "Sử dụng kem chống nắng SPF 30+, đeo kính râm và mũ khi ra ngoài."
  },
  {
    id: "2",
    type: "air-quality",
    severity: "medium",
    title: "Chất lượng không khí trung bình",
    description: "AQI ở mức 85, người nhạy cảm nên hạn chế hoạt động ngoài trời.",
    recommendation: "Người có bệnh hô hấp nên đeo khẩu trang khi ra ngoài."
  },
  {
    id: "3",
    type: "rain",
    severity: "low",
    title: "Dự báo mưa chiều tối",
    description: "Khả năng có mưa rào từ 18:00 đến 21:00.",
    recommendation: "Mang theo ô hoặc áo mưa nếu có kế hoạch ra ngoài buổi tối."
  }
];

export const mockActivitySuggestions: ActivitySuggestion[] = [
  {
    id: "1",
    activity: "Đi dạo buổi sáng",
    icon: "walk",
    suitability: "excellent",
    reason: "Thời tiết mát mẻ, không khí trong lành vào buổi sáng sớm."
  },
  {
    id: "2",
    activity: "Chạy bộ ngoài trời",
    icon: "run",
    suitability: "good",
    reason: "Tốt nhất vào sáng sớm hoặc chiều muộn để tránh nắng gắt."
  },
  {
    id: "3",
    activity: "Đạp xe",
    icon: "bike",
    suitability: "moderate",
    reason: "Cần chú ý chỉ số UV cao vào buổi trưa."
  },
  {
    id: "4",
    activity: "Bơi lội",
    icon: "swim",
    suitability: "excellent",
    reason: "Thời tiết nóng, phù hợp cho các hoạt động dưới nước."
  },
  {
    id: "5",
    activity: "Dã ngoại",
    icon: "picnic",
    suitability: "moderate",
    reason: "Có khả năng mưa chiều tối, nên hoàn thành trước 17:00."
  },
  {
    id: "6",
    activity: "Làm vườn",
    icon: "garden",
    suitability: "good",
    reason: "Buổi sáng hoặc chiều muộn là thời điểm lý tưởng."
  }
];

export const mockHeatmapData: HeatmapData[] = [
  { lat: 21.0285, lon: 105.8542, value: 28, label: "Hà Nội" },
  { lat: 21.0300, lon: 105.8600, value: 29, label: "Hoàn Kiếm" },
  { lat: 21.0400, lon: 105.8400, value: 27, label: "Ba Đình" },
  { lat: 21.0100, lon: 105.8700, value: 30, label: "Hai Bà Trưng" },
  { lat: 21.0500, lon: 105.8300, value: 26, label: "Tây Hồ" },
  { lat: 20.9900, lon: 105.8500, value: 31, label: "Thanh Xuân" },
  { lat: 21.0200, lon: 105.8200, value: 28, label: "Cầu Giấy" },
  { lat: 21.0600, lon: 105.8500, value: 25, label: "Long Biên" },
  { lat: 20.9800, lon: 105.8300, value: 32, label: "Hà Đông" },
];

export const vietnamCities = [
  { name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { name: "Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  { name: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  { name: "Cần Thơ", lat: 10.0452, lon: 105.7469 },
  { name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  { name: "Huế", lat: 16.4637, lon: 107.5909 },
  { name: "Đà Lạt", lat: 11.9404, lon: 108.4583 },
  { name: "Vũng Tàu", lat: 10.4114, lon: 107.1362 },
  { name: "Quy Nhơn", lat: 13.7830, lon: 109.2197 },
];

export const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return "text-aqi-good bg-aqi-good/20";
  if (aqi <= 100) return "text-aqi-moderate bg-aqi-moderate/20";
  if (aqi <= 150) return "text-aqi-unhealthy-sensitive bg-aqi-unhealthy-sensitive/20";
  if (aqi <= 200) return "text-aqi-unhealthy bg-aqi-unhealthy/20";
  if (aqi <= 300) return "text-aqi-very-unhealthy bg-aqi-very-unhealthy/20";
  return "text-aqi-hazardous bg-aqi-hazardous/20";
};

export const getAQILevel = (aqi: number): string => {
  if (aqi <= 50) return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Không tốt cho nhóm nhạy cảm";
  if (aqi <= 200) return "Không tốt";
  if (aqi <= 300) return "Rất không tốt";
  return "Nguy hại";
};
