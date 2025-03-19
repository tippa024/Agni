export const getLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  if (navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 0,
          })
      );
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      console.log("User location:", coordinates);
      return coordinates;
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  } else {
    console.log("Geolocation API not available in this browser");
    return null;
  }
};
