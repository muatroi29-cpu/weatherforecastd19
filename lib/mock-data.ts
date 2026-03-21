import type { 
  WeatherData, 
  HourlyForecast, 
  DailyForecast, 
  HealthAlert, 
  ActivitySuggestion,
  HeatmapData 
} from './types';

export const mockWeatherData: WeatherData = {
  location: "Quận Hoàn Kiếm, Hà Nội",
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
  { lat: 21.0285, lon: 105.8542, value: 28, label: "Quận Hoàn Kiếm" },
  { lat: 21.0340, lon: 105.8180, value: 27, label: "Quận Ba Đình" },
  { lat: 21.0183, lon: 105.8281, value: 29, label: "Quận Đống Đa" },
  { lat: 21.0064, lon: 105.8594, value: 30, label: "Quận Hai Bà Trưng" },
  { lat: 21.0680, lon: 105.8230, value: 26, label: "Quận Tây Hồ" },
  { lat: 20.9932, lon: 105.8098, value: 31, label: "Quận Thanh Xuân" },
  { lat: 21.0320, lon: 105.7880, value: 28, label: "Quận Cầu Giấy" },
  { lat: 21.0470, lon: 105.8890, value: 25, label: "Quận Long Biên" },
  { lat: 20.9720, lon: 105.7780, value: 32, label: "Quận Hà Đông" },
  { lat: 21.0186, lon: 105.7560, value: 29, label: "Quận Nam Từ Liêm" },
  { lat: 21.0680, lon: 105.7450, value: 27, label: "Quận Bắc Từ Liêm" },
  { lat: 20.9765, lon: 105.8645, value: 30, label: "Quận Hoàng Mai" },
];

