"use client";

import { useState } from "react";
import { MapPin, Search, ChevronDown, Check, Loader2 } from "lucide-react";
import { vietnamCities } from "@/lib/mock-data";
import { useWeather } from "@/lib/weather-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function LocationSelector() {
  const { selectedLocation, setSelectedLocation, isLoading } = useWeather();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filteredCities = vietnamCities.filter((city) =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (city: typeof vietnamCities[0]) => {
    setSelectedLocation(city);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-accent transition-colors">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-primary" />
          ) : (
            <MapPin size={16} className="text-primary" />
          )}
          <span className="font-medium text-sm">{selectedLocation.name}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2" align="start">
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm thành phố..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredCities.map((city) => (
            <DropdownMenuItem
              key={city.name}
              onClick={() => handleSelect(city)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-muted-foreground" />
                <span>{city.name}</span>
              </div>
              {selectedLocation.name === city.name && (
                <Check size={14} className="text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          {filteredCities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Không tìm thấy thành phố
            </p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
