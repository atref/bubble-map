import { Rect } from '@grapecity/wijmo';

export function filterCities(allCities:any[], countries:string[]) : any[] {
  let cities:any[] = [];
  allCities.forEach( (city:any) => {
    if(countries.indexOf(city.iso) >= 0) {
      cities.push(city);
    }
  });
  return cities;
}

export function intersects(rect1: Rect, rect2: Rect): boolean {
  if (rect1.left > rect2.right || rect1.right < rect2.left || rect1.top > rect2.bottom || rect1.bottom < rect2.top) {
    return false;
  }

  return true;
}