// Danh sách địa điểm chi tiết theo vùng miền Việt Nam
export const vietnamLocations = {
  "Miền Bắc": {
    "Hà Nội": [
      { name: "Quận Hoàn Kiếm, Hà Nội", lat: 21.0285, lon: 105.8542 },
      { name: "Quận Ba Đình, Hà Nội", lat: 21.0340, lon: 105.8180 },
      { name: "Quận Đống Đa, Hà Nội", lat: 21.0183, lon: 105.8281 },
      { name: "Quận Hai Bà Trưng, Hà Nội", lat: 21.0064, lon: 105.8594 },
      { name: "Quận Hoàng Mai, Hà Nội", lat: 20.9765, lon: 105.8645 },
      { name: "Quận Thanh Xuân, Hà Nội", lat: 20.9932, lon: 105.8098 },
      { name: "Quận Cầu Giấy, Hà Nội", lat: 21.0320, lon: 105.7880 },
      { name: "Quận Long Biên, Hà Nội", lat: 21.0470, lon: 105.8890 },
      { name: "Quận Tây Hồ, Hà Nội", lat: 21.0680, lon: 105.8230 },
      { name: "Quận Nam Từ Liêm, Hà Nội", lat: 21.0186, lon: 105.7560 },
      { name: "Quận Bắc Từ Liêm, Hà Nội", lat: 21.0680, lon: 105.7450 },
      { name: "Quận Hà Đông, Hà Nội", lat: 20.9720, lon: 105.7780 },
      { name: "Huyện Đông Anh, Hà Nội", lat: 21.1390, lon: 105.8470 },
      { name: "Huyện Gia Lâm, Hà Nội", lat: 21.0170, lon: 105.9360 },
      { name: "Huyện Thanh Trì, Hà Nội", lat: 20.9230, lon: 105.8580 },
      { name: "Huyện Sóc Sơn, Hà Nội", lat: 21.2550, lon: 105.8490 },
    ],
    "Hải Phòng": [
      { name: "Quận Hồng Bàng, Hải Phòng", lat: 20.8651, lon: 106.6831 },
      { name: "Quận Ngô Quyền, Hải Phòng", lat: 20.8576, lon: 106.6954 },
      { name: "Quận Lê Chân, Hải Phòng", lat: 20.8430, lon: 106.6879 },
      { name: "Quận Hải An, Hải Phòng", lat: 20.8317, lon: 106.7269 },
      { name: "Quận Kiến An, Hải Phòng", lat: 20.8170, lon: 106.6470 },
      { name: "Quận Đồ Sơn, Hải Phòng", lat: 20.7120, lon: 106.7770 },
      { name: "Huyện Cát Hải, Hải Phòng", lat: 20.7950, lon: 106.9870 },
    ],
    "Quảng Ninh": [
      { name: "TP. Hạ Long, Quảng Ninh", lat: 20.9510, lon: 107.0790 },
      { name: "TP. Cẩm Phả, Quảng Ninh", lat: 21.0180, lon: 107.2920 },
      { name: "TP. Móng Cái, Quảng Ninh", lat: 21.5370, lon: 107.9660 },
      { name: "TX. Quảng Yên, Quảng Ninh", lat: 20.9340, lon: 106.8140 },
    ],
    "Thái Nguyên": [
      { name: "TP. Thái Nguyên", lat: 21.5940, lon: 105.8480 },
      { name: "TP. Sông Công, Thái Nguyên", lat: 21.4730, lon: 105.8510 },
      { name: "Huyện Phổ Yên, Thái Nguyên", lat: 21.4030, lon: 105.8730 },
    ],
    "Bắc Ninh": [
      { name: "TP. Bắc Ninh", lat: 21.1860, lon: 106.0760 },
      { name: "TX. Từ Sơn, Bắc Ninh", lat: 21.1180, lon: 105.9670 },
      { name: "Huyện Thuận Thành, Bắc Ninh", lat: 21.0630, lon: 106.0830 },
    ],
    "Lào Cai": [
      { name: "TP. Lào Cai", lat: 22.4880, lon: 103.9540 },
      { name: "TX. Sa Pa, Lào Cai", lat: 22.3400, lon: 103.8440 },
    ],
    "Điện Biên": [
      { name: "TP. Điện Biên Phủ", lat: 21.3830, lon: 103.0160 },
    ],
    "Sơn La": [
      { name: "TP. Sơn La", lat: 21.3280, lon: 103.9140 },
      { name: "Huyện Mộc Châu, Sơn La", lat: 20.8350, lon: 104.6840 },
    ],
    "Hòa Bình": [
      { name: "TP. Hòa Bình", lat: 20.8130, lon: 105.3380 },
      { name: "Huyện Mai Châu, Hòa Bình", lat: 20.6590, lon: 105.0590 },
    ],
    "Vĩnh Phúc": [
      { name: "TP. Vĩnh Yên, Vĩnh Phúc", lat: 21.3100, lon: 105.5960 },
      { name: "TX. Phúc Yên, Vĩnh Phúc", lat: 21.2420, lon: 105.7190 },
    ],
    "Phú Thọ": [
      { name: "TP. Việt Trì, Phú Thọ", lat: 21.3220, lon: 105.4020 },
    ],
    "Nam Định": [
      { name: "TP. Nam Định", lat: 20.4340, lon: 106.1770 },
    ],
    "Ninh Bình": [
      { name: "TP. Ninh Bình", lat: 20.2540, lon: 105.9750 },
      { name: "TX. Tam Điệp, Ninh Bình", lat: 20.1530, lon: 105.9080 },
    ],
    "Thanh Hóa": [
      { name: "TP. Thanh Hóa", lat: 19.8070, lon: 105.7850 },
      { name: "TX. Sầm Sơn, Thanh Hóa", lat: 19.7410, lon: 105.9010 },
    ],
    "Nghệ An": [
      { name: "TP. Vinh, Nghệ An", lat: 18.6730, lon: 105.6920 },
      { name: "TX. Cửa Lò, Nghệ An", lat: 18.8050, lon: 105.7230 },
    ],
    "Hà Tĩnh": [
      { name: "TP. Hà Tĩnh", lat: 18.3430, lon: 105.9070 },
    ],
  },
  "Miền Trung": {
    "Quảng Bình": [
      { name: "TP. Đồng Hới, Quảng Bình", lat: 17.4680, lon: 106.6220 },
    ],
    "Quảng Trị": [
      { name: "TP. Đông Hà, Quảng Trị", lat: 16.8070, lon: 107.1000 },
    ],
    "Thừa Thiên Huế": [
      { name: "TP. Huế", lat: 16.4637, lon: 107.5909 },
      { name: "Huyện Phú Lộc, Huế", lat: 16.2920, lon: 107.8960 },
    ],
    "Đà Nẵng": [
      { name: "Quận Hải Châu, Đà Nẵng", lat: 16.0680, lon: 108.2210 },
      { name: "Quận Thanh Khê, Đà Nẵng", lat: 16.0760, lon: 108.1920 },
      { name: "Quận Sơn Trà, Đà Nẵng", lat: 16.1090, lon: 108.2470 },
      { name: "Quận Ngũ Hành Sơn, Đà Nẵng", lat: 16.0140, lon: 108.2530 },
      { name: "Quận Liên Chiểu, Đà Nẵng", lat: 16.0880, lon: 108.1450 },
      { name: "Quận Cẩm Lệ, Đà Nẵng", lat: 16.0150, lon: 108.2030 },
      { name: "Huyện Hòa Vang, Đà Nẵng", lat: 15.9750, lon: 108.0620 },
    ],
    "Quảng Nam": [
      { name: "TP. Tam Kỳ, Quảng Nam", lat: 15.5680, lon: 108.4770 },
      { name: "TP. Hội An, Quảng Nam", lat: 15.8800, lon: 108.3350 },
    ],
    "Quảng Ngãi": [
      { name: "TP. Quảng Ngãi", lat: 15.1220, lon: 108.8040 },
    ],
    "Bình Định": [
      { name: "TP. Quy Nhơn, Bình Định", lat: 13.7830, lon: 109.2197 },
    ],
    "Phú Yên": [
      { name: "TP. Tuy Hòa, Phú Yên", lat: 13.0880, lon: 109.3130 },
    ],
    "Khánh Hòa": [
      { name: "TP. Nha Trang, Khánh Hòa", lat: 12.2388, lon: 109.1967 },
      { name: "TP. Cam Ranh, Khánh Hòa", lat: 11.9070, lon: 109.1580 },
    ],
    "Ninh Thuận": [
      { name: "TP. Phan Rang-Tháp Chàm", lat: 11.5750, lon: 108.9880 },
    ],
    "Bình Thuận": [
      { name: "TP. Phan Thiết, Bình Thuận", lat: 10.9280, lon: 108.1020 },
      { name: "TX. La Gi, Bình Thuận", lat: 10.6570, lon: 107.7830 },
      { name: "Huyện Hàm Thuận Nam, Bình Thuận", lat: 10.8120, lon: 108.0370 },
    ],
  },
  "Tây Nguyên": {
    "Kon Tum": [
      { name: "TP. Kon Tum", lat: 14.3500, lon: 108.0000 },
    ],
    "Gia Lai": [
      { name: "TP. Pleiku, Gia Lai", lat: 13.9830, lon: 108.0000 },
    ],
    "Đắk Lắk": [
      { name: "TP. Buôn Ma Thuột, Đắk Lắk", lat: 12.6670, lon: 108.0500 },
    ],
    "Đắk Nông": [
      { name: "TP. Gia Nghĩa, Đắk Nông", lat: 11.9870, lon: 107.6830 },
    ],
    "Lâm Đồng": [
      { name: "TP. Đà Lạt, Lâm Đồng", lat: 11.9404, lon: 108.4583 },
      { name: "TP. Bảo Lộc, Lâm Đồng", lat: 11.5470, lon: 107.8130 },
    ],
  },
  "Miền Nam": {
    "Hồ Chí Minh": [
      { name: "Quận 1, TP. HCM", lat: 10.7760, lon: 106.7009 },
      { name: "Quận 2 (Thủ Đức), TP. HCM", lat: 10.7870, lon: 106.7510 },
      { name: "Quận 3, TP. HCM", lat: 10.7860, lon: 106.6850 },
      { name: "Quận 4, TP. HCM", lat: 10.7590, lon: 106.7050 },
      { name: "Quận 5, TP. HCM", lat: 10.7550, lon: 106.6640 },
      { name: "Quận 6, TP. HCM", lat: 10.7460, lon: 106.6350 },
      { name: "Quận 7, TP. HCM", lat: 10.7350, lon: 106.7220 },
      { name: "Quận 8, TP. HCM", lat: 10.7240, lon: 106.6280 },
      { name: "Quận 9 (Thủ Đức), TP. HCM", lat: 10.8310, lon: 106.8290 },
      { name: "Quận 10, TP. HCM", lat: 10.7720, lon: 106.6680 },
      { name: "Quận 11, TP. HCM", lat: 10.7650, lon: 106.6500 },
      { name: "Quận 12, TP. HCM", lat: 10.8670, lon: 106.6410 },
      { name: "Quận Bình Thạnh, TP. HCM", lat: 10.8110, lon: 106.7090 },
      { name: "Quận Tân Bình, TP. HCM", lat: 10.8010, lon: 106.6530 },
      { name: "Quận Tân Phú, TP. HCM", lat: 10.7920, lon: 106.6280 },
      { name: "Quận Phú Nhuận, TP. HCM", lat: 10.7990, lon: 106.6820 },
      { name: "Quận Gò Vấp, TP. HCM", lat: 10.8380, lon: 106.6540 },
      { name: "Quận Bình Tân, TP. HCM", lat: 10.7650, lon: 106.6040 },
      { name: "TP. Thủ Đức, TP. HCM", lat: 10.8510, lon: 106.7540 },
      { name: "Huyện Củ Chi, TP. HCM", lat: 11.0080, lon: 106.5130 },
      { name: "Huyện Hóc Môn, TP. HCM", lat: 10.8840, lon: 106.5930 },
      { name: "Huyện Bình Chánh, TP. HCM", lat: 10.7180, lon: 106.5420 },
      { name: "Huyện Nhà Bè, TP. HCM", lat: 10.6950, lon: 106.7100 },
      { name: "Huyện Cần Giờ, TP. HCM", lat: 10.4110, lon: 106.9530 },
    ],
    "Bình Dương": [
      { name: "TP. Thủ Dầu Một, Bình Dương", lat: 10.9800, lon: 106.6500 },
      { name: "TP. Dĩ An, Bình Dương", lat: 10.9100, lon: 106.7670 },
      { name: "TP. Thuận An, Bình Dương", lat: 10.9280, lon: 106.7100 },
      { name: "TX. Bến Cát, Bình Dương", lat: 11.1020, lon: 106.6090 },
      { name: "TX. Tân Uyên, Bình Dương", lat: 11.0670, lon: 106.7630 },
    ],
    "Đồng Nai": [
      { name: "TP. Biên Hòa, Đồng Nai", lat: 10.9470, lon: 106.8240 },
      { name: "TP. Long Khánh, Đồng Nai", lat: 10.9330, lon: 107.2410 },
    ],
    "Bà Rịa - Vũng Tàu": [
      { name: "TP. Vũng Tàu", lat: 10.4114, lon: 107.1362 },
      { name: "TP. Bà Rịa", lat: 10.4970, lon: 107.1680 },
      { name: "TX. Phú Mỹ, Bà Rịa - Vũng Tàu", lat: 10.5470, lon: 107.0510 },
    ],
    "Long An": [
      { name: "TP. Tân An, Long An", lat: 10.5350, lon: 106.4140 },
    ],
    "Tiền Giang": [
      { name: "TP. Mỹ Tho, Tiền Giang", lat: 10.3540, lon: 106.3650 },
    ],
    "Bến Tre": [
      { name: "TP. Bến Tre", lat: 10.2410, lon: 106.3760 },
    ],
    "Vĩnh Long": [
      { name: "TP. Vĩnh Long", lat: 10.2510, lon: 105.9730 },
    ],
    "Cần Thơ": [
      { name: "Quận Ninh Kiều, Cần Thơ", lat: 10.0452, lon: 105.7469 },
      { name: "Quận Bình Thủy, Cần Thơ", lat: 10.0740, lon: 105.7380 },
      { name: "Quận Cái Răng, Cần Thơ", lat: 10.0120, lon: 105.7560 },
      { name: "Quận Ô Môn, Cần Thơ", lat: 10.1130, lon: 105.6350 },
      { name: "Quận Thốt Nốt, Cần Thơ", lat: 10.2230, lon: 105.5510 },
    ],
    "Hậu Giang": [
      { name: "TP. Vị Thanh, Hậu Giang", lat: 9.7830, lon: 105.4680 },
      { name: "TX. Ngã Bảy, Hậu Giang", lat: 9.8170, lon: 105.8230 },
    ],
    "Sóc Trăng": [
      { name: "TP. Sóc Trăng", lat: 9.6030, lon: 105.9800 },
    ],
    "An Giang": [
      { name: "TP. Long Xuyên, An Giang", lat: 10.3870, lon: 105.4350 },
      { name: "TP. Châu Đốc, An Giang", lat: 10.7070, lon: 105.1170 },
    ],
    "Kiên Giang": [
      { name: "TP. Rạch Giá, Kiên Giang", lat: 10.0120, lon: 105.0810 },
      { name: "TP. Hà Tiên, Kiên Giang", lat: 10.3830, lon: 104.4870 },
      { name: "TP. Phú Quốc, Kiên Giang", lat: 10.2890, lon: 103.9840 },
    ],
    "Đồng Tháp": [
      { name: "TP. Cao Lãnh, Đồng Tháp", lat: 10.4610, lon: 105.6330 },
      { name: "TP. Sa Đéc, Đồng Tháp", lat: 10.2900, lon: 105.7570 },
    ],
    "Trà Vinh": [
      { name: "TP. Trà Vinh", lat: 9.9470, lon: 106.3420 },
    ],
    "Bạc Liêu": [
      { name: "TP. Bạc Liêu", lat: 9.2940, lon: 105.7270 },
    ],
    "Cà Mau": [
      { name: "TP. Cà Mau", lat: 9.1770, lon: 105.1500 },
    ],
    "Tây Ninh": [
      { name: "TP. Tây Ninh", lat: 11.3100, lon: 106.0980 },
    ],
    "Bình Phước": [
      { name: "TP. Đồng Xoài, Bình Phước", lat: 11.5350, lon: 106.8830 },
    ],
  },
};

