
import { Point, Rect, Size } from '@grapecity/wijmo';
import { IRenderEngine } from '@grapecity/wijmo.chart';
import { GeoMapLayer } from '@grapecity/wijmo.chart.map';

export class LabeledLayer extends GeoMapLayer {
  private cacheSize:any = {};
  private _labelClass = 'wj-label';
  private _cacheRects:any = {};
  protected _zoomLimit = 16;
  protected _formatLabel:Function | undefined = undefined;

  constructor( options?:any)  {
    super(options);
  }

  set labelClass(value:string) {
    this._labelClass = value;
  }

  get labelClass():string {
    return this._labelClass;
  }

  set formatLabel(value:Function|undefined) {
    this._formatLabel = value;
  }

  get formatLabel():Function | undefined {
    return this._formatLabel;
  }

  set zoomLimit(value:number) {
    this._zoomLimit = value;
  }

  get zoomLimit():number {
    return this._zoomLimit;
  }


  render(e: IRenderEngine, t: SVGTransform, group: SVGGElement): any {
    if(this.map.zoom < this.zoomLimit) {
      super.render(e, t, group);
    }

    const features = this.getAllFeatures();
    
    for(let i=0; i<features.length; i++) {
      this.drawLabel(e, features[i])
    }
  }

  drawLabel(e:IRenderEngine, f:any) {
    let rect = this._getGeoBBoxCached(f);

    if(!rect) {
      return;
    }

    let name = this.formatLabel ? this.formatLabel(f) : f.properties.name;
    let x = f.properties.label_x;
    let y = f.properties.label_y;

    if(!(x&&y)) {
      console.log(f.properties);
    }
    let pt = x && y ? new Point(x,y) : new Point(rect.left + 0.5 * rect.width, rect.top + 0.5 * rect.height);

    let p1 = this.map.convert(new Point(rect.left, rect.top));
    let p2 = this.map.convert(new Point(rect.right, rect.bottom));
    pt = this.map.convert(pt);

    if(this.map.layers.indexOf(this) === 0) {
      pt.y -= 15;
    }

    // show label only when the width is large enough
    if(p2.x - p1.x >= 100) {
      const sz = this.measureString(e, name);
      e.drawString(name, new Point(pt.x - 0.5*sz.width, pt.y + 0.5*sz.height), this.labelClass);
    }
  }

  measureString(e:IRenderEngine, s:string) : Size {
    let sz:Size = this.cacheSize[s];
    if(!sz) {
      sz = this.cacheSize[s] = e.measureString(s, this.labelClass);
    }
    return sz;
  }

  _getGeoBBoxCached(f:any): Rect {
    let rect:Rect = this._cacheRects[f.properties.name];
    if(!rect) 
    {
      rect = super.getGeoBBox(f);

      // manually correct some countries for optimization
      if(f.properties.name === 'Russia') {
        rect.left = 20; rect.width = 160;
      } else if (f.properties.name === 'France') {
        rect.left = -5.4534286;
        rect.width =  9.8678344 + 5.4534286;
        rect.top = 41.2632185;
        rect.height = 51.268318 - 41.2632185;
      }
      this._cacheRects[f.properties.name] = rect;
    }
    return rect;
  }
}
