import {
  AfterViewInit,
  Component,
  EventEmitter, HostListener,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {ModelService} from "../../../model/model.service";
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-map-rotate',
  templateUrl: './map-rotate.component.html',
  styleUrls: ['./map-rotate.component.scss']
})
export class MapRotateComponent implements OnInit,OnDestroy,AfterViewInit {

  private onModelReadyListener:any;

  @ViewChild("mapContainer", { read: ViewContainerRef }) mapContainerRef: ViewContainerRef;
  @ViewChild("mapArea", { read: ViewContainerRef }) mapAreaRef: ViewContainerRef;

  private mapContainer:HTMLElement;
  private mapArea:HTMLElement;

  private request:any;
  private requestRotate:any;
  private running:boolean = false;

  private tileStyle:any;
  public mapID:string='map-rotate';



  private isClick:boolean = false;
  private isMooving:boolean = false;
  private isZooming:boolean = false;
  private isRotating:boolean = false;
  private bearing:number = -15;

  ///////////////////////////////////
  // mapbox user: muiznieks.mapbox.1@gmail.com
  // is something doesn't work - please revert mapboxgl to previous version without token use -> "mapbox-gl": "^1.5.0"
  ///////////////////////////////////

  private TOKEN:string = 'pk.eyJ1IjoibXVpem5pZWtzbWFwYm94MSIsImEiOiJja3R5Y254eXMxa3J1Mm9xdHE1ZWlkNXd2In0.xOef5lCtOrtQoHdm0xlytw';
  private map:mapboxgl.Map;
  private mapCanvasElement:HTMLElement;
  /////////////////////////////
  private mapBounds:any = [[22.958132170481775, 56.56684635548436], [25.440404928536964, 57.40625656746565]];

  /////////////////////////////

  private MIN_ZOOM:number=0;
  private MAX_ZOOM:number=12;
  private PADDING:number = 30;

  ////////////////////////////////////////////
  private ww:number = 0;
  private hh:number = 0;

  ////////////////////////
  public initialized:boolean = false;
  private mapInitialized:boolean = false;
  ///////////////////////

  /////////////////////////////////////////////////////////////
  @Output() onDataHasLoaded:EventEmitter<any> = new EventEmitter<any>();


  constructor(public model: ModelService) {

  }

  ngOnDestroy():void{
    if(this.map){

      cancelAnimationFrame(this.requestRotate);

      this.map.off('load', this.mapOnLoad);
      this.map.off('render', this.mapOnRender);
      this.map.off('touchstart', this.mapOnTouchStart);
      this.map.off('touchend', this.mapOnTouchEnd);
      this.map.off('mousedown', this.mapOnMouseDown);
      this.map.off('mouseup', this.mapOnMouseUp);
      this.map.off('rotatestart', this.mapOnRotateStart);
      this.map.off('rotateend', this.mapOnRotateEnd);

      this.map = null;
    }
    this.onModelReadyListener.unsubscribe();
  }
  ngOnInit():void {
  }
  ngAfterViewInit() {

    this.mapContainer = this.mapContainerRef.element.nativeElement as HTMLElement;
    this.mapArea = this.mapAreaRef.element.nativeElement as HTMLElement;
    this.resizeContainer();

    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);

