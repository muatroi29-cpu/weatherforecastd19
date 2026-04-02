import { NextRequest, NextResponse } from "next/server";

const TOKEN = "268ccfe12a9e618e973719a39684b957181d5bea";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug"); // e.g. "hanoi" or "vietnam/hanoi"

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    const url = `https://api.waqi.info/feed/${encodeURIComponent(slug)}/?token=${TOKEN}`;
    const res = await fetch(url, {
      // no Next cache – we want fresh data every call (we handle interval client-side)
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `AQICN HTTP ${res.status}` }, { status: res.status });
    }

    const json = await res.json();

    if (json.status !== "ok") {
      // "ndf" = station not found
      return NextResponse.json({ error: json.data ?? "station not found" }, { status: 404 });
    }

    return NextResponse.json(json, {
      headers: {
        // tell client how old the data is
        "X-AQICN-Time": json.data?.time?.s ?? "",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
