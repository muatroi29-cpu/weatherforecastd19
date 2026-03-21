"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useWeather } from "@/lib/weather-context";
import { BottomNav } from "@/components/bottom-nav";
import { HomeScreen } from "@/components/screens/home-screen";
import { ForecastScreen } from "@/components/screens/forecast-screen";
import { HeatmapScreen } from "@/components/screens/heatmap-screen";
import { AlertsScreen } from "@/components/screens/alerts-screen";
import { SettingsScreen } from "@/components/screens/settings-screen";
import { AuthScreen } from "@/components/screens/auth-screen";
import { Loader2, Cloud } from "lucide-react";

export function WeatherApp() {
  const [activeTab, setActiveTab] = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isLoading: authLoading } = useAuth();
  const { refreshWeather } = useWeather();

  useEffect(() => {
    setMounted(true);
    // Initial weather fetch
    refreshWeather();
  }, []);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 shadow-lg animate-pulse">
          <Cloud className="text-primary-foreground" size={40} />
        </div>
        <Loader2 className="animate-spin text-primary mb-4" size={32} />
        <p className="text-muted-foreground">Đang tải ứng dụng...</p>
      </div>
    );
  }

  if (showAuth) {
    return <AuthScreen onClose={() => setShowAuth(false)} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
      case "forecast":
        return <ForecastScreen />;
      case "heatmap":
        return <HeatmapScreen />;
      case "alerts":
        return <AlertsScreen />;
      case "settings":
        return <SettingsScreen onShowAuth={() => setShowAuth(true)} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto px-4 pt-4">
        {renderScreen()}
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
