import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CITIES = [
  ["Mumbai", "India", 19.076, 72.8777],
  ["Delhi", "India", 28.6139, 77.209],
  ["Bengaluru", "India", 12.9716, 77.5946],
  ["Kolkata", "India", 22.5726, 88.3639],
  ["Chennai", "India", 13.0827, 80.2707],
  ["Hyderabad", "India", 17.385, 78.4867],
  ["Pune", "India", 18.5204, 73.8567],
  ["Singapore", "Singapore", 1.3521, 103.8198],
  ["Tokyo", "Japan", 35.6762, 139.6503],
  ["Seoul", "South Korea", 37.5665, 126.978],
  ["London", "United Kingdom", 51.5074, -0.1278],
  ["Paris", "France", 48.8566, 2.3522],
  ["Amsterdam", "Netherlands", 52.3676, 4.9041],
  ["New York", "USA", 40.7128, -74.006],
  ["Seattle", "USA", 47.6062, -122.3321],
  ["Vancouver", "Canada", 49.2827, -123.1207],
  ["Toronto", "Canada", 43.6532, -79.3832],
  ["Sydney", "Australia", -33.8688, 151.2093],
  ["Auckland", "New Zealand", -36.8509, 174.7645],
  ["São Paulo", "Brazil", -23.5505, -46.6333],
  ["Mexico City", "Mexico", 19.4326, -99.1332],
  ["Manila", "Philippines", 14.5995, 120.9842],
  ["Bangkok", "Thailand", 13.7563, 100.5018],
  ["Jakarta", "Indonesia", -6.2088, 106.8456],
];

function isRainCode(code: number) {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
}

function isHeavy(code: number, rain: number, showers: number) {
  return rain >= 4 || showers >= 4 || code === 65 || code === 82;
}

export async function GET() {
  const latitude = CITIES.map(([, , lat]) => lat).join(",");
  const longitude = CITIES.map(([, , , lon]) => lon).join(",");

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set(
    "current",
    "temperature_2m,rain,showers,precipitation,weather_code,is_day"
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("precipitation_unit", "mm");

  try {
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Weather provider unavailable." },
        { status: 502 }
      );
    }

    const raw = await response.json();
    const locations = Array.isArray(raw) ? raw : [raw];

    const results = locations.map((weather, index) => {
      const [city, country] = CITIES[index]!;
      const current = weather.current ?? {};
      const rain = Number(current.rain ?? 0);
      const showers = Number(current.showers ?? 0);
      const precipitation = Number(current.precipitation ?? 0);
      const code = Number(current.weather_code ?? 0);

      return {
        city,
        country,
        rain,
        showers,
        precipitation,
        temperature: Number(current.temperature_2m ?? 0),
        weatherCode: code,
        raining: isRainCode(code) || precipitation > 0.1,
        heavy: isHeavy(code, rain, showers),
      };
    });

    const raining = results
      .filter((item) => item.raining)
      .sort((a, b) => b.precipitation - a.precipitation);

    const heavy = results
      .filter((item) => item.heavy)
      .sort((a, b) => b.precipitation - a.precipitation);

    return NextResponse.json({
      provider: "Open-Meteo",
      checkedAt: new Date().toISOString(),
      raining: raining.slice(0, 8),
      heavy: heavy.slice(0, 5),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not scan live rain conditions." },
      { status: 500 }
    );
  }
}
