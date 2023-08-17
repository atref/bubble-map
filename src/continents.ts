import { Rect } from '@grapecity/wijmo';

export function getContinents() {
  return [
      // -17.63,-34.82,51.13,37.35
      { name: 'Africa', bbox: new Rect(-17.63,-34.82, 51.13 + 17.63, 37.35 + 34.82) },
      // 26.04,-10.36,145.54,55.39
      { name: 'Asia', bbox: new Rect(26.04, -10.36, 26.4 + 145.54, 10.36 + 55.39) },
      { name: 'Europe', bbox: new Rect(-29, 36, 90, 35) },
      // -171.79,7.22,-12.21,83.65
      { name: 'North America', bbox: new Rect(-171.79,7.22, 171.79 -12.21,83.65 - 7.22) },
      // -180,-46.64,180,-2.5
      { name: 'Oceania', bbox: new Rect( 110,-46.64, 70, 46.64 -2.5 )},
      // -81.41,-55.61,-34.73,12.44
      { name: 'South America', bbox: new Rect(-81.41,-55.61,81.41-34.73, 12.44 + 55.61) }
  ];
}