import { Rect } from '@grapecity/wijmo';
import { getName } from './localization';


export function getContinents() {
  let data = [
      { name: 'Africa', bbox: new Rect(-17.63,-34.82, 68.76, 72.17) },
      { name: 'Asia', bbox: new Rect(26.04, -10.36, 171.94, 65.75) },
      { name: 'Europe', bbox: new Rect(-29, 36, 90, 35) },
      { name: 'North America', bbox: new Rect(-171.79,7.22, 159.58, 76.43) },
      { name: 'Oceania', bbox: new Rect( 110,-46.64, 70, 44.14)},
      { name: 'South America', bbox: new Rect(-81.41, -55.61, 46.68, 68.05) }
  ];

  data.forEach( (item:any)=> item.label = getName(item.name));

  return data;
}