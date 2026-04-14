import type { WeatherData } from '@/lib/weather';
import { getWeatherEmoji } from '@/lib/weather';
import { CloudRain, Droplets } from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  county?: string | null;
}

export function WeatherWidget({ weather, county }: WeatherWidgetProps) {
  if (!weather) return null;

  const emoji = getWeatherEmoji(weather.weatherCode);
  const location = county ? `${county}, Ireland` : 'Ireland';

  return (
    <div className="card-elevated relative overflow-hidden">
      <div className="relative flex items-center gap-5 px-6 py-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sage/10">
          <span className="text-3xl leading-none">{emoji}</span>
        </div>

        <div className="flex-1">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-3xl font-light text-ink tracking-tight">
              {weather.temperature}°
            </span>
            <span className="text-[13px] text-clay">
              {weather.weatherLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[11px] text-clay/60 font-medium">
              {location}
            </p>
            <span className="text-stone">·</span>
            <p className="text-[11px] text-clay/60">
              H {weather.daily.tempMax}° / L {weather.daily.tempMin}°
            </p>
            {weather.daily.precipitationProbability > 30 && (
              <>
                <span className="text-stone">·</span>
                <p className="flex items-center gap-1 text-[11px] text-sky font-medium">
                  <Droplets className="h-3 w-3" />
                  {weather.daily.precipitationProbability}%
                </p>
              </>
            )}
          </div>
        </div>

        {weather.isRaining && (
          <div className="flex items-center gap-1.5 rounded bg-sky/10 px-3 py-1.5 text-[11px] font-bold text-sky">
            <CloudRain className="h-3.5 w-3.5" />
            Raining
          </div>
        )}
      </div>
    </div>
  );
}
