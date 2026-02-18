import { getSetting, setSetting } from './db';

/**
 * Map a timezone string to an Aladhan calculation method ID.
 * Called once when location is first saved to set a sensible default.
 */
function getDefaultMethodForTimezone(timezone) {
  if (!timezone) return '3'; // MWL fallback
  const tz = timezone.toLowerCase();
  if (tz.startsWith('america/')) return '2';           // ISNA — North America
  if (tz.startsWith('europe/')) return '3';             // MWL — Europe
  if (tz.includes('africa/cairo') || tz.includes('egypt')) return '5'; // Egyptian
  if (['asia/dubai', 'asia/muscat'].some(t => tz.includes(t))) return '16'; // Dubai/Gulf
  if (['asia/qatar', 'asia/bahrain'].some(t => tz.includes(t))) return '10'; // Qatar
  if (tz.includes('kuwait')) return '9';
  if (tz.includes('riyadh') || tz.includes('aden')) return '4'; // Umm Al-Qura
  if (tz.includes('karachi') || tz.includes('kolkata') || tz.includes('dhaka')) return '1'; // Karachi
  if (tz.includes('jakarta') || tz.includes('makassar') || tz.includes('jayapura')) return '20'; // Indonesia
  if (tz.includes('kuala') || tz.includes('singapore')) return '11'; // Singapore
  if (tz.includes('istanbul') || tz.includes('ankara')) return '13'; // Diyanet
  if (tz.includes('tehran')) return '7'; // Tehran
  if (tz.includes('casablanca')) return '21'; // Morocco
  if (tz.includes('algiers')) return '19'; // Algeria
  if (tz.includes('tunis')) return '18'; // Tunisia
  return '3'; // MWL as global fallback
}

/**
 * Fetch prayer times from Aladhan API for a given date and location.
 * Returns { fajr: "HH:MM", maghrib: "HH:MM" } in 24h format.
 */
async function fetchPrayerTimes(lat, lng, date, method = '3') {
  const dateStr = date instanceof Date
    ? `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
    : date;

  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`
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
 * Also sets a smart default calculation method based on timezone
 * (only if no method has been explicitly chosen yet).
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

        // Try to get city name + timezone via reverse geocode
        let cityName = '';
        let timezone = '';
        try {
          const geoRes = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=3`
          );
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            timezone = geoJson.data?.meta?.timezone || '';
            cityName = timezone.split('/').pop().replace(/_/g, ' ');
          }
        } catch {
          // City name is optional, continue without it
        }

        const location = { lat: latitude, lng: longitude, city: cityName };
        await setSetting('location', location);

        // Auto-set default method only if user hasn't explicitly chosen one yet
        const existingMethod = await getSetting('prayerMethod');
        if (!existingMethod) {
          const defaultMethod = getDefaultMethodForTimezone(timezone);
          await setSetting('prayerMethod', defaultMethod);
        }

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
 *
 * Reads prayerMethod from IndexedDB. If method is 'custom', returns
 * the manually entered customFajr / customMaghrib times directly.
 */
export async function getPrayerTimesForDay(day) {
  const location = await getLocation();
  if (!location?.lat) return null;

  const method = (await getSetting('prayerMethod')) || '3';

  // Custom times — return immediately without hitting the API
  if (method === 'custom') {
    const fajr = (await getSetting('customFajr')) || '';
    const maghrib = (await getSetting('customMaghrib')) || '';
    if (fajr || maghrib) {
      return { fajr, maghrib };
    }
    return null;
  }

  // Ramadan 2026 starts approximately 17 Feb 2026
  const ramadanStart = await getSetting('ramadanStartDate');
  const baseDate = ramadanStart ? new Date(ramadanStart) : new Date(2026, 1, 17); // Feb 17, 2026

  const date = new Date(baseDate);
  date.setDate(date.getDate() + (day - 1));

  try {
    return await fetchPrayerTimes(location.lat, location.lng, date, method);
  } catch {
    return null;
  }
}
