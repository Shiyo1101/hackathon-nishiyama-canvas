import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { weatherQuerySchema } from "../../types/weather";
import { createWeatherService } from "./weather.service";

export const createWeatherRoutes = () => {
  const app = new Hono();

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY environment variable is not set");
  }

  const service = createWeatherService(apiKey);

  // GET /weather?lat=35.9447&lon=136.1847 - 天気情報取得
  app.get("/", zValidator("query", weatherQuerySchema), async (c) => {
    try {
      const { lat, lon } = c.req.valid("query");
      const weather = await service.getCurrentWeather(lat, lon);

      return c.json(weather);
    } catch (error) {
      console.error("天気情報取得エラー:", error);
      return c.json({ error: "天気情報の取得に失敗しました" }, 500);
    }
  });

  return app;
};
