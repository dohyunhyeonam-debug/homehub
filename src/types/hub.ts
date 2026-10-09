export interface WeatherInfo {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  weatherText: string;
  humidity: number;
  windSpeed: number;
  precipitationProb: number;
  highTemp: number;
  lowTemp: number;
  hourly: Array<{
    time: string;
    temp: number;
    weatherCode: number;
  }>;
  daily: Array<{
    date: string;
    dayName: string;
    high: number;
    low: number;
    weatherCode: number;
  }>;
}

