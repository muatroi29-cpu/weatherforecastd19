/**
 * Tính AQI (US EPA 2024) từ PM2.5 µg/m³.
 */
export function pm25ToAqi(pm25: number): number {
  if (pm25 < 0) return 0;
  const bp: [number, number, number, number][] = [
    [0.0,    12.0,   0,  50],
    [12.1,   35.4,  51, 100],
    [35.5,   55.4, 101, 150],
    [55.5,  150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
  ];
  for (const [lo, hi, alo, ahi] of bp) {
    if (pm25 >= lo && pm25 <= hi)
      return Math.round(((ahi - alo) / (hi - lo)) * (pm25 - lo) + alo);
  }
  return 500;
}

/** EPA index (1-6) → AQI midpoint — dùng khi không có PM2.5 */
export function epaToAqi(epa: number): number {
  const m: Record<number, number> = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 250, 6: 350 };
  return m[Math.round(epa)] ?? 50;
}

/**
 * Ước tính AQI cho ngày tương lai dựa trên PM2.5 thực tế hôm nay
 * và điều kiện thời tiết dự báo.
 * Dùng khi WeatherAPI free tier không trả air_quality trong forecast.
 */
export function estimateFutureAqi(
  baselinePm25: number,
  rain: number,      // % xác suất mưa
  tempMax: number,   // °C
  windSpeed: number, // km/h (trung bình ngày)
  humidity: number,  // %
): number {
  let pm25 = baselinePm25;

  // Mưa rửa PM2.5 khỏi không khí
  if      (rain >= 70) pm25 *= 0.58;
  else if (rain >= 50) pm25 *= 0.72;
  else if (rain >= 30) pm25 *= 0.87;

  // Gió phân tán ô nhiễm
  if      (windSpeed >= 30) pm25 *= 0.78;
  else if (windSpeed >= 20) pm25 *= 0.88;
  else if (windSpeed <= 5)  pm25 *= 1.12; // gió tĩnh → tích tụ

  // Nhiệt độ cao + độ ẩm cao → phản ứng quang hoá
  if      (tempMax >= 35 && humidity >= 70) pm25 *= 1.14;
  else if (tempMax >= 33)                   pm25 *= 1.07;
  else if (tempMax <= 20)                   pm25 *= 0.95; // lạnh → ít phản ứng

  return pm25ToAqi(Math.max(0, pm25));
}

export function aqiLevel(aqi: number): string {
  if (aqi <= 50)  return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Kém (nhạy cảm)";
  if (aqi <= 200) return "Kém";
  if (aqi <= 300) return "Rất kém";
  return "Nguy hại";
}

export function aqiBgColor(aqi: number): string {
  if (aqi <= 50)  return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-rose-900";
}

export function aqiTextColor(aqi: number): string {
  if (aqi <= 50)  return "text-green-600";
  if (aqi <= 100) return "text-yellow-600";
  if (aqi <= 150) return "text-orange-600";
  if (aqi <= 200) return "text-red-600";
  if (aqi <= 300) return "text-purple-600";
  return "text-rose-900";
}
