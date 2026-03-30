"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  User, 
  Bell, 
  Thermometer, 
  Wind,
  LogOut,
  BookOpen,
  Info,
  ChevronRight,
  Shield,
  Palette,
  Gauge,
  X,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsScreenProps {
  onShowAuth: () => void;
}

// Nội dung góc khoa học
const scienceContent = {
  aqi: {
    title: "Chỉ số AQI là gì?",
    content: `AQI (Air Quality Index) là chỉ số đo lường chất lượng không khí, giúp bạn hiểu không khí xung quanh sạch hay ô nhiễm.

**Các mức AQI:**
• **0-50 (Tốt):** Chất lượng không khí tốt, ít hoặc không có nguy cơ đối với sức khỏe.
• **51-100 (Trung bình):** Chất lượng không khí chấp nhận được. Tuy nhiên, một số người nhạy cảm có thể gặp vấn đề.
• **101-150 (Kém):** Nhóm người nhạy cảm (trẻ em, người già, người có bệnh hô hấp) có thể bị ảnh hưởng.
• **151-200 (Xấu):** Mọi người bắt đầu bị ảnh hưởng sức khỏe; nhóm nhạy cảm bị ảnh hưởng nghiêm trọng hơn.
• **201-300 (Rất xấu):** Cảnh báo sức khỏe khẩn cấp. Toàn bộ dân số có thể bị ảnh hưởng.
• **>300 (Nguy hại):** Cảnh báo sức khỏe: mọi người có thể gặp ảnh hưởng sức khỏe nghiêm trọng.

**Các chất ô nhiễm được đo:**
• PM2.5: Bụi mịn có đường kính nhỏ hơn 2.5 micromet
• PM10: Bụi có đường kính nhỏ hơn 10 micromet
• O3: Ozone mặt đất
• NO2: Nitrogen dioxide
• SO2: Sulfur dioxide
• CO: Carbon monoxide`
  },
  forecast: {
    title: "Cách đọc dự báo thời tiết",
    content: `Dự báo thời tiết cung cấp thông tin về điều kiện khí tượng trong tương lai. Đây là cách đọc hiểu các thông số:

**Nhiệt độ:**
• **Nhiệt độ thực:** Nhiệt độ không khí đo được
• **Cảm giác như:** Nhiệt độ cơ thể cảm nhận, tính đến độ ẩm và gió

**Độ ẩm:**
• Dưới 30%: Khô, có thể gây khô da
• 30-50%: Thoải mái
• 50-70%: Hơi ẩm
• Trên 70%: Rất ẩm, có thể gây khó chịu

**Xác suất mưa:**
• Phần trăm khả năng có mưa trong khoảng thời gian nhất định
• 0-20%: Rất ít khả năng mưa
• 20-50%: Có thể mưa
• 50-80%: Nhiều khả năng mưa
• 80-100%: Rất có khả năng mưa

**Tầm nhìn:**
• Trên 10km: Tốt
• 5-10km: Trung bình
• 1-5km: Hạn chế
• Dưới 1km: Rất hạn chế (sương mù dày)`
  },
  uv: {
    title: "Tác động của UV lên sức khỏe",
    content: `Chỉ số UV đo lường cường độ tia cực tím từ mặt trời có thể gây hại cho da.

**Các mức chỉ số UV:**
• **0-2 (Thấp):** Nguy cơ thấp. Có thể hoạt động ngoài trời bình thường.
• **3-5 (Trung bình):** Nguy cơ trung bình. Nên đội mũ và đeo kính râm.
• **6-7 (Cao):** Nguy cơ cao. Cần che chắn, tránh ra ngoài 10h-16h.
• **8-10 (Rất cao):** Nguy cơ rất cao. Hạn chế ra ngoài, cần kem chống nắng SPF 30+.
• **11+ (Cực cao):** Nguy hiểm. Tránh ra ngoài nếu có thể.

**Biện pháp bảo vệ:**
• Đội mũ rộng vành
• Đeo kính râm chống UV
• Mặc quần áo dài, tối màu
• Sử dụng kem chống nắng SPF 30+, bôi lại mỗi 2 giờ
• Tìm bóng râm vào giữa trưa

**Ai cần đặc biệt lưu ý:**
• Trẻ em và em bé
• Người có làn da sáng màu
• Người làm việc ngoài trời
• Người có tiền sử ung thư da`
  },
  humidity: {
    title: "Hiểu về độ ẩm không khí",
    content: `Độ ẩm là lượng hơi nước có trong không khí, ảnh hưởng đến cảm giác về nhiệt độ và sức khỏe.

**Độ ẩm tương đối:**
Là tỷ lệ phần trăm lượng hơi nước trong không khí so với lượng tối đa mà không khí có thể chứa ở nhiệt độ đó.

**Ảnh hưởng của độ ẩm:**

**Độ ẩm thấp (dưới 30%):**
• Da khô, nứt nẻ
• Kích ứng mắt và đường hô hấp
• Tĩnh điện nhiều hơn
• Virus cúm tồn tại lâu hơn

**Độ ẩm cao (trên 60%):**
• Cảm giác nóng hơn nhiệt độ thực
• Mồ hôi khó bay hơi
• Nấm mốc dễ phát triển
• Côn trùng sinh sôi nhanh

**Độ ẩm lý tưởng:**
• Trong nhà: 40-60%
• Thoải mái nhất: 45-55%

**Mẹo điều chỉnh:**
• Độ ẩm thấp: Sử dụng máy tạo ẩm, đặt chậu nước
• Độ ẩm cao: Sử dụng máy hút ẩm, mở cửa thông gió`
  }
};

