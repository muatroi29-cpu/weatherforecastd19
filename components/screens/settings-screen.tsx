"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsScreenProps {
  onShowAuth: () => void;
}

export function SettingsScreen({ onShowAuth }: SettingsScreenProps) {
  const { user, logout, updatePreferences } = useAuth();
  const [tempUnit, setTempUnit] = useState(user?.preferences.temperatureUnit || "celsius");
  const [notifications, setNotifications] = useState(user?.preferences.notifications ?? true);

  const handleTempUnitChange = (unit: "celsius" | "fahrenheit") => {
    setTempUnit(unit);
    if (user) {
      updatePreferences({ temperatureUnit: unit });
    }
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    if (user) {
      updatePreferences({ notifications: enabled });
    }
  };

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
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Nhiệt độ</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleTempUnitChange("celsius")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
                  tempUnit === "celsius"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                )}
              >
                Celsius (°C)
              </button>
              <button
                onClick={() => handleTempUnitChange("fahrenheit")}
                className={cn(
                  "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all",
                  tempUnit === "fahrenheit"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                )}
              >
                Fahrenheit (°F)
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
              checked={notifications}
              onCheckedChange={handleNotificationsChange}
            />
          </div>
        </div>
      </WeatherCard>

      {/* Science Corner */}
      <WeatherCard>
        <WeatherCardHeader title="Góc khoa học" icon={<BookOpen size={16} />} />
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <span className="text-sm">Chỉ số AQI là gì?</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <span className="text-sm">Cách đọc dự báo thời tiết</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <span className="text-sm">Tác động của UV lên sức khỏe</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
            <span className="text-sm">Hiểu về độ ẩm không khí</span>
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
