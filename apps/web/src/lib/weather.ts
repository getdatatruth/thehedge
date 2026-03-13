export interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherLabel: string;
  isRaining: boolean;
  windSpeed: number;
  humidity: number;
  daily: {
    tempMax: number;
    tempMin: number;
    precipitationProbability: number;
    weatherCode: number;
    weatherLabel: string;
  };
}

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Violent showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);

function getWeatherLabel(code: number): string {
  return WEATHER_CODES[code] || 'Unknown';
}

// Default: Cork, Ireland
const DEFAULT_LAT = 51.8985;
const DEFAULT_LON = -8.4756;

export async function getWeather(
  latitude?: number | null,
  longitude?: number | null
): Promise<WeatherData | null> {
  const lat = latitude ?? DEFAULT_LAT;
  const lon = longitude ?? DEFAULT_LON;

  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', lat.toString());
    url.searchParams.set('longitude', lon.toString());
    url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m');
    url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code');
    url.searchParams.set('timezone', 'Europe/Dublin');
    url.searchParams.set('forecast_days', '1');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url.toString(), { next: { revalidate: 1800 }, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = await res.json();

    const currentCode = data.current.weather_code;
    const dailyCode = data.daily.weather_code[0];

    return {
      temperature: Math.round(data.current.temperature_2m),
      weatherCode: currentCode,
      weatherLabel: getWeatherLabel(currentCode),
      isRaining: RAIN_CODES.has(currentCode),
      windSpeed: Math.round(data.current.wind_speed_10m),
      humidity: data.current.relative_humidity_2m,
      daily: {
        tempMax: Math.round(data.daily.temperature_2m_max[0]),
        tempMin: Math.round(data.daily.temperature_2m_min[0]),
        precipitationProbability: data.daily.precipitation_probability_max[0],
        weatherCode: dailyCode,
        weatherLabel: getWeatherLabel(dailyCode),
      },
    };
  } catch {
    return null;
  }
}

export function getWeatherEmoji(code: number): string {
  if (code <= 1) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (RAIN_CODES.has(code)) return '🌧️';
  if (code >= 71 && code <= 77) return '🌨️';
  if (code >= 85 && code <= 86) return '🌨️';
  return '⛈️';
}

export function getSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}
