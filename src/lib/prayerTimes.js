import { getSetting, setSetting } from './db';

/**
 * Fetch prayer times from Aladhan API for a given date and location.
 * Returns { fajr: "HH:MM", maghrib: "HH:MM" } in 24h format.
 */
async function fetchPrayerTimes(lat, lng, date) {
  const dateStr = date instanceof Date
    ? `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
    : date;

  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`
  );
  if (!res.ok) throw new Error('Failed to fetch prayer times');

  const json = await res.json();
  const timings = json.data.timings;

  return {
    fajr: timings.Fajr.replace(/\s*\(.*\)/, ''),
    maghrib: timings.Maghrib.replace(/\s*\(.*\)/, ''),
  };
}

/**
 * Get the user's saved location, or null if not set.
 */
export async function getLocation() {
  return await getSetting('location');
}

/**
 * Request the user's location via browser Geolocation API,
 * reverse-geocode to get a city name, and save to IndexedDB.
 */
export async function setupLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try to get city name via reverse geocode
        let cityName = '';
        try {
          const geoRes = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
          );
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            cityName = geoJson.data?.meta?.timezone || '';
            // Extract city from timezone (e.g. "Europe/London" → "London")
            cityName = cityName.split('/').pop().replace(/_/g, ' ');
          }
        } catch {
          // City name is optional, continue without it
        }

        const location = { lat: latitude, lng: longitude, city: cityName };
        await setSetting('location', location);
        resolve(location);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please allow location access in your browser settings.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location unavailable. Please try again.'));
            break;
          default:
            reject(new Error('Could not get your location. Please try again.'));
        }
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  });
}

/**
 * Remove saved location.
 */
export async function clearLocation() {
  await setSetting('location', null);
}

/**
 * Get Fajr and Maghrib times for a specific Ramadan day.
 * Uses a base date (1 Ramadan) + day offset.
 * Returns { fajr: "HH:MM", maghrib: "HH:MM" } or null if location not set.
 */
export async function getPrayerTimesForDay(day) {
  const location = await getLocation();
  if (!location?.lat) return null;

  // Ramadan 2026 starts approximately 17 Feb 2026
  // Users can adjust — but this gives a reasonable default
  const ramadanStart = await getSetting('ramadanStartDate');
  const baseDate = ramadanStart ? new Date(ramadanStart) : new Date(2026, 1, 17); // Feb 17, 2026

  const date = new Date(baseDate);
  date.setDate(date.getDate() + (day - 1));

  try {
    return await fetchPrayerTimes(location.lat, location.lng, date);
  } catch {
    return null;
  }
}
