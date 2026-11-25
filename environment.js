export const WEATHER = ['clear', 'rain', 'snow'];
export function normalizeHour(hour) { return ((Number(hour) % 24) + 24) % 24; }
export function timeLabel(hour) { const minutes = Math.round(normalizeHour(hour) * 60) % 1440; return `${String(Math.floor(minutes / 60)).padStart(2,'0')}:${String(minutes % 60).padStart(2,'0')}`; }
export function setGardenState(state, change) {
  return {hour: change.hour === undefined ? state.hour : normalizeHour(change.hour), weather: WEATHER.includes(change.weather) ? change.weather : state.weather};
}
export function timeName(hour) { return hour < 5 || hour >= 20 ? ['夜晚','AFTER DARK'] : hour < 10 ? ['清晨','MORNING LIGHT'] : hour < 16 ? ['日间','DAYDREAM'] : ['蓝调日落','BLUE HOUR']; }
export const lightStops = [
  {hour:0,top:'#111c34',bottom:'#243754',sky:'#96b5f0',sun:'#b6c9ff',power:1.0,ambient:1.15,night:1},
  {hour:5,top:'#283c59',bottom:'#697896',sky:'#b3c9ee',sun:'#c0cdea',power:1.2,ambient:1.4,night:.6},
  {hour:7,top:'#718ca8',bottom:'#b5c6d4',sky:'#c9e5ff',sun:'#fff2d6',power:2.6,ambient:1.8,night:0},
  {hour:12,top:'#7898b9',bottom:'#bfd1dd',sky:'#d4eaff',sun:'#fff8e9',power:3.0,ambient:1.9,night:0},
  {hour:16,top:'#546e93',bottom:'#9ba6bc',sky:'#bfd4ff',sun:'#f5dbc9',power:2.3,ambient:1.6,night:.1},
  {hour:18,top:'#20243f',bottom:'#4d567e',sky:'#aabcf1',sun:'#f5cebd',power:2.3,ambient:1.28,night:.75},
  {hour:20,top:'#13213c',bottom:'#334564',sky:'#9fbaee',sun:'#b4c8f6',power:1.05,ambient:1.2,night:1},
  {hour:24,top:'#111c34',bottom:'#243754',sky:'#96b5f0',sun:'#b6c9ff',power:1.0,ambient:1.15,night:1}
];
export function lightInterval(hour) { const h=normalizeHour(hour);const i=lightStops.findIndex((s,j)=>j<lightStops.length-1 && h>=s.hour && h<lightStops[j+1].hour);return {a:lightStops[i],b:lightStops[i+1],t:(h-lightStops[i].hour)/(lightStops[i+1].hour-lightStops[i].hour)}; }

