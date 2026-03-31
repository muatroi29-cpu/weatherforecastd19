/**
 * Tính chỉ số AQI Mỹ (US EPA) từ nồng độ PM2.5 (µg/m³).
 * Dùng breakpoint chuẩn EPA 2024.
 */
export function pm25ToAqi(pm25: number): number {
  if (pm25 < 0) return 0;
  const bp: [number, number, number, number][] = [
    [0.0,   12.0,   0,  50],
    [12.1,  35.4,  51, 100],
    [35.5,  55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
  ];
  for (const [pmLo, pmHi, aqiLo, aqiHi] of bp) {
    if (pm25 >= pmLo && pm25 <= pmHi) {
      return Math.round(((aqiHi - aqiLo) / (pmHi - pmLo)) * (pm25 - pmLo) + aqiLo);
    }
  }
  return 500;
}

/** Map EPA index (1–6) → AQI midpoint – dùng khi không có PM2.5 */
export function epaIndexToAqi(epa: number): number {
  const map: Record<number, number> = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 250, 6: 350 };
  return map[Math.round(epa)] ?? 50;
}

export function getAqiLevel(aqi: number): string {
  if (aqi <= 50)  return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Kém – nhóm nhạy cảm";
  if (aqi <= 200) return "Kém";
  if (aqi <= 300) return "Rất kém";
  return "Nguy hại";
}

export function getAqiBgColor(aqi: number): string {
  if (aqi <= 50)  return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-rose-900";
}

export function getAqiTextColor(aqi: number): string {
  if (aqi <= 50)  return "text-green-600";
  if (aqi <= 100) return "text-yellow-600";
  if (aqi <= 150) return "text-orange-600";
  if (aqi <= 200) return "text-red-600";
  if (aqi <= 300) return "text-purple-600";
  return "text-rose-900";
}
