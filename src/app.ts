import '@grapecity/wijmo.styles/wijmo.css';
import './styles.css';

import { Rect, format } from '@grapecity/wijmo';
import { ComboBox } from '@grapecity/wijmo.input';
import { Palettes } from '@grapecity/wijmo.chart';
import { FlexMap, GeoMapLayer, ScatterMapLayer, ColorScale } from '@grapecity/wijmo.chart.map';
import { LabeledLayer } from './labeled-layer';
import { DetailLayer } from './detail-layer';
import { filterCities, mouseWheel, getCitiesData, getCountries, getPopulationData } from './tools';
import { getContinents } from './continents';
import { getCountryName, getLanguages, setLanguage, getName } from './localization';

document.readyState === 'complete' ? init() : window.onload = init;

let map: FlexMap;
let comboContinents: ComboBox;
let comboCountries: ComboBox;
let comboLanguages: ComboBox;
let homeRect: Rect;

let countryLayer: LabeledLayer;

function init() {
  let cities: any[] = [];
  let populationData: any[] = [];

  // load cities data from GeoJSON
  new GeoMapLayer({
    url: 'data/cities.json',
    itemsSourceChanged: (layer: any, a: any) => cities = getCitiesData(layer)
  });

  countryLayer = new LabeledLayer({
    url: 'data/countries.json',
    style: { fill: 'rgba(153,216,201,0.4)', stroke: 'white', strokeWidth: 1.5 },
    labelClass: '.country-label',
    itemsSourceChanged: (layer: LabeledLayer, a: any) => {
      if (!homeRect) {
        homeRect = layer.getGeoBBox();
        map.zoomTo(homeRect);
      }

      // load population data
      scatterLayer.itemsSource = populationData = getPopulationData(layer);

      createCombos(getCountries(layer));
    },
  });
  countryLayer.labelClass = 'country-label';
  countryLayer.formatLabel = (f:any)=> getCountryName(f.properties.iso, f.properties.name);
  countryLayer.zoomLimit = 5;
 
  const detailLayer = new DetailLayer({
    style: { fill: 'rgba(153,216,201,0.7)', stroke: 'white' }
  });
  const scatterLayer = new ScatterMapLayer({
    binding: 'x,y,population',
    symbolMaxSize: 25,
    symbolMinSize: 5,
    style: { fill: 'rgba(44,162,95,1)', strokeWidth: 0 },
    colorScale: new ColorScale({
      colors: Palettes.Diverging.RdYlBu,
      binding: 'population',
      scale: (v: number) => 1 - v
    })
  });

  map = new FlexMap('#map', {
    tooltip: { content: (ht: any) => tooltip(ht) },
    layers: [countryLayer, detailLayer, scatterLayer]
  });

  // update scatter depending on visible countries
  detailLayer.viewChanged.addHandler(() => {
    scatterLayer.itemsSource = detailLayer.countries?.length > 0 ?
      filterCities(cities, detailLayer.countries) : populationData;
  });

  const btnHome = document.getElementById('home');
  btnHome?.addEventListener('click', () => {
    if (homeRect) {
      map.zoom = 1;
      map.zoomTo(homeRect);
    }
    detailLayer.itemsSource = null;
    scatterLayer.itemsSource = populationData;
    comboContinents.selectedItem = null;
  });

  // override default mouse wheel handler
  map.hostElement.addEventListener('wheel', (e) => mouseWheel(map, e), true);
}

function createCombos(countries: any[]) {
  comboContinents = new ComboBox('#continents', {
    displayMemberPath: 'label',
    itemsSource: getContinents(),
    isRequired: false,
    placeholder: 'Continent',
    selectedItem: null
  });

  comboContinents.collectionView.currentChanged.addHandler(() => {
    let rect = homeRect;
    if (comboContinents.collectionView.currentItem?.bbox) {
      map.zoom = 1;
      rect = comboContinents.collectionView.currentItem.bbox;
    }

    comboCountries.selectedItem = null;
    comboCountries.collectionView.refresh();

    if (rect) {
      map.zoom = 1;
      map.zoomTo(rect);
    }
  });

  comboCountries = new ComboBox('#countries', {
    displayMemberPath: 'name',
    isRequired: false,
    placeholder: 'Country',
    itemsSource: countries,
    selectedItem: null
  });

  comboCountries.collectionView.currentChanged.addHandler(() => {
    let rect = homeRect;
    if (comboCountries.collectionView.currentItem?.bbox) {
      map.zoom = 1;
      rect = comboCountries.collectionView.currentItem.bbox;
    }

    if (rect) {
      map.zoom = 1;
      map.zoomTo(rect);
    }
  });

  comboCountries.collectionView.filter = (country) => {
    if (comboContinents.collectionView.currentItem) {
      return country.continent === comboContinents.collectionView.currentItem.name;
    } else {
      return true;
    }
  };

  comboLanguages = new ComboBox('#languages', {
    itemsSource: getLanguages(),
    selectedItem: 'EN'    
  });
  comboLanguages.selectedIndexChanged.addHandler(() => {
    setLanguage(comboLanguages.selectedItem, () => {
      map.invalidate(true);

      comboContinents.collectionView.sourceCollection = getContinents();
      comboContinents.collectionView.currentItem = null;

      comboCountries.collectionView.sourceCollection = getCountries(countryLayer);
      comboCountries.collectionView.currentItem = null;

      comboContinents.placeholder = getName('Continent');
      comboCountries.placeholder = getName('Country');
    })
  });
}

function tooltip(ht: any): string {
  const code: string = ht.iso;
  const name = ht.continent ? getCountryName(code, ht.name) : ht.name;

  let tt = code ?
    `<img class="tooltip" src="flags/${code.toLowerCase()}.png"/><b>${name}</b>`
    : `<b>{name}</b>`;

  if (ht?.population) {
    tt += format('<br>{label}: {population:n*}', { label:getName('Population'), population: ht.population });
  }

  return tt;
}
