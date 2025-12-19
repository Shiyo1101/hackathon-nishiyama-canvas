import { z } from "zod";

/**
 * 天気情報取得のクエリパラメータ
 */
export const weatherQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export type WeatherQuery = z.infer<typeof weatherQuerySchema>;

/**
 * 天気情報レスポンス型
 */
export const weatherResponseSchema = z.object({
  location: z.object({
    name: z.string(),
    lat: z.number(),
    lon: z.number(),
  }),
  current: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    humidity: z.number(),
    weather: z.object({
      id: z.number(),
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    }),
  }),
  timestamp: z.date(),
});

export type WeatherResponse = z.infer<typeof weatherResponseSchema>;

/**
 * 天気アイコンコード型
 */
export type WeatherIcon =
  | "01d"
  | "01n"
  | "02d"
  | "02n"
  | "03d"
  | "03n"
  | "04d"
  | "04n"
  | "09d"
  | "09n"
  | "10d"
  | "10n"
  | "11d"
  | "11n"
  | "13d"
  | "13n"
  | "50d"
  | "50n";

/**
 * キャンバス内での天気情報設定型
 */
export const weatherConfigSchema = z.object({
  enabled: z.boolean(),
  location: z.object({
    type: z.enum(["manual", "auto"]),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    cityName: z.string().optional(),
  }),
});

export type WeatherConfig = z.infer<typeof weatherConfigSchema>;
