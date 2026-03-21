"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface WeatherCardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  glass?: boolean;
}

export function WeatherCard({ children, className, gradient = false, glass = false }: WeatherCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl p-5 transition-all duration-300",
        glass ? "glass" : "bg-card weather-card",
        gradient && "bg-gradient-to-br from-primary/10 to-accent/10",
        className
      )}
    >
      {children}
    </div>
  );
}

interface WeatherCardHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function WeatherCardHeader({ title, icon, action }: WeatherCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>
      </div>
      {action}
    </div>
  );
}
