import { NextRequest, NextResponse } from "next/server";
import * as swe from "swisseph"; // npm i swisseph

swe.swe_set_ephe_path("./ephemeris");

const FLAG = swe.SEFLG_SWIEPH; // Swiss-Eph data files
const STAR = "Pushya"; // yogatārā of Pushya

const BODIES = [
  { id: 2, sweId: swe.SE_SUN }, // Sun
  { id: 3, sweId: swe.SE_MOON }, // Moon
  { id: 4, sweId: swe.SE_MARS }, // Mars
  { id: 5, sweId: swe.SE_MERCURY }, // Mercury
  { id: 6, sweId: swe.SE_JUPITER }, // Jupiter
  { id: 7, sweId: swe.SE_VENUS }, // Venus
  { id: 8, sweId: swe.SE_SATURN }, // Saturn
  { id: 9, sweId: swe.SE_TRUE_NODE }, // Rahu – mean node
] as const;

type EclPos = { longitude: number; error?: string } & Record<string, unknown>;
type Houses = { cusps: number[]; ascmc: number[]; error?: string };

const norm = (deg: number) => ((deg % 360) + 360) % 360;

/* Swiss-Ephemeris in Promise wrappers -------------------------------------- */

const julDayUT = (y: number, m: number, d: number, ut: number) =>
  swe.swe_julday(y, m, d, ut, swe.SE_GREG_CAL);

const fixStar = (name: string, jd: number): Promise<EclPos> =>
  new Promise((ok, bad) =>
    swe.swe_fixstar_ut(name, jd, FLAG, (res: any) =>
      res.error ? bad(new Error(res.error)) : ok(res)
    )
  );

const planetPos = (jd: number, ipl: number): Promise<EclPos> =>
  new Promise((ok, bad) =>
    swe.swe_calc_ut(jd, ipl, FLAG, (res: any) =>
      res.error ? bad(new Error(res.error)) : ok(res)
    )
  );

const houseCusps = (
  jd: number,
  lat: number,
  lon: number,
  hsys = "S"
): Promise<Houses> =>
  new Promise((ok, bad) => {
    swe.swe_houses(jd, lat, lon, hsys, (res: any) =>
      res.error ? bad(new Error(res.error)) : ok(res)
    );
  });

/* ────────────────────────── route handler ───────────────────────────────── */

export async function POST(req: NextRequest) {
  const { year, month, day, hour, minute, second, lat, lon, tz } =
    (await req.json()) as {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
      lat: number;
      lon: number;
      tz: number; // hours east of UTC; default 0 (already UT)
    };

  const timeZone = tz ?? 0; // default to 0 h if caller already supplies UT

  // convert civil (clock) time at given TZ to universal time
  const utHour = hour + minute / 60 + second / 3600 + timeZone;

  // Handle wrap‑around at midnight in a minimal way
  let jd = julDayUT(year, month, day, utHour);

  /* 1️⃣ dynamic Pushya-paksha ayanāṁśa */
  const star = await fixStar(STAR, jd); // ecliptic Δ Cnc
  const ayan = norm(star.longitude - 106); // 16 ° Cn → 106 °

  // helper to compute House number when Ascendant is at the centre of H1
  const houseOf = (lon: number, asc: number) =>
    Math.floor(norm(lon - asc + 15) / 30) + 1;

  /* 2️⃣ planets & points */
  let planets: {
    id: number;
    tropical: number;
    sidereal: number;
    sign: number;
    house: number;
  }[] = [];

  // We need latitude and longitude to compute Ascendant & houses
  if (lat === undefined || lon === undefined) {
    return NextResponse.json({
      error: "Latitude and longitude are required for house calculation.",
    });
  }

  // fetch Placidus cusps & Ascendant
  const houseData = await houseCusps(jd, lat, lon, "P");
  const tropicalAsc =
    (houseData as any).ascendant ??
    (houseData as any).ascmc?.[0] ??
    (houseData as any).ascmc?.[1]; // fallback for some bindings
  const sidAsc = norm(tropicalAsc - ayan);

  // Ascendant – always house 1
  planets.push({
    id: 1,
    tropical: tropicalAsc,
    sidereal: sidAsc,
    sign: Math.floor(sidAsc / 30) + 1,
    house: 1,
  });

  // true planets & Rahu
  for (const body of BODIES) {
    const pos = await planetPos(jd, body.sweId);
    const sid = norm(pos.longitude - ayan);
    planets.push({
      id: body.id,
      tropical: pos.longitude,
      sidereal: sid,
      sign: Math.floor(sid / 30) + 1,
      house: houseOf(sid, sidAsc),
    });

    // Capture Rahu's sidereal for Ketu derivation
    if (body.id === 9) {
      const ketuSid = norm(sid + 180);
      planets.push({
        id: 10, // Ketu
        tropical: norm(pos.longitude + 180),
        sidereal: ketuSid,
        sign: Math.floor(ketuSid / 30) + 1,
        house: houseOf(ketuSid, sidAsc),
      });
    }
  }

  planets.sort((a, b) => a.id - b.id);

  const planetNames = {
    1: "Ascendant",
    2: "Sun",
    3: "Moon",
    4: "Mars",
    5: "Mercury",
    6: "Jupiter",
    7: "Venus",
    8: "Saturn",
    9: "Rahu",
    10: "Ketu",
  };

  const signNames = {
    1: "Aries",
    2: "Taurus",
    3: "Gemini",
    4: "Cancer",
    5: "Leo",
    6: "Virgo",
    7: "Libra",
    8: "Scorpio",
    9: "Sagittarius",
    10: "Capricorn",
    11: "Aquarius",
    12: "Pisces",
  };

  // Format planets with only name, sign name, degree, and house
  const bodyPositions = planets.map((planet) => {
    const degreeInSign = planet.sidereal % 30;
    const degrees = Math.floor(degreeInSign);
    const minutes = Math.floor((degreeInSign - degrees) * 60);
    return {
      name:
        planetNames[planet.id as keyof typeof planetNames] ||
        `Unknown (${planet.id})`,
      sign:
        signNames[planet.sign as keyof typeof signNames] ||
        `Unknown (${planet.sign})`,
      degree: `${degrees}° ${minutes}'`,
      house: planet.house,
    };
  });

  return NextResponse.json(bodyPositions);
}
