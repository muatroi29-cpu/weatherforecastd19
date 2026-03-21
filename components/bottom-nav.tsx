"use client";

import { Home, Brain, Map, AlertTriangle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", label: "Trang chủ", icon: Home },
  { id: "forecast", label: "Dự báo AI", icon: Brain },
  { id: "heatmap", label: "Bản đồ", icon: Map },
  { id: "alerts", label: "Cảnh báo", icon: AlertTriangle },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-pb">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon 
                size={22} 
                className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )} 
              />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-8 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
