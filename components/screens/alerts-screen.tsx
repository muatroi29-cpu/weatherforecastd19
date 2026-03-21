"use client";

import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { mockHealthAlerts, mockActivitySuggestions } from "@/lib/mock-data";
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
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AlertsScreen() {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { 
          bg: "bg-red-500/10", 
          border: "border-red-500/30",
          text: "text-red-500",
          icon: XCircle,
          label: "Nghiêm trọng"
        };
      case "high":
        return { 
          bg: "bg-orange-500/10", 
          border: "border-orange-500/30",
          text: "text-orange-500",
          icon: AlertTriangle,
          label: "Cao"
        };
      case "medium":
        return { 
          bg: "bg-yellow-500/10", 
          border: "border-yellow-500/30",
          text: "text-yellow-500",
          icon: AlertCircle,
          label: "Trung bình"
        };
      default:
        return { 
          bg: "bg-blue-500/10", 
          border: "border-blue-500/30",
          text: "text-blue-500",
          icon: Shield,
          label: "Thấp"
        };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "uv": return Sun;
      case "air-quality": return Wind;
      case "rain": return CloudRain;
      case "heat": return Thermometer;
      case "cold": return Thermometer;
      default: return AlertTriangle;
    }
  };

  const getSuitabilityConfig = (suitability: string) => {
    switch (suitability) {
      case "excellent":
        return { bg: "bg-green-500", text: "Rất phù hợp" };
      case "good":
        return { bg: "bg-blue-500", text: "Phù hợp" };
      case "moderate":
        return { bg: "bg-yellow-500", text: "Tạm được" };
      default:
        return { bg: "bg-red-500", text: "Không khuyến khích" };
    }
  };

  const getActivityIcon = (icon: string) => {
    // Simple icon mapping
    return Activity;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Lightbulb className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold">Cảnh báo & Khuyến nghị</h1>
          <p className="text-sm text-muted-foreground">Thông tin sức khỏe và gợi ý hoạt động</p>
        </div>
      </div>

      {/* Health Alerts */}
      <WeatherCard>
        <WeatherCardHeader 
          title="Cảnh báo sức khỏe" 
          icon={<Heart size={16} className="text-red-500" />} 
        />
        <div className="space-y-3">
          {mockHealthAlerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            const AlertIcon = getAlertIcon(alert.type);
            const SeverityIcon = config.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  "p-4 rounded-2xl border transition-all hover:shadow-md",
                  config.bg,
                  config.border
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    config.bg
                  )}>
                    <AlertIcon className={config.text} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <span className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        config.bg, config.text
                      )}>
                        <SeverityIcon size={12} />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-start gap-2 p-2 rounded-xl bg-background/50">
                      <Lightbulb size={14} className="text-primary mt-0.5 flex-shrink-0" />
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
          title="Gợi ý hoạt động" 
          icon={<Activity size={16} className="text-green-500" />} 
        />
        <div className="grid grid-cols-2 gap-3">
          {mockActivitySuggestions.map((suggestion) => {
            const config = getSuitabilityConfig(suggestion.suitability);
            const Icon = getActivityIcon(suggestion.icon);

            return (
              <div
                key={suggestion.id}
                className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="text-primary" size={16} />
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    config.bg
                  )} />
                </div>
                <h4 className="font-medium text-sm mb-1">{suggestion.activity}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {suggestion.reason}
                </p>
                <span className={cn(
                  "inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium",
                  suggestion.suitability === "excellent" ? "bg-green-500/10 text-green-600" :
                  suggestion.suitability === "good" ? "bg-blue-500/10 text-blue-600" :
                  suggestion.suitability === "moderate" ? "bg-yellow-500/10 text-yellow-600" :
                  "bg-red-500/10 text-red-600"
                )}>
                  {config.text}
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
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
            <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />
            <p className="text-sm">Uống đủ nước, ít nhất 2 lít mỗi ngày do thời tiết nóng</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
            <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />
            <p className="text-sm">Tránh ra ngoài từ 10h - 15h khi chỉ số UV cao nhất</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
            <CheckCircle2 className="text-green-500 flex-shrink-0" size={18} />
            <p className="text-sm">Đeo khẩu trang khi ra ngoài để bảo vệ đường hô hấp</p>
          </div>
        </div>
      </WeatherCard>
    </div>
  );
}