    if(this.model.READY===true){
      this.initialize();
    }
  }

  private onModelReady=():void=>{
    this.initialize();
  }
  initialize():void{
    if(this.initialized===true){ return; }
    this.initialized = true;
    this.initializeMap();
  }

  private generateMapStyle():void{
    const textColor:string = '#8c8c8c';
    const textHaloColor:string = 'rgba(255,255,255,1)';
    this.tileStyle = {
      "version": 8,
      "sources": {
        "openmaptiles": {
          "type": "vector",
          "tiles": ["https://geo.rupucs.in/api/tiles/planet/{z}/{x}/{y}"],
          "minZoom": 0,
          "maxZoom": 22
        }
      },
      "sprite": "https://openmaptiles.github.io/dark-matter-gl-style/sprite",
      "glyphs": "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=0g05zGjMGsi8gLPQK5ZH",
      "layers": [
        {
          "id": "background",
          "type": "background",
          "paint": {"background-color": "#ffffff"}
        },
        {
          "id": "landuse-residential",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "landuse",
          "filter": [
            "all",
            ["==", "$type", "Polygon"],
            ["in", "class", "residential", "suburb", "neighbourhood"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {"fill-color": "rgba(0,0,0,0.05)", "fill-opacity": 1}
        },
        {
          "id": "landcover_grass",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "landcover",
          "filter": ["==", "class", "grass"],
          "paint": {"fill-opacity": 1, "fill-color": "rgba(0,0,0,0.05)"}
        },
        {
          "id": "landcover_wood",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "landcover",
          "minzoom": 8,
          "filter": ["all", ["==", "$type", "Polygon"], ["==", "class", "wood"]],
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-color": "rgba(0, 0, 0, 0.05)",
            "fill-opacity": {"base": 0.3, "stops": [[8, 0.2], [10, 0.4], [13, 0.2]]},
            "fill-translate": [0, 0]
          }
        },
        {
          "id": "water",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "water",
          "filter": [
            "all",
            ["==", "$type", "Polygon"],
            ["!=", "intermittent", 1],
            ["!=", "brunnel", "tunnel"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {"fill-color": "#bfdbfa"}
        },
        {
          "id": "landcover_sand",
          "type": "fill",
          "metadata": {},
          "source": "openmaptiles",
          "source-layer": "landcover",
          "filter": ["all", ["in", "class", "sand"]],
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-antialias": false,
            "fill-color": "rgba(0,0,0,0.05)",
            "fill-opacity": 0.3
          }
        },
        {
          "id": "landuse",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "landuse",
          "filter": ["==", "class", "agriculture"],
          "layout": {"visibility": "visible"},
          "paint": {"fill-color": "#eae0d0"}
        },
        {
          "id": "landuse_overlay_national_park",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "landcover",
          "filter": ["==", "class", "national_park"],
          "paint": {
            "fill-color": "#E1EBB0",
            "fill-opacity": {"base": 1, "stops": [[5, 0], [9, 0.75]]}
          }
        },
        {
          "id": "waterway-tunnel",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "tunnel"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {
            "line-color": "hsl(205, 56%, 73%)",
            "line-dasharray": [3, 3],
            "line-gap-width": {"stops": [[12, 0], [20, 6]]},
            "line-opacity": 1,
            "line-width": {"base": 1.4, "stops": [[8, 1], [20, 2]]}
          }
        },
        {
          "id": "waterway",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!in", "brunnel", "tunnel", "bridge"],
            ["!=", "intermittent", 1]
          ],
          "layout": {"visibility": "none"},
          "paint": {
            "line-color": "hsl(205, 56%, 73%)",
            "line-opacity": 1,
            "line-width": {"base": 1.4, "stops": [[8, 1], [20, 8]]}
          }
        },
        {
          "id": "waterway_intermittent",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["!in", "brunnel", "tunnel", "bridge"],
            ["==", "intermittent", 1]
          ],
          "layout": {"visibility": "visible"},
          "paint": {
            "line-color": "hsl(205, 56%, 73%)",
            "line-dasharray": [2, 1],
            "line-opacity": 1,
            "line-width": {"base": 1.4, "stops": [[8, 1], [20, 8]]}
          }
        },
        {
          "id": "tunnel_railway_transit",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 0,
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "tunnel"],
            ["==", "class", "transit"]
          ],
          "layout": {"line-cap": "butt", "line-join": "miter"},
          "paint": {
            "line-color": "hsl(34, 12%, 66%)",
            "line-dasharray": [3, 3],
            "line-opacity": {"base": 1, "stops": [[11, 0], [16, 1]]}
          }
        },
        {
          "id": "building",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "building",
          "paint": {
            "fill-antialias": true,
            "fill-color": "rgba(0,0,0,0.04)",
            "fill-opacity": {"base": 1, "stops": [[13, 0], [15, 1]]},
            "fill-outline-color": {
              "stops": [[15, "rgba(0,0,0,0.05)"], [16, "rgba(0,0,0,0.05)"]]
            }
          }
        },
        {
          "id": "road_area_pier",
          "type": "fill",
          "metadata": {},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["==", "$type", "Polygon"], ["==", "class", "pier"]],
          "layout": {"visibility": "visible"},
          "paint": {"fill-antialias": true, "fill-color": "hsl(47, 26%, 88%)"}
        },
        {
          "id": "road_pier",
          "type": "line",
          "metadata": {},
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["all", ["==", "$type", "LineString"], ["in", "class", "pier"]],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#81b9e4",
            "line-width": {"base": 1.2, "stops": [[15, 1], [17, 4]]}
          }
        },
        {
          "id": "road_bridge_area",
          "type": "fill",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "Polygon"],
            ["in", "brunnel", "bridge"]
          ],
          "layout": {},
          "paint": {"fill-color": "#81b9e4", "fill-opacity": 1}
        },
        {
          "id": "road_path",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["in", "class", "path", "track"]
          ],
          "layout": {"line-cap": "square", "line-join": "bevel"},
          "paint": {
            "line-color": "#81b9e4",
            "line-dasharray": [1, 1],
            "line-width": {"base": 1.55, "stops": [[4, 0.25], [20, 10]]}
          }
        },
        {
          "id": "road_minor",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "minzoom": 13,
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["in", "class", "minor", "service"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#81b9e4",
            "line-width": {"base": 1.55, "stops": [[4, 0.2], [20, 16]]}
          }
        },
        {
          "id": "aeroway-area",
          "type": "fill",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "aeroway",
          "minzoom": 4,
          "filter": [
            "all",
            ["==", "$type", "Polygon"],
            ["in", "class", "runway", "taxiway"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {
            "fill-color": "rgba(255, 255, 255, 1)",
            "fill-opacity": {"base": 1, "stops": [[13, 0], [14, 1]]}
          }
        },
        {
          "id": "aeroway-taxiway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "aeroway",
          "minzoom": 12,
          "filter": [
            "all",
            ["in", "class", "taxiway"],
            ["==", "$type", "LineString"]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#81b9e4",
            "line-opacity": 1,
            "line-width": {"base": 1.5, "stops": [[12, 1], [17, 10]]}
          }
        },
        {
          "id": "aeroway-runway",
          "type": "line",
          "metadata": {"mapbox:group": "1444849345966.4436"},
          "source": "openmaptiles",
          "source-layer": "aeroway",
          "minzoom": 4,
          "filter": [
            "all",
            ["in", "class", "runway"],
            ["==", "$type", "LineString"]
          ],
          "layout": {
            "line-cap": "round",
            "line-join": "round",
            "visibility": "visible"
          },
          "paint": {
            "line-color": "#81b9e4",
            "line-opacity": 1,
            "line-width": {"base": 1.5, "stops": [[11, 4], [17, 50]]}
          }
        },
        {
          "id": "road_trunk_primary",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["in", "class", "trunk", "primary"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "rgba(0,0,0,0.08)",
            "line-width": {"base": 1.4, "stops": [[6, 0.5], [20, 30]]}
          }
        },
        {
          "id": "road_secondary_tertiary",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["in", "class", "secondary", "tertiary"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "rgba(0,0,0,0.08)",
            "line-width": {"base": 1.4, "stops": [[6, 0.5], [20, 16]]}
          }
        },
        {
          "id": "road_major_motorway",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "class", "motorway"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "rgba(0,0,0,0.08)",
            "line-offset": 0,
            "line-width": {"base": 1.4, "stops": [[8, 0.6], [16, 10]]}
          }
        },
        {
          "id": "railway-transit",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "class", "transit"],
            ["!=", "brunnel", "tunnel"]
          ],
          "layout": {"visibility": "visible"},
          "paint": {
            "line-color": "rgba(0,0,0,0.08)",
            "line-opacity": {"base": 1, "stops": [[11, 0], [16, 1]]}
          }
        },
        {
          "id": "railway",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": ["==", "class", "rail"],
          "layout": {"visibility": "visible"},
          "paint": {
            "line-color": "#ffffff",
            "line-opacity": {"base": 1, "stops": [[11, 0], [16, 1]]}
          }
        },
        {
          "id": "waterway-bridge-case",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"]
          ],
          "layout": {"line-cap": "butt", "line-join": "miter"},
          "paint": {
            "line-color": "#bbbbbb",
            "line-gap-width": {"base": 1.55, "stops": [[4, 0.25], [20, 30]]},
            "line-width": {"base": 1.6, "stops": [[12, 0.5], [20, 10]]}
          }
        },
        {
          "id": "waterway-bridge",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "waterway",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "hsl(205, 56%, 73%)",
            "line-width": {"base": 1.55, "stops": [[4, 0.25], [20, 30]]}
          }
        },
        {
          "id": "bridge_minor case",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"],
            ["==", "class", "minor_road"]
          ],
          "layout": {"line-cap": "butt", "line-join": "miter"},
          "paint": {
            "line-color": "#dedede",
            "line-gap-width": {"base": 1.55, "stops": [[4, 0.25], [20, 30]]},
            "line-width": {"base": 1.6, "stops": [[12, 0.5], [20, 10]]}
          }
        },
        {
          "id": "bridge_major case",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"],
            ["in", "class", "primary", "secondary", "tertiary", "trunk"]
          ],
          "layout": {"line-cap": "butt", "line-join": "miter"},
          "paint": {
            "line-color": "#81b9e4",
            "line-gap-width": {"base": 1.55, "stops": [[4, 0.25], [20, 30]]},
            "line-width": {"base": 1.6, "stops": [[12, 0.5], [20, 10]]}
          }
        },
        {
          "id": "bridge_minor",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"],
            ["==", "class", "minor_road"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#efefef",
            "line-width": {"base": 1.55, "stops": [[4, 0.25], [20, 30]]}
          }
        },
        {
          "id": "bridge_major",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "transportation",
          "filter": [
            "all",
            ["==", "$type", "LineString"],
            ["==", "brunnel", "bridge"],
            ["in", "class", "primary", "secondary", "tertiary", "trunk"]
          ],
          "layout": {"line-cap": "round", "line-join": "round"},
          "paint": {
            "line-color": "#81b9e4",
            "line-width": {"base": 1.4, "stops": [[6, 0.5], [20, 30]]}
          }
        },
        {
          "id": "admin_sub",
          "type": "line",
          "source": "openmaptiles",
          "source-layer": "boundary",
          "filter": ["in", "admin_level", 4, 6, 8],
          "layout": {"visibility": "none"},
          "paint": {"line-color": "hsla(0, 0%, 60%, 0.5)", "line-dasharray": [2, 1]}
        },

        {
          "id": "place_other",
          "type": "symbol",
          "metadata": {"mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 14,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            ["in", "class", "hamlet", "isolated_dwelling", "neighbourhood"]
          ],
          "layout": {
            "text-anchor": "center",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Roboto Condensed Bold", "Noto Sans Regular"],
            "text-justify": "center",
            "text-offset": [0.5, 0],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": textColor,
            "text-halo-color": textHaloColor,
            "text-halo-blur": 1,
            "text-halo-width": 1
          }
        },
        {
          "id": "place_suburb",
          "type": "symbol",
          "metadata": {"mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 15,
          "filter": ["all", ["==", "$type", "Point"], ["==", "class", "suburb"]],
          "layout": {
            "text-anchor": "center",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Roboto Condensed Bold", "Noto Sans Regular"],
            "text-justify": "center",
            "text-offset": [0.5, 0],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": textColor,
            "text-halo-color": textHaloColor,
            "text-halo-blur": 1,
            "text-halo-width": 1
          }
        },
        {
          "id": "place_village",
          "type": "symbol",
          "metadata": {"mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 14,
          "filter": ["all", ["==", "$type", "Point"], ["==", "class", "village"]],
          "layout": {
            "icon-size": 0.4,
            "text-anchor": "left",
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Roboto Condensed Bold", "Noto Sans Regular"],
            "text-justify": "left",
            "text-offset": [0.5, 0.2],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "icon-opacity": 0.7,
            "text-color": textColor,
            "text-halo-color": textHaloColor,
            "text-halo-blur": 1,
            "text-halo-width": 1
          }
        },
        {
          "id": "place_town",
          "type": "symbol",
          "metadata": {"mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 15,
          "filter": ["all", ["==", "$type", "Point"], ["==", "class", "town"]],
          "layout": {
            "icon-image": {"base": 1, "stops": [[0, "circle-11"], [9, ""]]},
            "icon-size": 0.4,
            "text-anchor": {"base": 1, "stops": [[0, "left"], [8, "center"]]},
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Roboto Condensed Bold", "Noto Sans Regular"],
            "text-justify": "left",
            "text-offset": [0.5, 0.2],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "icon-opacity": 0.7,
            "text-color": textColor,
            "text-halo-color": textHaloColor,
            "text-halo-blur": 1,
            "text-halo-width": 1
          }
        },
        {
          "id": "place_city",
          "type": "symbol",
          "metadata": {"mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 14,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            ["==", "class", "city"],
            [">", "rank", 3]
          ],
          "layout": {
            "icon-image": {"base": 1, "stops": [[0, "circle-11"], [9, ""]]},
            "icon-size": 0.4,
            "text-anchor": {"base": 1, "stops": [[0, "left"], [8, "center"]]},
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Roboto Condensed Bold", "Noto Sans Regular"],
            "text-justify": "left",
            "text-offset": [0.5, 0.2],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "icon-opacity": 0.7,
            "text-color": textColor,
            "text-halo-color": textHaloColor,
            "text-halo-blur": 1,
            "text-halo-width": 1
          }
        },
        {
          "id": "place_city_large",
          "type": "symbol",
          "metadata": {"mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 12,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            ["<=", "rank", 3],
            ["==", "class", "city"]
          ],
          "layout": {
            "icon-image": {"base": 1, "stops": [[0, "circle-11"], [9, ""]]},
            "icon-size": 0.4,
            "text-anchor": {"base": 1, "stops": [[0, "left"], [8, "center"]]},
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Roboto Condensed Bold", "Noto Sans Regular"],
            "text-justify": "left",
            "text-offset": [0.5, 0.2],
            "text-size": 14,
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "icon-opacity": 0.7,
            "text-color": textColor,
            "text-halo-color": textHaloColor,
            "text-halo-blur": 1,
            "text-halo-width": 1
          }
        },
        {
          "id": "place_state",
          "type": "symbol",
          "metadata": {"mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 12,
          "filter": ["all", ["==", "$type", "Point"], ["==", "class", "state"]],
          "layout": {
            "text-field": "{name:latin}\n{name:nonlatin}",
            "text-font": ["Roboto Condensed Regular", "Noto Sans Regular"],
            "text-size": 10,
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": textColor,
            "text-halo-color": textHaloColor,
            "text-halo-blur": 1,
            "text-halo-width": 1
          }
        },
        {
          "id": "place_country_minor",
          "type": "symbol",
          "metadata": {"mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 8,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            ["==", "class", "country"],
            [">=", "rank", 2],
            ["has", "iso_a2"]
          ],
          "layout": {
            "text-field": "{name:latin}",
            "text-font": ["Roboto Condensed Bold", "Noto Sans Regular"],
            "text-size": {"base": 1, "stops": [[0, 10], [6, 12]]},
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": textColor,
            "text-halo-color": textHaloColor,
            "text-halo-width": 1.4
          }
        },
        {
          "id": "place_country_major",
          "type": "symbol",
          "metadata": {"mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"},
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 6,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            ["<=", "rank", 1],
            ["==", "class", "country"],
            ["has", "iso_a2"]
          ],
          "layout": {
            "text-anchor": "center",
            "text-field": "{name:latin}",
            "text-font": ["Roboto Condensed Bold", "Noto Sans Regular"],
            "text-size": {"base": 1.4, "stops": [[0, 10], [3, 12], [4, 14]]},
            "text-transform": "uppercase",
            "visibility": "visible"
          },
          "paint": {
            "text-color": textColor,
            "text-halo-color": textHaloColor,
            "text-halo-width": 1.4
          }
        },
        {
          "id": "country_label",
          "type": "symbol",
          "source": "openmaptiles",
          "source-layer": "place",
          "maxzoom": 12,
          "filter": [
            "all",
            ["==", "$type", "Point"],
            ["==", "class", "country"],
            ["has", "iso_a2"]
          ],
          "layout": {
            "text-field": "{name:latin}",
            "text-font": ["Roboto Condensed Regular"],
            "text-max-width": 10,
            "text-size": {"stops": [[3, 12], [8, 22]]},
            "visibility": "visible"
          },
          "paint": {
            "text-color": textColor,
            "text-halo-color": textHaloColor,

            "text-halo-blur": 0,
            "text-halo-width": 1,
            "icon-color": "#ffffff",
            "icon-halo-color": "rgba(0,0,0,0.6)",
            "icon-halo-width": 2,
            "icon-halo-blur": 0
          }
        }
      ]
    };
  }
  private initializeMap():void{
    this.generateMapStyle();
    mapboxgl.accessToken = this.TOKEN;
    this.map = new mapboxgl.Map({
      container: this.mapID,
      antialias: true,
      style: this.tileStyle,
      dragPan:true,
      renderWorldCopies:false,
      bounds: this.mapBounds,
      doubleClickZoom:false,
      trackResize:true,
      boxZoom:false,
      /////////////////
      // disable pitch
      /////////////////
      pitchWithRotate: true,
      dragRotate: true,
      touchZoomRotate: true
    });

    this.map.setBearing(this.bearing);
    this.map.setPitch(44.5);

    const element = document.getElementById(this.mapID);
    this.ww = element.offsetWidth;
    this.hh = element.offsetHeight;

    this.map.on('load', this.mapOnLoad);
    this.map.on('render', this.mapOnRender);

    this.map.on('touchstart', this.mapOnTouchStart);
    this.map.on('touchend', this.mapOnTouchEnd);
    this.map.on('mousedown', this.mapOnMouseDown);
    this.map.on('mouseup', this.mapOnMouseUp);

    this.map.on('rotatestart', this.mapOnRotateStart);
    this.map.on('rotateend', this.mapOnRotateEnd);


    this.startListenMapReady();
  }
  public resetMapStyle():void {
    this.generateMapStyle();
    this.map.setStyle(this.tileStyle); this.startListenMapReady();
    this.resizeContainer();
  }

  private mapOnRender=(e:any):void=>{
    const loaded:boolean = this.map.loaded();
    if(loaded===false){
      return;
    }
    this.mapInitialized = true;
    this.map.off('render', this.mapOnRender);
  }
  private mapOnLoad=(e:any):void=>{

    this.mapCanvasElement = document.getElementsByClassName('mapboxgl-canvas')[0] as HTMLElement;
    this.mapCanvasElement.style.outline = 'none';
    this.map.scrollZoom.setWheelZoomRate(1/100);
    this.map.scrollZoom.setZoomRate(1/100);
    this.map.scrollZoom.enable({around: 'center'});
    this.map.touchZoomRotate.enable({around: 'center'});
    //////////////////////////////////////////////////
    this.resizeContainer();
    this.rotateCamera();
  }

  private mapOnRotateStart=(e:any):void=>{
    this.isRotating = true;
  }
  private mapOnRotateEnd=(e:any):void=>{
    this.isRotating = false;
    this.bearing = this.map.getBearing();
  }

  private mapOnMouseDown=(e:any):void=>{
    this.isClick = true;
  }
  private mapOnMouseUp=(e:any):void=>{
    this.isClick = false;
  }
  private mapOnTouchStart=(e:any):void=>{
    this.isMooving = true;
  }
  private mapOnTouchEnd=(e:any):void=>{
    this.isMooving = false;
  }


  ///////////////////////////////////////////////
  ///////////////////////////////////////////////
  private startListenMapReady():void{
    if(this.running===true){return;}
    this.running = true;
    this.request = requestAnimationFrame(this.onEnterFrame);

  }
  private stopListenMapReady():void{
    if(this.running===false){return;}
    cancelAnimationFrame(this.request);
    this.running = false;
  }
  private onEnterFrame=():void=>{
    const styleLoaded:boolean = this.map.isStyleLoaded();
    if(styleLoaded===true){
      this.stopListenMapReady();
    }else{
      this.request = requestAnimationFrame(this.onEnterFrame);
    }
  }

  private resizeContainer():void{
    if(this.initialized==false){ return;}

    this.ww = this.mapContainerRef.element.nativeElement.offsetWidth;
    this.hh = this.mapContainerRef.element.nativeElement.offsetHeight;

    if(this.map){
      this.map.resize();
      this.map.fitBounds(this.mapBounds,{padding: this.PADDING});
      this.MIN_ZOOM = parseFloat(this.map.getZoom().toFixed(2)+'');
    }
  }
  @HostListener('window:resize', ['$event'])
  onHostResize(event:Event){
    this.resizeContainer();
  }

  @HostListener('window:orientationchange', ['$event'])
  onHostOrientationChange(event:Event){
    this.resizeContainer();
  }

  public rotateCamera=():void=> {
    if(this.isMooving==false  && this.isZooming==false && this.isClick==false && this.isRotating==false){
      this.map.rotateTo(this.bearing, { duration: 0 });
      this.bearing+=0.05;
      this.bearing = this.bearing>=360?0:this.bearing;
    }
    this.requestRotate = requestAnimationFrame(this.rotateCamera);
  }


}
