import { PlanetPosition } from "./prompt&type";

const today = new Date();
const timezoneOffsetInHours = today.getTimezoneOffset() / 60;

const defaultLat = 13 + 22 / 60; // 13° 22'
const defaultLon = 79 + 12 / 60; // 79° 12'

const defaultYear = today.getFullYear();
const defaultMonth = today.getMonth() + 1;
const defaultDay = today.getDate();
const defaultHour = today.getHours();
const defaultMinute = today.getMinutes();
const defaultSecond = today.getSeconds();

export const fetchAstrologyData = async (
  params: Partial<{
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
    second?: number;
    lat?: number;
    lon?: number;
    tz?: number;
    latitude?: number;
    longitude?: number;
  }> = {}
) => {
  try {
    // Check if any parameters are provided, otherwise use defaults
    const hasAnyParams = Object.keys(params).length > 0;

    let requestData = {
      year:
        hasAnyParams && params.year !== undefined ? params.year : defaultYear,
      month:
        hasAnyParams && params.month !== undefined
          ? params.month
          : defaultMonth,
      day: hasAnyParams && params.day !== undefined ? params.day : defaultDay,
      hour:
        hasAnyParams && params.hour !== undefined ? params.hour : defaultHour,
      minute:
        hasAnyParams && params.minute !== undefined
          ? params.minute
          : defaultMinute,
      second:
        hasAnyParams && params.second !== undefined
          ? params.second
          : defaultSecond,
      lat: defaultLat,
      lon: defaultLon,
      tz:
        hasAnyParams && params.tz !== undefined
          ? params.tz
          : timezoneOffsetInHours,
    };

    // Handle latitude/longitude with both naming conventions
    if (hasAnyParams) {
      if ("latitude" in params && params.latitude !== undefined) {
        requestData.lat = params.latitude;
      } else if ("lat" in params && params.lat !== undefined) {
        requestData.lat = params.lat;
      }

      if ("longitude" in params && params.longitude !== undefined) {
        requestData.lon = params.longitude;
      } else if ("lon" in params && params.lon !== undefined) {
        requestData.lon = params.lon;
      }
    }

    const response = await fetch("/api/Astrology", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();
    return data as PlanetPosition;
  } catch (error) {
    console.error("Error fetching astrology data:", error);
    return null;
  }
};
