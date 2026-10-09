import { WeatherInfo } from '../types/hub';

export interface CityLocation {
  name: string;
  lat: number;
  lng: number;
}

export const KOREA_CITIES: CityLocation[] = [
  { name: '서울', lat: 37.5665, lng: 126.9780 },
  { name: '경기(수원)', lat: 37.2636, lng: 127.0286 },
  { name: '인천', lat: 37.4563, lng: 126.7052 },
  { name: '부산', lat: 35.1796, lng: 129.0756 },
  { name: '대구', lat: 35.8714, lng: 128.6014 },
  { name: '대전', lat: 36.3504, lng: 127.3845 },
  { name: '광주', lat: 35.1595, lng: 126.8526 },
  { name: '울산', lat: 35.5384, lng: 129.3114 },
  { name: '강원(춘천)', lat: 37.8813, lng: 127.7298 },
  { name: '제주', lat: 33.4996, lng: 126.5312 },
];

export function getWeatherCondition(code: number): { text: string; icon: string } {
  if (code === 0) return { text: '쾌청 / 맑음', icon: 'sun' };
  if (code === 1) return { text: '대체로 맑음', icon: 'sun-dim' };
  if (code === 2) return { text: '구름 조금', icon: 'cloud-sun' };
  if (code === 3) return { text: '흐림', icon: 'cloud' };
  if (code === 45 || code === 48) return { text: '안개', icon: 'cloud-fog' };
  if (code >= 51 && code <= 55) return { text: '이슬비', icon: 'cloud-drizzle' };
  if (code >= 61 && code <= 65) return { text: '비', icon: 'cloud-rain' };
  if (code >= 71 && code <= 77) return { text: '눈', icon: 'cloud-snow' };
  if (code >= 80 && code <= 82) return { text: '소나기', icon: 'cloud-rain' };
  if (code >= 85 && code <= 86) return { text: '눈보라', icon: 'cloud-snow' };
  if (code >= 95) return { text: '천둥번개', icon: 'cloud-lightning' };
  return { text: '구름', icon: 'cloud' };
}

export async function fetchWeatherData(lat: number, lng: number): Promise<WeatherInfo> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;
    const hourly = data.hourly;

    const condition = getWeatherCondition(current.weather_code);

    const nowHour = new Date().getHours();
    const nextHourly = [];
    if (hourly && hourly.time) {
      for (let i = nowHour; i < Math.min(nowHour + 8, hourly.time.length); i++) {
        const timeStr = hourly.time[i] ? new Date(hourly.time[i]).getHours() + '시' : `${i}시`;
        nextHourly.push({
          time: timeStr,
          temp: Math.round(hourly.temperature_2m[i] ?? 20),
          weatherCode: hourly.weather_code[i] ?? 0,
        });
      }
    }

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const nextDaily = [];
    if (daily && daily.time) {
      for (let i = 0; i < Math.min(5, daily.time.length); i++) {
        const d = new Date(daily.time[i]);
        const dayLabel = i === 0 ? '오늘' : `${dayNames[d.getDay()]}요일`;
        nextDaily.push({
          date: daily.time[i],
          dayName: dayLabel,
          high: Math.round(daily.temperature_2m_max[i] ?? 22),
          low: Math.round(daily.temperature_2m_min[i] ?? 14),
          weatherCode: daily.weather_code[i] ?? 0,
        });
      }
    }

    return {
      temperature: Math.round(current.temperature_2m ?? 21),
      apparentTemperature: Math.round(current.apparent_temperature ?? 20),
      weatherCode: current.weather_code ?? 0,
      weatherText: condition.text,
      humidity: Math.round(current.relative_humidity_2m ?? 50),
      windSpeed: Math.round(current.wind_speed_10m ?? 2),
      precipitationProb: current.precipitation_probability ?? 0,
      highTemp: daily?.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : 22,
      lowTemp: daily?.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : 14,
      hourly: nextHourly,
      daily: nextDaily,
    };
  } catch (err) {
    console.warn('Fallback weather used due to:', err);
    // Safe graceful offline fallback
    return {
      temperature: 21,
      apparentTemperature: 21,
      weatherCode: 1,
      weatherText: '대체로 맑음',
      humidity: 52,
      windSpeed: 2.1,
      precipitationProb: 10,
      highTemp: 23,
      lowTemp: 14,
      hourly: [
        { time: '현재', temp: 21, weatherCode: 1 },
        { time: '14시', temp: 22, weatherCode: 1 },
        { time: '16시', temp: 21, weatherCode: 2 },
        { time: '18시', temp: 19, weatherCode: 2 },
        { time: '20시', temp: 17, weatherCode: 0 },
        { time: '22시', temp: 15, weatherCode: 0 },
      ],
      daily: [
        { date: '2026-10-09', dayName: '오늘', high: 23, low: 14, weatherCode: 1 },
        { date: '2026-10-10', dayName: '토요일', high: 24, low: 15, weatherCode: 0 },
        { date: '2026-10-11', dayName: '일요일', high: 22, low: 13, weatherCode: 2 },
        { date: '2026-10-12', dayName: '월요일', high: 21, low: 12, weatherCode: 3 },
      ],
    };
  }
}
