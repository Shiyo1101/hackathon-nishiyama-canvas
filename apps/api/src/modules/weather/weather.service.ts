import type { WeatherResponse } from "../../types/weather";

const OPENWEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

export type WeatherService = {
  getCurrentWeather: (lat: number, lon: number) => Promise<WeatherResponse>;
};

export const createWeatherService = (apiKey: string): WeatherService => ({
  getCurrentWeather: async (lat: number, lon: number): Promise<WeatherResponse> => {
    try {
      const url = `${OPENWEATHER_API_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeather API returned ${response.status}: ${response.statusText}`);
      }

      // biome-ignore lint/suspicious/noExplicitAny: External API response
      const data: any = await response.json();

      return {
        location: {
          name: data.name,
          lat,
          lon,
        },
        current: {
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          temp_min: data.main.temp_min,
          temp_max: data.main.temp_max,
          humidity: data.main.humidity,
          weather: {
            id: data.weather[0].id,
            main: data.weather[0].main,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
          },
        },
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Weather API error:", error);
      throw new Error("天気情報の取得に失敗しました");
    }
  },
});
