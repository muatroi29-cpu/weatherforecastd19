"use client";

import { useMemo } from "react";
import { useWeather } from "@/lib/weather-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import {
  AlertTriangle,
  Heart,
  Lightbulb,
  Sun,
  Wind,
  CloudRain,
  Thermometer,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  Droplets,
  Eye,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WeatherData, DailyForecast } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────────────────────
interface Alert {
  id: string;
  type: 'uv' | 'air-quality' | 'rain' | 'heat' | 'cold' | 'humidity' | 'wind' | 'storm';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
}

interface Suggestion {
  id: string;
  activity: string;
  icon: React.ElementType;
  suitability: 'excellent' | 'good' | 'moderate' | 'poor';
  reason: string;
}

// ── Generator functions ────────────────────────────────────────────────────
function buildAlerts(weather: WeatherData, daily: DailyForecast[]): Alert[] {
  const alerts: Alert[] = [];
  const today = daily[0];

  // UV
  if (weather.uvIndex >= 3) {
    const sev: Alert['severity'] = weather.uvIndex >= 11 ? 'critical'
      : weather.uvIndex >= 8 ? 'high'
      : weather.uvIndex >= 6 ? 'medium' : 'low';
    const label = weather.uvIndex >= 11 ? 'Cực cao' : weather.uvIndex >= 8 ? 'Rất cao' : weather.uvIndex >= 6 ? 'Cao' : 'Trung bình';
    alerts.push({
      id: 'uv',
      type: 'uv',
      severity: sev,
      title: `Chỉ số UV ${weather.uvIndex} – ${label}`,
      description: `UV hiện tại ${weather.uvIndex}. ${weather.uvIndex >= 8 ? 'Có thể gây cháy nắng nhanh và tổn thương da, mắt nghiêm trọng.' : 'Cần biện pháp bảo vệ da khi ra ngoài.'}`,
      recommendation: weather.uvIndex >= 8
        ? 'Bắt buộc kem chống nắng SPF 50+, mũ rộng vành, áo chống nắng. Tránh ra ngoài 10h–16h.'
        : weather.uvIndex >= 6
        ? 'Dùng kem SPF 30+, đội mũ và đeo kính khi ra ngoài, đặc biệt 10h–14h.'
        : 'Nên dùng kem chống nắng nhẹ khi ra ngoài lâu.',
    });
  }

  // AQI
  if (weather.aqi > 50) {
    const sev: Alert['severity'] = weather.aqi > 200 ? 'critical'
      : weather.aqi > 150 ? 'high'
      : weather.aqi > 100 ? 'medium' : 'low';
    alerts.push({
      id: 'aqi',
      type: 'air-quality',
      severity: sev,
      title: `Chất lượng không khí AQI ${weather.aqi} – ${weather.aqiDescription}`,
      description: `PM2.5 và các chất ô nhiễm ở mức ${weather.aqi > 150 ? 'nguy hiểm cho sức khỏe' : weather.aqi > 100 ? 'đáng lo ngại' : 'cần theo dõi'}.`,
      recommendation: weather.aqi > 200
        ? 'Ở trong nhà, đóng cửa sổ, dùng máy lọc không khí. Nếu buộc phải ra ngoài, đeo khẩu trang N95/KN95.'
        : weather.aqi > 150
        ? 'Đeo khẩu trang N95 khi ra ngoài. Hạn chế vận động mạnh. Trẻ em và người già không nên ra ngoài.'
        : 'Nhóm nhạy cảm đeo khẩu trang. Tránh vận động mạnh ngoài trời vào giờ cao điểm.',
    });
  }

  // Rain / Storm
  if (today && today.precipitation >= 40) {
    const isStorm = today.condition === 'stormy';
    const sev: Alert['severity'] = isStorm || today.precipitation >= 80 ? 'high' : today.precipitation >= 60 ? 'medium' : 'low';
    alerts.push({
      id: 'rain',
      type: isStorm ? 'storm' : 'rain',
      severity: sev,
      title: `${isStorm ? '⚡ Nguy cơ giông bão' : '🌧️ Khả năng mưa'} hôm nay: ${today.precipitation}%`,
      description: isStorm
        ? `Có nguy cơ giông, sấm sét. Xác suất mưa ${today.precipitation}%.`
        : `Xác suất mưa ${today.precipitation}%. ${today.precipitation >= 70 ? 'Mưa nhiều, kéo dài.' : 'Có thể mưa rào cục bộ.'}`,
      recommendation: isStorm
        ? 'Hạn chế ra ngoài khi có sấm sét. Tránh đứng dưới cây cao và vùng trũng. Để pin điện thoại đầy.'
        : today.precipitation >= 60
        ? 'Mang ô/áo mưa. Chú ý giao thông trơn trượt. Dự phòng thời gian di chuyển thêm.'
        : 'Nên mang theo ô phòng khi. Lưu ý điều kiện đường xá.',
    });
  }

  // Heat
  if (today && today.tempMax >= 35) {
    const sev: Alert['severity'] = today.tempMax >= 39 ? 'critical' : today.tempMax >= 37 ? 'high' : 'medium';
    alerts.push({
      id: 'heat',
      type: 'heat',
      severity: sev,
      title: `Nắng nóng: nhiệt độ cao nhất ${today.tempMax}°C`,
      description: `Nhiệt độ ${today.tempMax}°C kết hợp độ ẩm ${weather.humidity}% gây cảm giác như ${Math.round(today.tempMax + (weather.humidity - 40) * 0.1)}°C. Nguy cơ sốc nhiệt cao.`,
      recommendation: today.tempMax >= 38
        ? 'Uống ít nhất 3 lít nước/ngày. Nghỉ bổ sung mỗi 30 phút. Tuyệt đối không ra ngoài giữa trưa. Mặc quần áo sáng màu, thoáng.'
        : 'Uống đủ nước, tránh vận động mạnh 11h–15h. Ưu tiên bóng mát và điều hoà khi nghỉ ngơi.',
    });
  }

  // Cold
  if (today && today.tempMin <= 15) {
    alerts.push({
      id: 'cold',
      type: 'cold',
      severity: today.tempMin <= 10 ? 'high' : 'medium',
      title: `Trời lạnh: nhiệt độ thấp nhất ${today.tempMin}°C`,
      description: `Nhiệt độ về đêm và sáng sớm xuống ${today.tempMin}°C${today.tempMin <= 10 ? ', rét đậm' : ''}.`,
      recommendation: today.tempMin <= 10
        ? 'Mặc ấm nhiều lớp, đội mũ len, đeo khẩu trang giữ ấm cổ. Người cao tuổi và trẻ em cần đặc biệt chú ý.'
        : 'Chuẩn bị áo ấm khi ra ngoài sáng sớm và tối. Theo dõi sức khỏe người cao tuổi.',
    });
  }

  // High humidity
  if (weather.humidity >= 85 && weather.aqi <= 100) {
    alerts.push({
      id: 'humidity',
      type: 'humidity',
      severity: 'low',
      title: `Độ ẩm cao: ${weather.humidity}%`,
      description: `Không khí ẩm ${weather.humidity}% khiến cơ thể khó thoát nhiệt, dễ mệt mỏi và bít tắc da.`,
      recommendation: 'Mặc quần áo thoáng mát, chất liệu thấm hút tốt. Sử dụng điều hoà hoặc máy hút ẩm ở nơi kín.',
    });
  }

  // Wind
  if (weather.windSpeed >= 40) {
    alerts.push({
      id: 'wind',
      type: 'wind',
      severity: weather.windSpeed >= 60 ? 'high' : 'medium',
      title: `Gió mạnh: ${weather.windSpeed} km/h hướng ${weather.windDirection}`,
      description: `Gió ${weather.windSpeed} km/h. ${weather.windSpeed >= 60 ? 'Có thể gây đổ cây, bay vật nhẹ.' : 'Khó di chuyển bằng xe máy, xe đạp.'}`,
      recommendation: weather.windSpeed >= 60
        ? 'Hạn chế ra đường. Chằng buộc đồ vật dễ bay. Tránh khu vực có cây cao, biển quảng cáo.'
        : 'Cẩn thận khi điều khiển xe máy, xe đạp. Giảm tốc độ khi đi ngược chiều gió.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'good',
      type: 'uv',
      severity: 'low',
      title: '✅ Điều kiện thời tiết tốt hôm nay',
      description: 'Thời tiết, không khí và các chỉ số sức khỏe đều ở mức an toàn.',
      recommendation: 'Tận dụng ngày đẹp để vận động ngoài trời. Nhớ uống đủ nước và dùng kem chống nắng.',
    });
  }

  return alerts;
}