type ScienceKey = keyof typeof scienceContent;

export function SettingsScreen({ onShowAuth }: SettingsScreenProps) {
  const { user, logout, updatePreferences } = useAuth();
  const [tempUnit, setTempUnit] = useState(user?.preferences.temperatureUnit || "celsius");
  const [windUnit, setWindUnit] = useState(user?.preferences.windSpeedUnit || "kmh");
  const [pressureUnit, setPressureUnit] = useState(user?.preferences.pressureUnit || "hpa");
  const [notificationsWeather, setNotificationsWeather] = useState(user?.preferences.notifications.weather ?? true);
  const [notificationsAqi, setNotificationsAqi] = useState(user?.preferences.notifications.aqi ?? true);
  const [notificationsDailyForecast, setNotificationsDailyForecast] = useState(user?.preferences.notifications.dailyForecast ?? true);
  const [selectedArticle, setSelectedArticle] = useState<ScienceKey | null>(null);

  const handleTempUnitChange = (unit: "celsius" | "fahrenheit") => {
    setTempUnit(unit);
    if (user) {
      updatePreferences({ temperatureUnit: unit });
    }
  };

  const handleWindUnitChange = (unit: "kmh" | "mph" | "ms") => {
    setWindUnit(unit);
    if (user) {
      updatePreferences({ windSpeedUnit: unit });
    }
  };

  const handlePressureUnitChange = (unit: "hpa" | "mmhg") => {
    setPressureUnit(unit);
    if (user) {
      updatePreferences({ pressureUnit: unit });
    }
  };

  const handleWeatherNotificationChange = (enabled: boolean) => {
    setNotificationsWeather(enabled);
    if (user) {
      updatePreferences({ 
        notifications: { 
          weather: enabled, 
          aqi: notificationsAqi, 
          dailyForecast: notificationsDailyForecast 
        } 
      });
    }
  };

  const handleAqiNotificationChange = (enabled: boolean) => {
    setNotificationsAqi(enabled);
    if (user) {
      updatePreferences({ 
        notifications: { 
          weather: notificationsWeather, 
          aqi: enabled, 
          dailyForecast: notificationsDailyForecast 
        } 
      });
    }
  };

  const handleDailyForecastNotificationChange = (enabled: boolean) => {
    setNotificationsDailyForecast(enabled);
    if (user) {
      updatePreferences({ 
        notifications: { 
          weather: notificationsWeather, 
          aqi: notificationsAqi, 
          dailyForecast: enabled 
        } 
      });
    }
  };

  // Science article modal
  if (selectedArticle) {
    const article = scienceContent[selectedArticle];
    return (
      <div className="space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedArticle(null)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{article.title}</h1>
            <p className="text-sm text-muted-foreground">Góc khoa học</p>
          </div>
        </div>

        {/* Content */}
        <WeatherCard>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {article.content.split('\n\n').map((paragraph, index) => {
              // Check if it's a heading (starts with **)
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <h3 key={index} className="font-bold text-base mt-4 mb-2 text-foreground">
                    {paragraph.replace(/\*\*/g, '')}
                  </h3>
                );
              }
              
              // Check if it contains bullet points
              if (paragraph.includes('• ')) {
                const lines = paragraph.split('\n');
                const title = lines[0].startsWith('**') ? lines[0] : null;
                const bullets = lines.filter(l => l.startsWith('• '));
                
                return (
                  <div key={index} className="mb-4">
                    {title && (
                      <h4 className="font-semibold text-sm mb-2 text-foreground">
                        {title.replace(/\*\*/g, '')}
                      </h4>
                    )}
                    <ul className="space-y-1.5">
                      {bullets.map((bullet, bIndex) => {
                        const text = bullet.replace('• ', '');
                        // Check if bullet has bold text
                        if (text.includes('**')) {
                          const parts = text.split('**');
                          return (
                            <li key={bIndex} className="flex gap-2 text-sm text-muted-foreground">
                              <span className="text-primary">•</span>
                              <span>
                                <strong className="text-foreground">{parts[1]}</strong>
                                {parts[2]}
                              </span>
                            </li>
                          );
                        }
                        return (
                          <li key={bIndex} className="flex gap-2 text-sm text-muted-foreground">
                            <span className="text-primary">•</span>
                            <span>{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              }
              
              // Regular paragraph
              return (
                <p key={index} className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </WeatherCard>

        {/* Back button */}
        <Button 
          onClick={() => setSelectedArticle(null)} 
          className="w-full"
          variant="outline"
        >
          <ArrowLeft size={16} className="mr-2" />
          Quay lại cài đặt
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Settings className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Cài đặt</h1>
          <p className="text-sm text-muted-foreground">Tùy chỉnh ứng dụng theo sở thích</p>
        </div>
      </div>

      {/* Profile Card */}
      <WeatherCard>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <User className="text-primary-foreground" size={28} />
          </div>
          <div className="flex-1">
            {user ? (
              <>
                <h2 className="font-bold text-lg">{user.displayName}</h2>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </>
            ) : (
              <>
                <h2 className="font-bold text-lg">Khách</h2>
                <p className="text-sm text-muted-foreground">Đăng nhập để lưu cài đặt</p>
              </>
            )}
          </div>
          {user ? (
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut size={16} className="mr-2" />
              Đăng xuất
            </Button>
          ) : (
            <Button size="sm" onClick={onShowAuth}>
              Đăng nhập
            </Button>
          )}
        </div>
      </WeatherCard>

      {/* Appearance */}
      <WeatherCard>
        <WeatherCardHeader title="Giao diện" icon={<Palette size={16} />} />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Chế độ tối / sáng</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </WeatherCard>

      {/* Units */}
      <WeatherCard>
        <WeatherCardHeader title="Đơn vị đo" icon={<Thermometer size={16} />} />
        <div className="space-y-5">
          {/* Temperature */}
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Thermometer size={14} className="text-muted-foreground" />
              Nhiệt độ
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleTempUnitChange("celsius")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                  tempUnit === "celsius"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-accent"
                )}
              >
                Celsius (°C)
              </button>
              <button
                onClick={() => handleTempUnitChange("fahrenheit")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                  tempUnit === "fahrenheit"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-accent"
                )}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Wind Speed */}
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Wind size={14} className="text-muted-foreground" />
              Tốc độ gió
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleWindUnitChange("kmh")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                  windUnit === "kmh"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-accent"
                )}
              >
                km/h
              </button>
              <button
                onClick={() => handleWindUnitChange("mph")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                  windUnit === "mph"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-accent"
                )}
              >
                mph
              </button>
              <button
                onClick={() => handleWindUnitChange("ms")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                  windUnit === "ms"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-accent"
                )}
              >
                m/s
              </button>
            </div>
          </div>

          {/* Pressure */}
          <div>
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Gauge size={14} className="text-muted-foreground" />
              Áp suất
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePressureUnitChange("hpa")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                  pressureUnit === "hpa"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-accent"
                )}
              >
                hPa
              </button>
              <button
                onClick={() => handlePressureUnitChange("mmhg")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                  pressureUnit === "mmhg"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted hover:bg-accent"
                )}
              >
                mmHg
              </button>
            </div>
          </div>
        </div>
      </WeatherCard>

      {/* Notifications */}
      <WeatherCard>
        <WeatherCardHeader title="Thông báo" icon={<Bell size={16} />} />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cảnh báo thời tiết</p>
              <p className="text-xs text-muted-foreground">Nhận thông báo khi có thời tiết xấu</p>
            </div>
            <Switch
              checked={notificationsWeather}
              onCheckedChange={handleWeatherNotificationChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cảnh báo chất lượng không khí</p>
              <p className="text-xs text-muted-foreground">Thông báo khi AQI vượt ngưỡng an toàn</p>
            </div>
            <Switch
              checked={notificationsAqi}
              onCheckedChange={handleAqiNotificationChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dự báo hàng ngày</p>
              <p className="text-xs text-muted-foreground">Nhận dự báo thời tiết mỗi sáng</p>
            </div>
            <Switch
              checked={notificationsDailyForecast}
              onCheckedChange={handleDailyForecastNotificationChange}
            />
          </div>
        </div>
      </WeatherCard>

      {/* Science Corner */}
      <WeatherCard>
        <WeatherCardHeader title="Góc khoa học" icon={<BookOpen size={16} />} />
        <div className="space-y-2">
          <button 
            onClick={() => setSelectedArticle("aqi")}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Wind size={16} className="text-green-600" />
              </div>
              <span className="text-sm">Chỉ số AQI là gì?</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => setSelectedArticle("forecast")}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Info size={16} className="text-blue-600" />
              </div>
              <span className="text-sm">Cách đọc dự báo thời tiết</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => setSelectedArticle("uv")}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Thermometer size={16} className="text-orange-600" />
              </div>
              <span className="text-sm">Tác động của UV lên sức khỏe</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => setSelectedArticle("humidity")}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Gauge size={16} className="text-cyan-600" />
              </div>
              <span className="text-sm">Hiểu về độ ẩm không khí</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>
      </WeatherCard>

      {/* About */}
      <WeatherCard>
        <WeatherCardHeader title="Thông tin" icon={<Info size={16} />} />
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <span className="text-sm">Phiên bản</span>
            <span className="text-sm text-muted-foreground">1.0.0</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
            <span className="text-sm">Nguồn dữ liệu</span>
            <span className="text-sm text-muted-foreground">Open-Meteo API</span>
          </div>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-muted-foreground" />
              <span className="text-sm">Chính sách bảo mật</span>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>
      </WeatherCard>
    </div>
  );
}
