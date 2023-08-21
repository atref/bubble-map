import { Point, Rect } from '@grapecity/wijmo';
import { GeoMapLayer, FlexMap } from '@grapecity/wijmo.chart.map';

import { LabeledLayer } from './labeled-layer'
import { getCountryName } from './localization';

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

export function mouseWheel(map:FlexMap, e:WheelEvent ) {
  e.stopImmediatePropagation();
    
  e.preventDefault();
  map._hideToolTip();

  // mouse position
  let point = map.pageToControl(e.pageX, e.pageY);
  let geoPoint = map.convertBack( point);

  let delta = -e.deltaY;
  delta = delta > 0 ? 0.1 : -0.1;
  map.zoom += delta;
  map.refresh();
  let geoPoint2 = map.convertBack( point);

  map.center = new Point(map.center.x - geoPoint2.x + geoPoint.x, map.center.y - geoPoint2.y + geoPoint.y);
  map.refresh();
}

export function getCitiesData(layer: GeoMapLayer): any[] {
  let data: any[] = [];
  let features: any[] = layer.getAllFeatures();
  features.forEach(f => data.push(
    {
      name: f.properties.name,
      iso: f.properties.iso,
      population: f.properties.pop,
      x: f.geometry.coordinates[0],
      y: f.geometry.coordinates[1]
    }));
  return data;
}

export function getPopulationData(layer: GeoMapLayer): any {
  let data: any[] = [];
  let features = layer.getAllFeatures();

  features.forEach((f: { properties: { name: any; pop_est: number, label_x: number, label_y: number, continent:string, iso: string }; }) => {
    if (f.properties.iso === '-99') {
      console.log(f.properties.name);
    }

    data.push({
      x: f.properties.label_x,
      y: f.properties.label_y,
      continent: f.properties.continent,
      name: f.properties.name,
      population: f.properties.pop_est,
      iso: f.properties.iso
    });
  });

  return data;
}

export function getCountries(layer: LabeledLayer): any {
  let data: any[] = [];
  let features = layer.getAllFeatures();

  features.forEach((f: { properties: { name: any; iso: string, continent: string }; }) => {
    if (f.properties.iso === '-99') {
      console.log(f.properties.name);
    }

    if (f.properties.name) {
      data.push({
        name: getCountryName(f.properties.iso, f.properties.name),
        iso: f.properties.iso,
        continent: f.properties.continent,
        bbox: layer._getGeoBBoxCached(f)
      });
    }
  });

  return data.sort((c1: any, c2: any) => c1.name.localeCompare(c2.name));
}