function buildSuggestions(weather: WeatherData, daily: DailyForecast[]): Suggestion[] {
  const aqi   = weather.aqi;
  const uv    = weather.uvIndex;
  const rain  = daily[0]?.precipitation ?? 0;
  const tMax  = daily[0]?.tempMax ?? weather.temperature;
  const tMin  = daily[0]?.tempMin ?? (weather.temperature - 5);
  const humid = weather.humidity;

  // Thời điểm ra ngoài an toàn nhất
  const safeTime = uv >= 8 ? 'trước 8h hoặc sau 17h' : uv >= 6 ? 'trước 9h hoặc sau 16h' : 'trong ngày';

  const outdoorOk = aqi <= 100 && rain < 50;
  const airOk     = aqi <= 150;

  return [
    {
      id: 'walk',
      activity: 'Đi bộ buổi sáng',
      icon: Activity,
      suitability: outdoorOk && tMax < 35 ? (aqi <= 50 && rain < 30 ? 'excellent' : 'good') : rain >= 70 ? 'poor' : 'moderate',
      reason: !airOk ? `AQI ${aqi} – hạn chế ra ngoài, đeo khẩu trang nếu cần đi`
        : rain >= 70 ? `Xác suất mưa ${rain}%, nên đi trong nhà`
        : tMax >= 35 ? `Nóng ${tMax}°C, chỉ đi bộ ${safeTime}`
        : `Lý tưởng ${safeTime}, không khí ${aqi <= 50 ? 'trong lành' : 'chấp nhận được'}`,
    },
    {
      id: 'run',
      activity: 'Chạy bộ / Đạp xe',
      icon: Zap,
      suitability: aqi > 150 || rain >= 60 ? 'poor' : aqi > 100 || uv > 8 || tMax >= 36 ? 'moderate' : 'good',
      reason: aqi > 150 ? `AQI ${aqi} – không vận động mạnh ngoài trời`
        : rain >= 60 ? `Xác suất mưa ${rain}%, trơn trượt nguy hiểm`
        : uv > 8 ? `UV ${uv} rất cao, chỉ chạy ${safeTime}`
        : tMax >= 36 ? `Nắng nóng ${tMax}°C, nguy cơ say nắng khi vận động mạnh`
        : `Thích hợp ${safeTime}, UV=${uv}, AQI=${aqi}`,
    },
    {
      id: 'gym',
      activity: 'Tập gym / Yoga trong nhà',
      icon: Shield,
      suitability: 'excellent',
      reason: aqi > 150 || rain >= 70 || tMax >= 37
        ? 'Ngày hôm nay điều kiện ngoài trời không tốt, đây là lựa chọn tối ưu'
        : 'Luôn phù hợp, tránh phụ thuộc thời tiết và không khí',
    },
    {
      id: 'swim',
      activity: 'Bơi lội',
      icon: Droplets,
      suitability: tMax >= 30 && rain < 60 ? 'excellent' : tMax >= 25 ? 'good' : 'moderate',
      reason: tMax >= 32 ? `Nhiệt độ ${tMax}°C, bơi lội là cách giải nhiệt tốt nhất`
        : rain >= 60 ? `Có thể mưa ${rain}% – ưu tiên bể bơi trong nhà`
        : `Nhiệt độ ${tMax}°C phù hợp bơi lội`,
    },
    {
      id: 'outdoor',
      activity: 'Dã ngoại / Picnic',
      icon: Sun,
      suitability: outdoorOk && rain < 30 && tMax <= 34 && uv <= 7 ? 'good'
        : rain >= 60 || aqi > 150 ? 'poor' : 'moderate',
      reason: rain >= 60 ? `Xác suất mưa ${rain}%, nên hoãn dã ngoại`
        : aqi > 150 ? `AQI ${aqi}, không khí không tốt cho hoạt động ngoài trời`
        : uv > 7 ? `UV ${uv} cao, cần lều/ô che nắng và kem SPF 50+`
        : `Phù hợp, nên tổ chức ${uv > 5 ? 'buổi sáng trước 10h hoặc chiều sau 16h' : 'trong ngày'}`,
    },
    {
      id: 'garden',
      activity: 'Làm vườn',
      icon: Wind,
      suitability: rain >= 70 ? 'poor' : aqi <= 100 && tMax <= 34 ? 'good' : 'moderate',
      reason: rain >= 70 ? `Mưa ${rain}% – không thuận lợi làm vườn`
        : tMax >= 35 ? `Nắng nóng ${tMax}°C, chỉ làm vườn ${safeTime}`
        : `Tốt nhất vào ${uv > 6 ? 'sáng sớm trước 9h hoặc chiều sau 16h' : 'sáng hoặc chiều mát'}`,
    },
  ];
}

