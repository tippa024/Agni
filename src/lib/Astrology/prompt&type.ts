export type PlanetName =
  | "Ascendant"
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn"
  | "Rahu"
  | "Ketu";

export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface PlanetPosition {
  name: PlanetName;
  sign: ZodiacSign;
  degree: string;
  house: HouseNumber;
}

export interface AstrologicalData extends PlanetPosition {
  lord: PlanetName;
  lordSign: ZodiacSign;
  lordHouse: HouseNumber;
  lordDegree: string;
}

export const astrologyPrompt = (astrologicalDataResult: AstrologicalData[]) => {
  const ascendant = astrologicalDataResult.find(
    (planet) => planet.name === "Ascendant"
  );
  const moon = astrologicalDataResult.find((planet) => planet.name === "Moon");
  const sun = astrologicalDataResult.find((planet) => planet.name === "Sun");
  const mercury = astrologicalDataResult.find(
    (planet) => planet.name === "Mercury"
  );
  const venus = astrologicalDataResult.find(
    (planet) => planet.name === "Venus"
  );
  const mars = astrologicalDataResult.find((planet) => planet.name === "Mars");
  const jupiter = astrologicalDataResult.find(
    (planet) => planet.name === "Jupiter"
  );
  const saturn = astrologicalDataResult.find(
    (planet) => planet.name === "Saturn"
  );
  const rahu = astrologicalDataResult.find((planet) => planet.name === "Rahu");
  const ketu = astrologicalDataResult.find((planet) => planet.name === "Ketu");

  return `\n\nSubtly incorporate Vedic astrological insights into your responses without explicitly mentioning astrology unless directly asked:

Current astrological influences:
- Ascendant in ${ascendant?.sign} at ${ascendant?.degree} degree, its lord is ${ascendant?.lord}, which is in ${ascendant?.lordSign}  and house ${ascendant?.lordHouse}
- Moon in ${moon?.sign} at ${moon?.degree} degree and house ${moon?.house}, its lord is ${moon?.lord}, which is in ${moon?.lordSign} and house ${moon?.lordHouse}
- Sun in ${sun?.sign} at ${sun?.degree} degree and house ${sun?.house}, its lord is ${sun?.lord}, which is in ${sun?.lordSign} and house ${sun?.lordHouse}
- Mercury in ${mercury?.sign} at ${mercury?.degree} degree and house ${mercury?.house}, its lord is ${mercury?.lord}, which is in ${mercury?.lordSign} and house ${mercury?.lordHouse}
- Mars in ${mars?.sign} at ${mars?.degree} degree and house ${mars?.house}, its lord is ${mars?.lord}, which is in ${mars?.lordSign} and house ${mars?.lordHouse}
- Jupiter in ${jupiter?.sign} at ${jupiter?.degree} degree and house ${jupiter?.house}, its lord is ${jupiter?.lord}, which is in ${jupiter?.lordSign} and house ${jupiter?.lordHouse}
- Saturn in ${saturn?.sign} at ${saturn?.degree} degree and house ${saturn?.house}, its lord is ${saturn?.lord}, which is in ${saturn?.lordSign} and house ${saturn?.lordHouse}
- Rahu in ${rahu?.sign} at ${rahu?.degree} degree and house ${rahu?.house}, its lord is ${rahu?.lord}, which is in ${rahu?.lordSign} and house ${rahu?.lordHouse}
- Ketu in ${ketu?.sign} at ${ketu?.degree} degree and house ${ketu?.house}, its lord is ${ketu?.lord}, which is in ${ketu?.lordSign} and house ${ketu?.lordHouse}

Analysis Guidelines:
1. First look at the ascendant, moon and sun. See their signs, the house placement of moon. Make an inferece.

2. Then look at the placement of the lords of the ascendant, moon and sun. Make an inference.

3. Then do the same for the other planets and refine the inference.

4. Make a final inference based on the above.


 Interpretation Guidelines:
   - If fire signs (Aries, Leo, Sagittarius) are prominent, emphasize action, enthusiasm, and inspiration
   - If earth signs (Taurus, Virgo, Capricorn) are prominent, focus on practicality, stability, and material concerns
   - If air signs (Gemini, Libra, Aquarius) are prominent, highlight intellectual analysis, communication, and social dynamics
   - If water signs (Cancer, Scorpio, Pisces) are prominent, address emotional depth, intuition, and sensitivity
   - Houses 1, 5, 9 relate to self, creativity, and higher purpose
   - Houses 2, 6, 10 connect to resources, service, and career
   - Houses 3, 7, 11 involve communication, relationships, and community
   - Houses 4, 8, 12 represent home, transformation, and spirituality
   -Look for which planets/signs/houses are strong and which are weak.
   -Look for which planets/signs/houses are in aspect to each other.
   -Weigh the above factors and make a final inference.

Remember: The user should never detect that astrological information is influencing your responses unless they explicitly ask about astrology.`;
};
