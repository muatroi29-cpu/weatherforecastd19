"use client";

import { useState, useMemo } from "react";
import { MapPin, Search, ChevronDown, Check, Loader2, Star } from "lucide-react";
import { vietnamLocations, vietnamCities, popularLocations } from "@/lib/mock-data";
import { useWeather } from "@/lib/weather-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LocationSelector() {
  const { selectedLocation, setSelectedLocation, isLoading } = useWeather();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return vietnamCities.filter((city) =>
      city.name.toLowerCase().includes(query)
    ).slice(0, 20);
  }, [searchQuery]);

  const handleSelect = (city: typeof vietnamCities[0]) => {
    setSelectedLocation(city);
    setOpen(false);
    setSearchQuery("");
  };

  // Nhóm địa điểm theo tỉnh/thành phố khi tìm kiếm
  const groupedResults = useMemo(() => {
    if (filteredCities.length === 0) return {};
    
    const groups: Record<string, typeof filteredCities> = {};
    filteredCities.forEach(city => {
      const parts = city.name.split(", ");
      const province = parts[parts.length - 1] || "Khác";
      if (!groups[province]) groups[province] = [];
      groups[province].push(city);
    });
    return groups;
  }, [filteredCities]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-accent transition-colors max-w-[280px]">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-primary flex-shrink-0" />
          ) : (
            <MapPin size={16} className="text-primary flex-shrink-0" />
          )}
          <span className="font-medium text-sm truncate">{selectedLocation.name}</span>
          <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-2" align="start">
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm quận, huyện, thành phố..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        
        <ScrollArea className="h-80">
          {searchQuery.trim() === "" ? (
            <>
              {/* Địa điểm phổ biến */}
              <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-1.5 px-2 py-1.5">
                <Star size={12} />
                Địa điểm phổ biến
              </DropdownMenuLabel>
              {popularLocations.map((city) => (
                <DropdownMenuItem
                  key={city.name}
                  onClick={() => handleSelect(city)}
                  className="flex items-center justify-between cursor-pointer py-2"
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{city.name}</span>
                  </div>
                  {selectedLocation.name === city.name && (
                    <Check size={14} className="text-primary flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator className="my-2" />
              
              {/* Danh sách theo vùng miền */}
              {Object.entries(vietnamLocations).map(([region, provinces]) => (
                <div key={region}>
                  <DropdownMenuLabel className="text-xs font-semibold text-primary px-2 py-1.5 bg-primary/5 rounded-md my-1">
                    {region}
                  </DropdownMenuLabel>
                  {Object.entries(provinces).slice(0, 3).map(([province, cities]) => (
                    <div key={province}>
                      <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1">
                        {province}
                      </DropdownMenuLabel>
                      {cities.slice(0, 3).map((city) => (
                        <DropdownMenuItem
                          key={city.name}
                          onClick={() => handleSelect(city)}
                          className="flex items-center justify-between cursor-pointer py-1.5 pl-4"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-muted-foreground flex-shrink-0" />
                            <span className="text-sm">{city.name.split(", ")[0]}</span>
                          </div>
                          {selectedLocation.name === city.name && (
                            <Check size={14} className="text-primary flex-shrink-0" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
              
              <p className="text-xs text-muted-foreground text-center py-3 px-2">
                Nhập tên quận/huyện để tìm kiếm thêm địa điểm
              </p>
            </>
          ) : (
            <>
              {/* Kết quả tìm kiếm */}
              {Object.keys(groupedResults).length > 0 ? (
                Object.entries(groupedResults).map(([province, cities]) => (
                  <div key={province}>
                    <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                      {province}
                    </DropdownMenuLabel>
                    {cities.map((city) => (
                      <DropdownMenuItem
                        key={city.name}
                        onClick={() => handleSelect(city)}
                        className="flex items-center justify-between cursor-pointer py-2"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-sm">{city.name}</span>
                        </div>
                        {selectedLocation.name === city.name && (
                          <Check size={14} className="text-primary flex-shrink-0" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Không tìm thấy địa điểm nào
                </p>
              )}
            </>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
