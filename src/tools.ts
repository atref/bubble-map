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

  let mapRect = map._mapRect;

  // mouse position
  let point = map.pageToControl(e.pageX, e.pageY);
  let geoPoint = map.convertBack( point);

  // map rectangle in geo coordinates
  let g1 = map.convertBack( new Point(mapRect.left, mapRect.top));
  let g2 = map.convertBack( new Point(mapRect.right, mapRect.bottom));
  let rect = new Rect(g1.x, g2.y, g2.x - g1.x, g1.y - g2.y);

  // relative offset
  let dx = (geoPoint.x - rect.left) / rect.width;
  let dy = (geoPoint.y - rect.top) / rect.height;

  let w = rect.width;
  let h = rect.height;

  // fixed zoom level 
  let delta = -e.deltaY;
  delta = delta > 0 ? 0.1 : -0.1;

  // update rectangle
  rect.width *= (1 - delta);
  rect.height *= (1 - delta);
  rect.left -= dx * (rect.width - w);
  rect.top -= dy * (rect.height - h);

  map.zoom = 1;
  map.zoomTo(rect);
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