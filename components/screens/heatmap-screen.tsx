"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WeatherCard, WeatherCardHeader } from "@/components/weather-card";
import { Map, Wind, Layers, AlertTriangle, Heart, Activity, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { pm25ToAqi, epaToAqi } from "@/lib/aqi-utils";

const API_KEY = 'ecd27c0bc5cf4eb6a70143329263003';

const HANOI_DISTRICTS = [
  { name: "Hoàn Kiếm",  lat: 21.0285, lon: 105.8542 },
  { name: "Ba Đình",    lat: 21.0340, lon: 105.8180 },
  { name: "Đống Đa",    lat: 21.0183, lon: 105.8281 },
  { name: "Hai Bà Trưng", lat: 21.0064, lon: 105.8594 },
  { name: "Tây Hồ",    lat: 21.0680, lon: 105.8230 },
  { name: "Thanh Xuân", lat: 20.9932, lon: 105.8098 },
  { name: "Cầu Giấy",  lat: 21.0320, lon: 105.7880 },
  { name: "Long Biên",  lat: 21.0470, lon: 105.8890 },
  { name: "Hà Đông",   lat: 20.9720, lon: 105.7780 },
  { name: "Nam Từ Liêm", lat: 21.0186, lon: 105.7560 },
  { name: "Bắc Từ Liêm", lat: 21.0680, lon: 105.7450 },
  { name: "Hoàng Mai", lat: 20.9765, lon: 105.8645 },
];

interface DistrictData {
  name:   string;
  aqi:    number;
  pm25:   number;
  pm10:   number;
  o3:     number;
  no2:    number;
  so2:    number;
  co:     number;
  status: 'loading' | 'ok' | 'error';
}

// ── Fetch một quận ────────────────────────────────────────────────────────
async function fetchOne(d: typeof HANOI_DISTRICTS[0]): Promise<DistrictData> {
  const res = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${d.lat},${d.lon}&aqi=yes`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const aq   = json.current?.air_quality ?? {};

  const pm25 = typeof aq.pm2_5 === 'number' ? aq.pm2_5 : -1;
  const epa  = aq['us-epa-index'] ?? 1;
  const aqi  = pm25 >= 0 ? pm25ToAqi(pm25) : epaToAqi(Math.round(epa));

  return {
    name:   d.name,
    aqi,
    pm25:   pm25 >= 0 ? Math.round(pm25 * 10) / 10 : 0,
    pm10:   typeof aq.pm10 === 'number' ? Math.round(aq.pm10)  : 0,
    o3:     typeof aq.o3   === 'number' ? Math.round(aq.o3)    : 0,
    no2:    typeof aq.no2  === 'number' ? Math.round(aq.no2)   : 0,
    so2:    typeof aq.so2  === 'number' ? Math.round(aq.so2)   : 0,
    co:     typeof aq.co   === 'number' ? parseFloat((aq.co).toFixed(1)) : 0,
    status: 'ok',
  };
}

// ── Colour helpers ─────────────────────────────────────────────────────────
function bgColor(aqi: number): string {
  if (aqi <= 50)  return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-rose-900";
}
function textColor(aqi: number): string {
  if (aqi <= 50)  return "text-green-600";
  if (aqi <= 100) return "text-yellow-600";
  if (aqi <= 150) return "text-orange-600";
  if (aqi <= 200) return "text-red-600";
  if (aqi <= 300) return "text-purple-600";
  return "text-rose-900";
}
function aqiLabel(aqi: number): string {
  if (aqi <= 50)  return "Tốt";
  if (aqi <= 100) return "Trung bình";
  if (aqi <= 150) return "Kém";
  if (aqi <= 200) return "Xấu";
  if (aqi <= 300) return "Rất xấu";
  return "Nguy hại";
}
function healthAdvice(aqi: number): string {
  if (aqi <= 50)  return "Chất lượng không khí tốt, phù hợp mọi hoạt động ngoài trời.";
  if (aqi <= 100) return "Chấp nhận được. Nhóm nhạy cảm nên hạn chế hoạt động kéo dài.";
  if (aqi <= 150) return "Trẻ em, người già và người bệnh hô hấp nên hạn chế ra ngoài.";
  if (aqi <= 200) return "Mọi người nên giảm hoạt động ngoài. Đeo khẩu trang khi ra ngoài.";
  if (aqi <= 300) return "Cảnh báo sức khoẻ nghiêm trọng. Hạn chế tối đa hoạt động ngoài.";
  return "Nguy hiểm! Ở trong nhà, đóng cửa sổ. Dùng máy lọc không khí nếu có.";
}

// ── Component ──────────────────────────────────────────────────────────────
export function HeatmapScreen() {
  // Khởi tạo với tất cả quận ở trạng thái loading, KHÔNG dùng mock
  const [districts, setDistricts] = useState<DistrictData[]>(
    HANOI_DISTRICTS.map(d => ({ name: d.name, aqi: 0, pm25: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0, status: 'loading' as const }))
  );
  const [selected,     setSelected]     = useState<DistrictData | null>(null);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const [globalLoading, setGlobalLoading] = useState(true);
  const fetchRef = useRef(0);

  // Cập nhật 1 quận vào state ngay khi nó xong (real-time trickle)
  const updateDistrict = useCallback((data: DistrictData) => {
    setDistricts(prev => prev.map(d => d.name === data.name ? data : d));
  }, []);

  const fetchAll = useCallback(async () => {
    const id = ++fetchRef.current;
    setGlobalLoading(true);

    // Reset tất cả về loading
    setDistricts(HANOI_DISTRICTS.map(d => ({
      name: d.name, aqi: 0, pm25: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0, status: 'loading' as const,
    })));
    setSelected(null);

    // Fetch từng quận song song, cập nhật UI ngay khi từng quận xong
    const promises = HANOI_DISTRICTS.map(async (d) => {
      try {
        const result = await fetchOne(d);
        if (id !== fetchRef.current) return;
        updateDistrict(result);
        return result;
      } catch {
        if (id !== fetchRef.current) return;
        updateDistrict({ name: d.name, aqi: 0, pm25: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0, status: 'error' });
      }
    });

    // Đợi tất cả để mark xong
    await Promise.allSettled(promises);
    if (id !== fetchRef.current) return;
    setGlobalLoading(false);
    setLastUpdated(new Date());
  }, [updateDistrict]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const loadedDistricts = districts.filter(d => d.status === 'ok' && d.aqi > 0);
  const sortedByAqi     = [...loadedDistricts].sort((a, b) => b.aqi - a.aqi);
  const avgAqi = loadedDistricts.length > 0
    ? Math.round(loadedDistricts.reduce((s, d) => s + d.aqi, 0) / loadedDistricts.length)
    : null;

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Map className="text-primary" size={20} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Bản đồ chất lượng không khí</h1>
          <p className="text-sm text-muted-foreground">
            {lastUpdated
              ? `Cập nhật ${lastUpdated.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})} · AQI từ PM2.5 thực tế`
              : globalLoading
              ? `Đang tải ${loadedDistricts.length}/${HANOI_DISTRICTS.length} quận...`
              : 'Dữ liệu AQI thời gian thực'}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={globalLoading}
          className="p-2 rounded-full bg-card/80 hover:bg-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={cn("text-muted-foreground", globalLoading && "animate-spin")} />
        </button>
      </div>

      {/* Map Grid */}
      <WeatherCard>
        <WeatherCardHeader
          title={`Bản đồ AQI – Hà Nội${avgAqi ? ` (TB: ${avgAqi})` : ''}`}
          icon={<Layers size={16} />}
        />
        <div className="relative h-72 bg-gradient-to-b from-muted/30 to-muted/50 rounded-2xl overflow-hidden p-2">
          <div className="grid grid-cols-4 grid-rows-3 gap-1.5 h-full">
            {districts.map((d) => {
              const isSelected = selected?.name === d.name;
              return (
                <button
                  key={d.name}
                  onClick={() => d.status === 'ok' && d.aqi > 0 && setSelected(d)}
                  disabled={d.status !== 'ok' || d.aqi === 0}
                  className={cn(
                    "relative rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-200",
                    d.status === 'ok' && d.aqi > 0
                      ? `${bgColor(d.aqi)} hover:scale-105 cursor-pointer active:scale-95`
                      : d.status === 'error'
                      ? "bg-muted/60 cursor-not-allowed"
                      : "bg-muted/40 cursor-wait",
                    isSelected && "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-105 z-10"
                  )}
                >
                  <span className="text-[10px] font-medium text-white/90 drop-shadow text-center leading-tight">
                    {d.name}
                  </span>
                  {d.status === 'loading' ? (
                    <Loader2 size={12} className="text-muted-foreground animate-spin mt-0.5" />
                  ) : d.status === 'error' ? (
                    <span className="text-xs text-muted-foreground">–</span>
                  ) : (
                    <span className="text-base font-bold text-white drop-shadow leading-none mt-0.5">
                      {d.aqi}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Tốt</span>
          {["bg-green-500","bg-yellow-500","bg-orange-500","bg-red-500","bg-purple-500","bg-rose-900"].map(c => (
            <span key={c} className={`w-5 h-3 rounded ${c}`} />
          ))}
          <span className="text-xs text-muted-foreground">Nguy hại</span>
        </div>

        {globalLoading && loadedDistricts.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Đang tải thêm... ({loadedDistricts.length}/{HANOI_DISTRICTS.length} quận)
          </p>
        )}
      </WeatherCard>

      {/* Selected District Detail */}
      {selected && (
        <WeatherCard className="border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Quận {selected.name}</h3>
              <p className={cn("text-sm font-medium", textColor(selected.aqi))}>
                {aqiLabel(selected.aqi)}
              </p>
            </div>
            <div className={cn(
              "w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white",
              bgColor(selected.aqi)
            )}>
              <span className="font-bold text-2xl leading-none">{selected.aqi}</span>
              <span className="text-[9px] opacity-80 mt-0.5">AQI</span>
            </div>
          </div>

          {/* Pollutants */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "PM2.5", value: selected.pm25, unit: "µg/m³", hi: true },
              { label: "PM10",  value: selected.pm10, unit: "µg/m³", hi: false },
              { label: "O₃",    value: selected.o3,   unit: "µg/m³", hi: false },
              { label: "NO₂",   value: selected.no2,  unit: "µg/m³", hi: false },
              { label: "SO₂",   value: selected.so2,  unit: "µg/m³", hi: false },
              { label: "CO",    value: selected.co,   unit: "mg/m³", hi: false },
            ].map(({ label, value, unit, hi }) => (
              <div key={label} className={cn("rounded-xl p-3 text-center", hi ? "bg-primary/10" : "bg-muted/30")}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn("font-bold text-lg", hi && "text-primary")}>{value || '–'}</p>
                <p className="text-[10px] text-muted-foreground">{unit}</p>
              </div>
            ))}
          </div>

          {/* Health advice */}
          <div className="p-3 rounded-xl bg-muted/30 flex items-start gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              selected.aqi <= 100 ? "bg-green-500/20" : "bg-orange-500/20"
            )}>
              <Heart size={16} className={selected.aqi <= 100 ? "text-green-600" : "text-orange-600"} />
            </div>
            <div>
              <p className="text-sm font-medium">Khuyến nghị sức khỏe</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {healthAdvice(selected.aqi)}
              </p>
            </div>
          </div>
        </WeatherCard>
      )}

      {/* Ranking */}
      {sortedByAqi.length > 0 && (
        <WeatherCard>
          <WeatherCardHeader title="Xếp hạng AQI" icon={<Activity size={16} />} />
          <div className="space-y-2">
            {sortedByAqi.map((d, i) => (
              <button
                key={d.name}
                onClick={() => setSelected(d)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                  selected?.name === d.name ? "bg-primary/10 ring-1 ring-primary/30" : "bg-muted/30 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    i < 3 ? "bg-red-500/20 text-red-600" : "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </span>
                  <div className="text-left">
                    <p className="font-medium text-sm">Quận {d.name}</p>
                    <p className={cn("text-xs", textColor(d.aqi))}>
                      {aqiLabel(d.aqi)}
                      {d.pm25 > 0 && <span className="text-muted-foreground"> · PM2.5: {d.pm25}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", bgColor(d.aqi))} />
                  <span className="font-bold">{d.aqi}</span>
                </div>
              </button>
            ))}
          </div>
          {globalLoading && (
            <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <Loader2 size={11} className="animate-spin" />
              Đang tải thêm quận...
            </p>
          )}
        </WeatherCard>
      )}

      {/* AQI scale info */}
      <WeatherCard>
        <WeatherCardHeader title="Thang AQI (US EPA)" icon={<AlertTriangle size={16} />} />
        <div className="space-y-2">
          {[
            { r:"0–50",   l:"Tốt",              d:"An toàn cho mọi người",                         c:"bg-green-500"  },
            { r:"51–100", l:"Trung bình",        d:"Nhóm nhạy cảm cần chú ý",                      c:"bg-yellow-500" },
            { r:"101–150",l:"Kém (nhạy cảm)",   d:"Người già, trẻ em, bệnh hô hấp hạn chế ra ngoài", c:"bg-orange-500" },
            { r:"151–200",l:"Kém",              d:"Mọi người có thể bị ảnh hưởng sức khoẻ",       c:"bg-red-500"    },
            { r:"201–300",l:"Rất kém",          d:"Cảnh báo sức khoẻ khẩn cấp",                   c:"bg-purple-500" },
            { r:"300+",   l:"Nguy hại",         d:"Nguy hiểm – tránh ra ngoài hoàn toàn",          c:"bg-rose-900"   },
          ].map(({ r, l, d, c }) => (
            <div key={r} className="flex items-center gap-3 p-2 rounded-lg">
              <span className={`w-4 h-4 rounded flex-shrink-0 ${c}`} />
              <div>
                <p className="text-sm font-medium">{r}: {l}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
          * AQI tính từ PM2.5 thực tế theo chuẩn US EPA. Nguồn: WeatherAPI.com
        </p>
      </WeatherCard>
    </div>
  );
}
