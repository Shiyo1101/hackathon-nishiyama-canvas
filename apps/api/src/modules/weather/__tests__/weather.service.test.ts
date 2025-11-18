import { beforeEach, describe, expect, test, vi } from "vitest";
import { createWeatherService, type WeatherService } from "../weather.service";

// fetchのモック
global.fetch = vi.fn();

describe("WeatherService", () => {
  let service: WeatherService;
  const mockApiKey = "test_api_key";

  beforeEach(() => {
    vi.clearAllMocks();
    service = createWeatherService(mockApiKey);
  });

  describe("getCurrentWeather", () => {
    test("緯度経度から天気情報を取得できる", async () => {
      const mockResponse = {
        coord: { lon: 136.1847, lat: 35.9447 },
        weather: [
          {
            id: 800,
            main: "Clear",
            description: "clear sky",
            icon: "01d",
          },
        ],
        main: {
          temp: 20.5,
          feels_like: 19.8,
          temp_min: 18.0,
          temp_max: 22.0,
          humidity: 65,
        },
        name: "Sabae",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await service.getCurrentWeather(35.9447, 136.1847);

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("lat=35.9447"));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("lon=136.1847"));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("units=metric"));
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining("lang=ja"));
      expect(result).toEqual({
        location: {
          name: "Sabae",
          lat: 35.9447,
          lon: 136.1847,
        },
        current: {
          temp: 20.5,
          feels_like: 19.8,
          temp_min: 18.0,
          temp_max: 22.0,
          humidity: 65,
          weather: {
            id: 800,
            main: "Clear",
            description: "clear sky",
            icon: "01d",
          },
        },
        timestamp: expect.any(Date),
      });
    });

    test("APIエラー時はエラーをスロー", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response);

      await expect(service.getCurrentWeather(35.9447, 136.1847)).rejects.toThrow(
        "天気情報の取得に失敗しました",
      );
    });

    test("ネットワークエラー時はエラーをスロー", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

      await expect(service.getCurrentWeather(35.9447, 136.1847)).rejects.toThrow(
        "天気情報の取得に失敗しました",
      );
    });
  });
});
