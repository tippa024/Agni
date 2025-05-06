import { PlanetName } from "./prompt&type";
import { fetchAstrologyData } from "./apiCall";
import { PlanetPosition, AstrologicalData } from "./prompt&type";

export const getAstrologicalData = async (
  latitude: number,
  longitude: number,
  year?: number,
  month?: number,
  day?: number,
  hour?: number,
  minute?: number,
  second?: number
) => {
  const planetPositions = await fetchAstrologyData({
    latitude: latitude,
    longitude: longitude,
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute,
    second: second,
  });

  const signRulers: Record<string, PlanetName> = {
    Aries: "Mars",
    Taurus: "Venus",
    Gemini: "Mercury",
    Cancer: "Moon",
    Leo: "Sun",
    Virgo: "Mercury",
    Libra: "Venus",
    Scorpio: "Mars",
    Sagittarius: "Jupiter",
    Capricorn: "Saturn",
    Aquarius: "Saturn",
    Pisces: "Jupiter",
  };

  // Transform PlanetPosition[] into AstrologicalData[]
  const astrologicalDataResult: AstrologicalData[] = [];

  if (Array.isArray(planetPositions)) {
    // First pass to create a map of planet positions for easy lookup
    const planetMap: Partial<Record<PlanetName, PlanetPosition>> = {};
    planetPositions.forEach((planet: PlanetPosition) => {
      planetMap[planet.name] = planet;
    });

    // Second pass to create AstrologicalData for each planet
    planetPositions.forEach((planet: PlanetPosition) => {
      const lordName = signRulers[planet.sign];
      const lordPlanet = planetMap[lordName];

      if (lordPlanet) {
        const astroData: AstrologicalData = {
          ...planet,
          lord: lordName,
          lordSign: lordPlanet.sign,
          lordHouse: lordPlanet.house,
        };
        astrologicalDataResult.push(astroData);
      }
    });
  }
  return {
    astrologicalDataResult,
  };
};
