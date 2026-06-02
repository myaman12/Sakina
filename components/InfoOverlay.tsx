import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Snowflake, CloudLightning, MapPin } from 'lucide-react';

interface InfoOverlayProps {
  visible: boolean;
}

interface WeatherData {
  temp: number;
  code: number;
}

export const InfoOverlay: React.FC<InfoOverlayProps> = ({ visible }) => {
  const [time, setTime] = useState(new Date());
  const [locationName, setLocationName] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Update Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Location & Weather
  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 1. Fetch Location Name
          const locRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const locData = await locRes.json();
          const city = locData.city || locData.locality || locData.principalSubdivision;
          setLocationName(city);

          // 2. Fetch Weather
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const weatherData = await weatherRes.json();
          
          if (weatherData.current_weather) {
            setWeather({
              temp: weatherData.current_weather.temperature,
              code: weatherData.current_weather.weathercode,
            });
          }
        } catch (error) {
          console.error("Failed to fetch info data", error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.warn("Geolocation denied or failed", error);
        setLoading(false);
      }
    );
  }, []);

  // Helper to get Weather Icon with responsive classes
  const getWeatherIcon = (code: number) => {
    const className = "w-3 h-3 md:w-4 md:h-4 2xl:w-6 2xl:h-6 opacity-90 drop-shadow-sm";
    if (code <= 1) return <Sun className={className} />;
    if (code <= 3) return <Cloud className={className} />;
    if (code <= 67) return <CloudRain className={className} />;
    if (code <= 77) return <Snowflake className={className} />;
    if (code <= 99) return <CloudLightning className={className} />;
    return <Cloud className={className} />;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <div 
      className={`absolute top-6 left-6 md:top-8 md:left-8 2xl:top-16 2xl:left-16 z-30 transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'} pointer-events-none`}
    >
      <div className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex flex-col gap-1">
        
        {/* Primary: TIME */}
        <div className="text-5xl md:text-6xl lg:text-7xl 2xl:text-9xl font-light tracking-tighter leading-none opacity-95 font-sans">
            {formatTime(time)}
        </div>

        {/* Secondary: Date & Weather */}
        <div className="flex items-center gap-4 text-white/90 text-xs md:text-sm 2xl:text-xl font-medium tracking-wide mt-1 pl-1">
            <span className="uppercase tracking-widest">{formatDate(time)}</span>
            
            {weather && (
                <>
                    <span className="w-px h-3 bg-white/50"></span>
                    <div className="flex items-center gap-2">
                        {getWeatherIcon(weather.code)}
                        <span>{Math.round(weather.temp)}°</span>
                    </div>
                </>
            )}
        </div>

        {/* Tertiary: User Location */}
        {locationName && (
            <div className="flex items-center gap-1.5 text-white/70 text-[10px] md:text-[11px] 2xl:text-base font-medium uppercase tracking-[0.2em] mt-1 pl-1">
              <MapPin className="w-3 h-3 drop-shadow-sm" />
              <span>{locationName}</span>
            </div>
        )}

      </div>
    </div>
  );
};