// Flatten danh sách để dễ tìm kiếm
export const vietnamCities = Object.values(vietnamLocations).flatMap(region =>
  Object.values(region).flatMap(province => province)
);

// Danh sách địa điểm phổ biến để hiển thị nhanh
export const popularLocations = [
  { name: "Quận Hoàn Kiếm, Hà Nội", lat: 21.0285, lon: 105.8542 },
  { name: "Quận 1, TP. HCM", lat: 10.7760, lon: 106.7009 },
  { name: "Quận Hải Châu, Đà Nẵng", lat: 16.0680, lon: 108.2210 },
  { name: "TP. Nha Trang, Khánh Hòa", lat: 12.2388, lon: 109.1967 },
  { name: "TP. Huế", lat: 16.4637, lon: 107.5909 },
  { name: "TP. Đà Lạt, Lâm Đồng", lat: 11.9404, lon: 108.4583 },
  { name: "TP. Vũng Tàu", lat: 10.4114, lon: 107.1362 },
  { name: "Quận Ninh Kiều, Cần Thơ", lat: 10.0452, lon: 105.7469 },
  { name: "TP. Hạ Long, Quảng Ninh", lat: 20.9510, lon: 107.0790 },
  { name: "TX. Sa Pa, Lào Cai", lat: 22.3400, lon: 103.8440 },
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
