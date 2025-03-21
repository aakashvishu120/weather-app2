import React, { useState, useEffect } from "react";
// Shadcn UI components (adjust import paths as needed)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Import Sonner for toast notifications
import { toast, Toaster } from "sonner";

const API_KEY = "d99ea294ca4bd6597a816aa8cc5c7198";

function App() {
  const [city, setCity] = useState("New York");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to fetch weather and forecast data
  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      // Fetch current weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const weatherData = await weatherRes.json();
      if (weatherData.cod !== 200) {
        throw new Error(weatherData.message || "Error fetching weather data");
      }
      setWeather(weatherData);

      // Fetch 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      if (forecastData.cod !== "200") {
        throw new Error(forecastData.message || "Error fetching forecast");
      }
      // Every 8th item represents a daily forecast (3hr * 8 = 24hrs)
      const dailyForecast = forecastData.list.filter(
        (_item, index) => index % 8 === 0
      );
      setForecast(dailyForecast);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(
        error.message || "Could not fetch weather data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for the default city on mount
  useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  // Handle form submission to search for a new city
  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim() === "") {
      toast.error("Please enter a city name.");
      return;
    }
    setCity(search);
    fetchWeather(search);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Weather App</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex mb-4">
            <Input
              type="text"
              placeholder="Enter city name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>

          {loading && <p className="text-center">Loading...</p>}

          {/* Current Weather */}
          {weather && !loading && (
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{weather.name}</h2>
              <p className="text-2xl">{Math.round(weather.main.temp)}°C</p>
              <p className="capitalize">{weather.weather[0].description}</p>
              <p>Humidity: {weather.main.humidity}%</p>
            </div>
          )}

          {/* 5-Day Forecast */}
          {forecast.length > 0 && !loading && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-center">
                5-Day Forecast
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {forecast.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <p className="font-medium">
                      {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <img
                      src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt={day.weather[0].description}
                      className="w-12 h-12"
                    />
                    <p className="text-sm">
                      {Math.round(day.main.temp)}°C
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Sonner Toast container for notifications */}
      <Toaster />
    </div>
  );
}

export default App;
