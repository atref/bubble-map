import { Event, EventArgs, Point, Rect, Size, httpRequest } from '@grapecity/wijmo';
import { IRenderEngine } from '@grapecity/wijmo.chart';
import { FlexMap, GeoJSON, GeoMapLayer, ScatterMapLayer, _GeoJsonRender } from '@grapecity/wijmo.chart.map';
import { LabeledLayer } from './labeled-layer';
import { intersects } from './tools';

export class DetailLayer extends LabeledLayer {
  _cache:any = {};
  _countries:string[] = [];

  get countries():string[] {
    return this._countries;
  } 

  readonly viewChanged = new Event<DetailLayer, EventArgs>();
  
  onViewChanged(e?: EventArgs) {
    this.viewChanged.raise(this, e);
  }
  
  render(e: IRenderEngine, t: SVGTransform, group: SVGGElement): any {
    super.render(e, t, group);

    if(this.map.zoom < 5) {
      if(this.itemsSource!==undefined){
        this._countries = [];
        this.itemsSource = undefined;
        this.onViewChanged();
      }
      return;
    }

    let layer:LabeledLayer = this.map.layers[0];
    let features = layer.getAllFeatures();

    let r = this.map._mapRect;
    let p1 = this.map.convertBack(new Point(r.left, r.top));
    let p2 = this.map.convertBack(new Point(r.right, r.bottom));
    r = new Rect( Math.min(p1.x, p2.x), Math.min(p1.y, p2.y), Math.abs(p2.x - p1.x),  Math.abs(p2.y - p1.y));

    let countries:string[] = [];
    features?.forEach((f:any ) => {
      const rect = layer._getGeoBBoxCached(f);
      if(intersects(rect,r)) {
        if(f.properties.iso) {
          countries.push(f.properties.iso);
        }
      }
    });

    countries.forEach( (country)=> {
      if(!this._cache[country]) {
        const url = this.nameToUrl(country);

        if(url.length === 0) {
          return;
        }

        httpRequest(url, {
          success: xhr => {
            this._cache[country] = JSON.parse(xhr.responseText);
            this._update();
          },
          error: () => {
            this._cache[country] = [];
            this._update();
          }
        });
      }
    });
    
    if(this._countries.join() !== countries.join()) {
      this._countries = countries;
      this.onViewChanged();
      this._update();
    }
  }
  
  _update() {
    if(this._countries.length === 0) {
      if(this.itemsSource!==undefined){
        this.itemsSource = undefined;
        this.onViewChanged();
      }
      return;
    }

    let canUpdate = true;
    this._countries.forEach( country=>{
      if(!this._cache[country]) {
        canUpdate = false;
      }
    });

    if(canUpdate) {
      let items:any = [];
      this._countries.forEach( country=>{
        if(this._cache[country].features) {
          items.push( ...this._cache[country].features)
        }
      });
  
      this.itemsSource = { type:'FeatureCollection', features: items};
    }
  }

  nameToUrl(name:string) :string {
    if(name === '-99') { // missing data
      return '';
    }
    return `countries/${name}.json`;
  }
}