// ── UI helpers ─────────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  critical: { bg: "bg-red-500/10",    border: "border-red-500/30",    text: "text-red-500",    Icon: XCircle,        label: "Nghiêm trọng" },
  high:     { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-500", Icon: AlertTriangle,  label: "Cao"           },
  medium:   { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-600", Icon: AlertCircle,    label: "Trung bình"    },
  low:      { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-500",   Icon: Shield,         label: "Thấp"          },
};

const TYPE_ICON: Record<string, React.ElementType> = {
  uv: Sun, 'air-quality': Wind, rain: CloudRain, heat: Thermometer,
  cold: Thermometer, humidity: Droplets, wind: Wind, storm: Zap,
};

const SUIT_CONFIG = {
  excellent: { bg: "bg-green-500/10",  text: "text-green-600",  label: "Rất phù hợp"       },
  good:      { bg: "bg-blue-500/10",   text: "text-blue-600",   label: "Phù hợp"            },
  moderate:  { bg: "bg-yellow-500/10", text: "text-yellow-600", label: "Tạm được"           },
  poor:      { bg: "bg-red-500/10",    text: "text-red-600",    label: "Không khuyến khích" },
};

// ── Health tips (also dynamic) ─────────────────────────────────────────────
function buildHealthTips(weather: WeatherData, daily: DailyForecast[]): string[] {
  const tips: string[] = [];
  const tMax = daily[0]?.tempMax ?? weather.temperature;
  const rain  = daily[0]?.precipitation ?? 0;

  if (tMax >= 32 || weather.humidity >= 75)
    tips.push(`Uống đủ nước – ít nhất ${tMax >= 35 ? '3' : '2'} lít mỗi ngày do thời tiết ${tMax >= 35 ? 'nắng nóng' : 'nóng ẩm'}.`);
  else
    tips.push('Uống đủ 2 lít nước mỗi ngày để duy trì sức khỏe.');

  if (weather.uvIndex >= 6)
    tips.push(`Tránh ra ngoài từ 10h–${weather.uvIndex >= 9 ? '16h' : '15h'} khi chỉ số UV đạt mức ${weather.uvIndex >= 9 ? 'rất cao' : 'cao'} (UV=${weather.uvIndex}).`);
  else
    tips.push('Bôi kem chống nắng SPF 30+ khi ra ngoài trên 30 phút dù trời không gắt.');

  if (weather.aqi > 100)
    tips.push(`AQI ${weather.aqi} – đeo khẩu trang khi ra đường để bảo vệ đường hô hấp.`);
  else if (rain >= 50)
    tips.push('Mang ô/áo mưa và giày chống trơn khi ra ngoài hôm nay.');
  else
    tips.push('Thông gió nhà cửa vào buổi sáng sớm khi không khí trong lành nhất.');

  return tips;
}

// ── Component ──────────────────────────────────────────────────────────────
export function AlertsScreen() {
  const { currentWeather, dailyForecast } = useWeather();

  const alerts     = useMemo(() => buildAlerts(currentWeather, dailyForecast),     [currentWeather, dailyForecast]);
  const suggestions = useMemo(() => buildSuggestions(currentWeather, dailyForecast), [currentWeather, dailyForecast]);
  const healthTips = useMemo(() => buildHealthTips(currentWeather, dailyForecast),  [currentWeather, dailyForecast]);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Lightbulb className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Cảnh báo & Khuyến nghị</h1>
          <p className="text-sm text-muted-foreground">
            Dựa trên thời tiết thực tế tại {currentWeather.location}
          </p>
        </div>
      </div>

      {/* Health Alerts */}
      <WeatherCard>
        <WeatherCardHeader
          title="Cảnh báo sức khỏe"
          icon={<Heart size={16} className="text-red-500" />}
        />
        <div className="space-y-3">
          {alerts.map((alert) => {
            const cfg     = SEVERITY_CONFIG[alert.severity];
            const AlertIcon = TYPE_ICON[alert.type] ?? AlertTriangle;
            const SevIcon = cfg.Icon;
            return (
              <div
                key={alert.id}
                className={cn("p-4 rounded-2xl border", cfg.bg, cfg.border)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg)}>
                    <AlertIcon className={cfg.text} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm">{alert.title}</h3>
                      <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", cfg.bg, cfg.text)}>
                        <SevIcon size={10} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                    <div className="flex items-start gap-2 p-2 rounded-xl bg-background/50">
                      <Lightbulb size={13} className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{alert.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </WeatherCard>

      {/* Activity Suggestions */}
      <WeatherCard>
        <WeatherCardHeader
          title="Gợi ý hoạt động hôm nay"
          icon={<Activity size={16} className="text-green-500" />}
        />
        <div className="grid grid-cols-2 gap-3">
          {suggestions.map((s) => {
            const sc  = SUIT_CONFIG[s.suitability];
            const Ico = s.icon;
            return (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all cursor-default group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Ico className="text-primary" size={16} />
                  </div>
                  <div className={cn("w-2 h-2 rounded-full",
                    s.suitability === 'excellent' ? 'bg-green-500' :
                    s.suitability === 'good'      ? 'bg-blue-500'  :
                    s.suitability === 'moderate'  ? 'bg-yellow-500' : 'bg-red-500'
                  )} />
                </div>
                <h4 className="font-medium text-sm mb-1">{s.activity}</h4>
                <p className="text-xs text-muted-foreground line-clamp-3">{s.reason}</p>
                <span className={cn("inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium", sc.bg, sc.text)}>
                  {sc.label}
                </span>
              </div>
            );
          })}
        </div>
      </WeatherCard>

      {/* Quick Health Tips */}
      <WeatherCard className="bg-gradient-to-br from-green-500/10 to-blue-500/5">
        <WeatherCardHeader
          title="Mẹo sức khỏe hôm nay"
          icon={<CheckCircle2 size={16} className="text-green-500" />}
        />
        <div className="space-y-3">
          {healthTips.map((tip, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
              <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />
              <p className="text-sm">{tip}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
          * Dựa trên dữ liệu thực tế: UV={currentWeather.uvIndex}, AQI={currentWeather.aqi}, Độ ẩm={currentWeather.humidity}%
          {dailyForecast[0] ? `, Mưa=${dailyForecast[0].precipitation}%, Tmax=${dailyForecast[0].tempMax}°C` : ''}
        </p>
      </WeatherCard>
    </div>
  );
}
