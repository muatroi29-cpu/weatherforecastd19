import { NextRequest, NextResponse } from "next/server";

const AQICN_TOKEN = "268ccfe12a9e618e973719a39684b957181d5bea";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  try {
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${AQICN_TOKEN}`;
    const res = await fetch(url, {
      // cache 30 min on server – đủ fresh cho AQI
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `AQICN HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const json = await res.json();

    if (json.status !== "ok") {
      return NextResponse.json(
        { error: json.data ?? "AQICN returned non-ok status" },
        { status: 502 }
      );
    }

    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
