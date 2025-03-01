import {
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy,
  OnInit, Output, SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import mapboxgl from 'mapbox-gl';
import {PopSimpleVO} from '../pop-ups/vos/PopSimpleVO';
import {RouteVO} from "../../../model/vo/RouteVO";
import {ConfigMapColors} from "../../../model/configs/ConfigMapColors";
import {MapLegendPopComponent} from "../map-legend-pop/map-legend-pop.component";
import {MapLayersPopComponent} from "../map-layers-pop/map-layers-pop.component";
import {TranslationVO} from "../../../model/vo/TranslationVO";
import {LoggerService} from "../../../model/log/logger.service";
import {ModelService} from "../../../model/model.service";
import {MapBackgroundChoroService} from "../../services/map-bacground-choro/map-background-choro.service";
import {MapCentroidsService} from "../../services/map-centroids/map-centroids.service";
import {MapPopService} from "../../services/map-pop/map-pop.service";
import {BackgroundDataVO} from "../../vos/BackgroundDataVO";
import {CentroidVO} from "../../vos/CentroidVO";
import {DomElementsInfo} from "../../../model/vo/DomElementsInfo";
import {Utils} from "../../../model/inc/Utils";



@Component({
  selector: 'app-mapbox',
  templateUrl: './map-mapbox.component.html',
  styleUrls: ['./map-mapbox.component.scss']
})

export class MapMapBoxComponent implements OnInit,OnDestroy,OnChanges {

  @ViewChild('mapRef', { read: ViewContainerRef, static: true }) mapRef:ViewContainerRef;
  @ViewChild('popContainer', { read: ViewContainerRef, static: true }) popContainer:ViewContainerRef;
  @ViewChild('legendContainer', { read: ViewContainerRef, static: true }) legendContainer:ViewContainerRef;
  @ViewChild('layersContainer', { read: ViewContainerRef, static: true }) layersContainer:ViewContainerRef;
  @ViewChild('loaderContainer', { read: ViewContainerRef, static: true }) loaderContainer:ViewContainerRef;
  //////////////////////

  @Output() onSettingsChange:EventEmitter<any> = new EventEmitter<any>();
  @Output() onLegendChange:EventEmitter<any> = new EventEmitter<any>();
  @Output() onFullScreenChange:EventEmitter<any> = new EventEmitter<any>();

  public THEME:string;
  public backgroundLight:boolean = true;

  @Input() route:RouteVO; private oldRoute:RouteVO;
  @Input() lang:string;
  @Input() initialized:boolean=false;
  @Input() mobile:boolean=false;
  @Input() settingsVisible:boolean = false;
  @Input() mapFullScreen:boolean = false;
  @Input() legendIsVisible:boolean = false;


  private angularInitialized:boolean = false;
  private mapIsInitialized:boolean = false;
  private mapStyleLoaded:boolean = false;
  private mapDataLoaded:boolean = false;
  private mapCentroidsLoaded:boolean = false;
  //////////////////////////////////

  public reloading:boolean = true;

  @Input() isEmpty:boolean = false;
  @Input() data:Array<any> = [];

  private configMapColors:ConfigMapColors;



  private appContainer:HTMLElement;
  private mapContainer:HTMLElement;
  private mapArea:HTMLElement;
  public map:mapboxgl.Map;
  private TOKEN:string = 'pk.eyJ1IjoibXVpem5pZWtzbWFwYm94MSIsImEiOiJja3R5Y254eXMxa3J1Mm9xdHE1ZWlkNXd2In0.xOef5lCtOrtQoHdm0xlytw';
  private mapCanvasElement:HTMLElement;
  /////////////////////////////
  private mapBounds:any = [[20.96211, 55.67468], [28.24150, 58.08557]];
  /////////////////////////////

  private MIN_ZOOM:number=0;
  private MAX_ZOOM:number=12;
  private CURRENT_ZOOM:number=-1;

  public ZOOM_IN_ENABLED:boolean=true;
  public ZOOM_OUT_ENABLED:boolean=false;
  private PADDING:number = 40;

  /////////////////////////////

  private popLegendFactory:ComponentFactory<MapLegendPopComponent>;
  private popLayersFactory:ComponentFactory<MapLayersPopComponent>;

  private popLegendRef:ComponentRef<MapLegendPopComponent>;
  private popLayersRef:ComponentRef<MapLayersPopComponent>;
  ////////////////////////////

  private tileStyle:any;

  ////////////////////////
  public mouseIsDown:boolean = false;
  private mapClickCoords:any=null;
  //////////////////////////////////
  private layersOpen:boolean = false;
  //////////////////////////////////
  private onBackgroundDataUpdateListener:any;
  private onCentroidsDataUpdateListener:any;
  //////////////////////////////////
  public copyrightORTO_VO:TranslationVO;
  public copyrightOSM_VO:TranslationVO;
  //////////////////////////////////

  private request:any;
  private running:boolean = false;
  //////////////////////////////////
  public dataIsNotComplete:boolean = false;
  public DPI:number;


  constructor(private model: ModelService, private resolver: ComponentFactoryResolver, private backgroundService:MapBackgroundChoroService, private centroidService:MapCentroidsService, private popService:MapPopService , public dom:DomElementsInfo, private logger:LoggerService) {
    this.logger.enabled = false;
    this.DPI = this.model.DPI;
  }

  ngOnDestroy(){

    this.onBackgroundDataUpdateListener.unsubscribe();
    this.onCentroidsDataUpdateListener.unsubscribe();

    if(this.map){
      this.map.off('load', this.mapOnLoad);
      this.map.off('render', this.mapOnRender);
      this.map.off('dblclick', this.mapOnDoubleClick);
      this.map.off('mousemove', this.mapOnMouseMove);
      this.map.off('mouseenter', 'mapbox', this.layerOnMouseOver);
      this.map.off('mouseleave', 'mapbox', this.layerOnMouseOut);
      this.map.off('click', this.mapOnClick);
      this.map.off('mouseleave', this.mapOnMouseOut);
      this.map.off('mousedown', this.mapOnMouseDown);
      this.map.off('mouseup', this.mapOnMouseUp);
      this.map.off('wheel', this.mapOnWheel);
      this.map.off('zoomend', this.mapOnZoomEnd);
      this.map.off('zoom', this.mapOnZoom);
      this.map.off('movestart', this.mapOnMoveStart);
      this.map.off('moveend', this.mapOnMoveEnd);
      this.map.off('move', this.mapOnMove);
      this.map.off('sourcedata', this.mapOnSourceData);

      window.removeEventListener('scroll', this.onWindowScroll);
      this.map = null;
    }
    this.mapRef.clear();
  }
  ngOnInit() {

    this.logger.log('****************');
    this.logger.log('MAP-BOX - ngOnInit');
    this.logger.log('****************');

    this.mapRef.clear();
    this.appContainer = document.getElementById('csbApp') as HTMLElement;
    this.mapContainer = document.getElementById('mapContainer') as HTMLElement;
    this.mapArea = document.getElementById('map-area') as HTMLElement;
    this.resizeContainer();

    this.onBackgroundDataUpdateListener = this.backgroundService.onDataUpdated.subscribe(this.onBackgroundDataUpdate);
    this.onCentroidsDataUpdateListener = this.centroidService.onDataUpdated.subscribe(this.onCentroidsDataUpdate);

    this.popLegendFactory = this.resolver.resolveComponentFactory(MapLegendPopComponent);
    this.popLayersFactory = this.resolver.resolveComponentFactory(MapLayersPopComponent);

    this.popLegendRef = this.legendContainer.createComponent(this.popLegendFactory);
    this.popLegendRef.instance.mobile = this.mobile;
    this.popLegendRef.instance.lang = this.lang;
    this.popLegendRef.instance.onClose = this.onCloseLegend;

    this.popLayersRef = this.layersContainer.createComponent(this.popLayersFactory);
    this.popLayersRef.instance.mobile = this.mobile;
    this.popLayersRef.instance.lang = this.lang;
    this.popLayersRef.instance.radio_id = this.model.MAP_POP_STYLE;
    this.popLayersRef.instance.onClose = this.onCloseLayers;
    this.popLayersRef.instance.onChange = this.onLayersChange;
    this.angularInitialized = true;

    this.initialize();
  }
  ngOnChanges(changes:SimpleChanges): void {
    this.logger.log('****************');
    this.logger.log('MAP-BOX - changes');
    this.logger.log('****************');
    if(changes['mobile']){
      if(this.popLegendRef){
        this.popLegendRef.instance.mobile = this.mobile;
        this.popLegendRef.instance.visible = this.legendIsVisible;
      }
      if(this.popLayersRef){
        this.popLayersRef.instance.mobile = this.mobile;
        this.popLayersRef.instance.visible = this.layersOpen;
      }
      this.resizeContainer();
    }
    if(changes['pop']){

    }
    if(changes['legendIsVisible'] && this.popLegendRef!==undefined){
      this.popLegendRef.instance.visible = this.legendIsVisible;
    }
    if(changes['layersOpen'] && this.popLayersRef!==undefined){
      this.popLayersRef.instance.visible = this.layersOpen;
    }
    if(changes['mapFullScreen']){
      this.resizeContainer();
    }
    if(changes['settingsVisible']){
      this.resizeContainer();
    }

    if(changes['route']){
      if(changes['route'].previousValue!==undefined){
        this.oldRoute = (changes['route'].previousValue as RouteVO).clone();
      }else{
        this.oldRoute = this.route.clone();
      }
      this.onRouteUpdate();
    }
    if(changes['lang']){
      this.onLanguageUpdate();
    }
  }

  private onRouteUpdate=():void=>{
    if(this.mapIsInitialized==false || this.angularInitialized==false){return;}

    this.logger.log('*******************');
    this.logger.log('MAP-MAPBOX.onRouteUpdate()');
    this.logger.log('*******************');


    this.generateMapStyle();
    this.mapStyleLoaded = false;
    this.map.setStyle(this.tileStyle); this.checkLoading();


    this.hidePop();
    this.loadCentroidsData();
    this.loadBackgroundData();

  }
  private onLanguageUpdate=():void=>{
      this.updateLocalizations();
      this.hidePop();
  }

  private loadBackgroundData():void{
    this.logger.log('*******************');
    this.logger.log('MAP-MAPBOX.loadBackgroundData()');
    this.logger.log('*******************');
    this.mapDataLoaded = false; this.checkLoading();
    this.popLegendRef.instance.update([],false,false);
  }
  private onBackgroundDataUpdate=():void=>{
    this.logger.log('*******************');
    this.logger.log('MAP-BOX.onBackgroundDataUpdate()');
    this.logger.log('*******************');

    this.configMapColors = this.model.configMapColors;

    ////////////////////// setting legend values //////////////////
    this.popLegendRef.instance.update(this.backgroundService.clusters.items,this.backgroundService.impossibleData,this.backgroundService.zerroData);
    /////////////////////////////////////////////////////////////
    this.model.background_data = [...this.backgroundService.data];
    this.model.background_data_ids = [...this.backgroundService.ids];
    /////////////////////////////////////////////////////////////
    this.mapDataLoaded = true; this.checkLoading();
    this.dataIsNotComplete = this.model.dataIsNotComplete;

    if(this.mapIsInitialized===true) {
      this.generateMapStyle();
      this.backgroundLight = this.model.MAP_POP_STYLE !== 'map_dark';
      this.mapStyleLoaded = false;
      this.map.setStyle(this.tileStyle); this.checkLoading();
    }else if(this.mapIsInitialized===false){
      this.generateMapStyle();
      this.initializeMap();
    }
  }

  private loadCentroidsData():void{
    this.logger.log('*******************');
    this.logger.log('MAP-MAPBOX.loadCentroidsData()');
    this.logger.log('*******************');
    this.mapCentroidsLoaded = false; this.checkLoading();
    this.centroidService.loadData(this.route.T1, this.route.year);
  }
  private onCentroidsDataUpdate=():void=>{
    this.logger.log('*******************');
    this.logger.log('MAP-MAPBOX.onCentroidsDataUpdate()');
    this.logger.log('*******************');
    this.mapCentroidsLoaded = true; this.checkLoading();
    this.updateCentroidPositions();
  }

  private updateLocalizations():void{
    if(this.initialized===false){return;}
    this.copyrightORTO_VO = this.model.translations.item('map-copyright-orto');
    this.copyrightOSM_VO = this.model.translations.item('map-copyright-osm');
  }

  initialize():void{
    if(this.initialized===false){return;}

    this.configMapColors = this.model.configMapColors;
    this.backgroundService.initialize();

    this.centroidService.serviceURL = this.model.config.serviceURL;
    this.popService.serviceURL = this.model.config.serviceURL;
    this.popService.onPickingDataRequestAnswer.subscribe(this.onPickingDataRequestAnswer);


    this.updateLocalizations();
    this.loadCentroidsData();
    this.loadBackgroundData();
  }

  private generateMapStyle():void{
    this.logger.log('*************************');
    this.logger.log('MAP-BOX - generateMapStyle() ');
    this.logger.log('*************************');
    this.THEME = this.model.MAP_POP_STYLE;
    this.configMapColors = this.model.configMapColors;

    this.mapStyleLoaded = false;
    const URL:string = this.model.config.geoServerTilesURL;
    let tileURL:string;
    let layerID:string;

    switch (this.route.T1) {
      case '1':
        layerID = this.model.config.mapBoxLayer_1;
        break;
      case '3':
        layerID = this.model.config.mapBoxLayer_3;
        break;
      case '4':
        layerID = this.model.config.mapBoxLayer_4;
        break;
      case '7':
        layerID = this.model.config.mapBoxLayer_7;
        break;
    }
    tileURL = URL.replace('[layer]',layerID);

    if(this.model.MAP_POP_STYLE === 'map_light'){
      this.tileStyle = {
        'version': 8,
        'sources': {
          'mapbox': {
            'type': 'vector',
            'tiles': [tileURL],
            'minZoom': this.MIN_ZOOM,
            'maxZoom': this.MAX_ZOOM
          }
        },
        'layers': [
          {
            'id': 'mapbox',
            'type': 'fill',
            'source': 'mapbox',
            'source-layer': layerID,
            'filter': ['==', '$type', 'Polygon'],
            'paint': {
              'fill-color': this.colorizePolygons(),
              'fill-outline-color':this.configMapColors.borderColor(this.route.M1),
              'fill-opacity': 1
            }
          }
        ]
      };
    }else if(this.model.MAP_POP_STYLE ==='map_dark'){
      this.tileStyle = {
        'version': 8,
        'sources': {
          'mapbox': {
            'type': 'vector',
            'tiles': [tileURL],
            'minZoom': this.MIN_ZOOM,
            'maxZoom': this.MAX_ZOOM
          }
        },
        'layers': [
          {
            'id': 'mapbox',
            'type': 'fill',
            'source': 'mapbox',
            'source-layer': layerID,
            'filter': ['==', '$type', 'Polygon'],
            'paint': {
              'fill-color': this.colorizePolygons(),
              'fill-outline-color':this.configMapColors.borderColor(this.route.M1),
              'fill-opacity': 1
            }
          }
        ]
      };
    }else if(this.model.MAP_POP_STYLE === 'map_osm'){
      this.tileStyle = {
        'version': 8,
        'sources': {
          'mapbox': {
            'type': 'vector',
            'tiles': [tileURL],
            'minZoom': this.MIN_ZOOM,
            'maxZoom': this.MAX_ZOOM
          },
          'raster_bg': {
            'type': 'raster',
            'tiles': [this.model.config.osmTilesURL],
            'tileSize': 128
          }
        },
        'layers': [
          {
            'id': 'raster_bg',
            'type': 'raster',
            'source': 'raster_bg',
            'minZoom': this.MIN_ZOOM,
            'maxZoom': this.MAX_ZOOM
          },
          {
            'id': 'mapbox',
            'type': 'fill',
            'source': 'mapbox',
            'source-layer': layerID,
            'filter': ['==', '$type', 'Polygon'],
            'paint': {
              'fill-color': this.colorizePolygons(),
              'fill-outline-color':this.configMapColors.borderColor(this.route.M1),
              'fill-opacity': 1
            }
          }
        ]
      };
    }else if(this.model.MAP_POP_STYLE === 'map_orto'){
      this.tileStyle = {
        'version': 8,
        'sources': {
          'mapbox': {
            'type': 'vector',
            'tiles': [tileURL],
            'minZoom': this.MIN_ZOOM,
            'maxZoom': this.MAX_ZOOM
          },
          'raster_bg': {
            'type': 'raster',
            'tiles': [this.model.config.ortoTilesURL],
            'tileSize': 128
          }
        },
        'layers': [
          {
            'id': 'raster_bg',
            'type': 'raster',
            'source': 'raster_bg',
            'minZoom': this.MIN_ZOOM,
            'maxZoom': this.MAX_ZOOM
          },
          {
            'id': 'mapbox',
            'type': 'fill',
            'source': 'mapbox',
            'source-layer': layerID,
            'filter': ['==', '$type', 'Polygon'],
            'paint': {
              'fill-color': this.colorizePolygons(),
              'fill-outline-color':this.configMapColors.borderColor(this.route.M1),
              'fill-opacity': 1
            }
          }
        ]
      };
    }
  }
  private colorizePolygons=():any=>{
    if(this.backgroundService.data.length===0){
      return '#ffffff';
    }
    const all_codes:Array<string>=[];
    const arr:Array<any>=[];
    arr.push('match');
    arr.push(['get', 'code']);
    //////////////////////////////////////
    this.logger.log('MAP-BOX - colorizePolygons ');
    this.logger.dir(this.backgroundService.data);
    this.backgroundService.data.forEach((item:BackgroundDataVO)=>{
      const code:string = item.code;
      let color:string; // this.model.config.choroplet_no_value_color;
       // this.logger.log('level:'+this.t1+'code: '+code+' value:'+item.value);
      if(item.value>0){
        color = this.getColorByPercentage(item.value);
      }else if(item.value===0){
        color = this.configMapColors.map_zero_color;
      }else if(item.value===-1){
        color = this.configMapColors.map_no_value_color;
      }else{
        color = '#0078ff';  // unknown
      }

      if(all_codes.indexOf(code)===-1){
        all_codes.push(code);
        arr.push(code,color);
      }else{
        // this.logger.error('code ['+code+'] is not unique !!!');
      }
    });
    //////////////////////////////////////
    arr.push('#ffffff');
    return arr;
  }
  private initializeMap=():void=>{
    this.logger.log('MAP-BOX - initializeMap');
    this.generateMapStyle();
    mapboxgl.accessToken = this.TOKEN;

    this.map = new mapboxgl.Map({
      container: 'map',
      antialias: true,
      style: this.tileStyle,
      zoom: this.MIN_ZOOM,
      maxZoom:this.MAX_ZOOM,
      dragPan:true,
      renderWorldCopies:false,
      bounds: this.mapBounds,
      /*maxBounds:this.mapBounds,*/
      doubleClickZoom:false,
      trackResize:true,
      boxZoom:false,
      /////////////////
      // disable pitch
      /////////////////
/*      pitchWithRotate: false,
      dragRotate: false,
      touchZoomRotate: false*/
      pitchWithRotate: true,
      dragRotate: true,
      touchZoomRotate: true
    });
    this.map.getCanvas().style.cursor = 'default';

    this.map.on('load', this.mapOnLoad);
    this.map.on('render', this.mapOnRender);
    this.map.on('dblclick', this.mapOnDoubleClick);
    this.map.on('mousemove', this.mapOnMouseMove);

    this.map.on('mouseenter', 'mapbox', this.layerOnMouseOver);
    this.map.on('mouseleave', 'mapbox', this.layerOnMouseOut);

    this.map.on('click', this.mapOnClick);
    this.map.on('mouseleave', this.mapOnMouseOut);
    this.map.on('mousedown', this.mapOnMouseDown);
    this.map.on('mouseup', this.mapOnMouseUp);
    this.map.on('wheel', this.mapOnWheel);
    this.map.on('zoomend', this.mapOnZoomEnd);
    this.map.on('zoom', this.mapOnZoom);
    this.map.on('movestart', this.mapOnMoveStart);
    this.map.on('moveend', this.mapOnMoveEnd);
    this.map.on('move', this.mapOnMove);
    this.map.on('sourcedata', this.mapOnSourceData);

    window.addEventListener('scroll', this.onWindowScroll, true);

  }

  public onControlsLayers=():void=>{
    this.layersOpen = !this.layersOpen;
    this.popLayersRef.instance.radio_id = this.model.MAP_POP_STYLE;
    this.popLayersRef.instance.visible = this.layersOpen;
  }

  private mapOnRender=(e:any):void=>{
    const loaded:boolean = this.map.loaded();
    if(loaded===false){
      return;
    }
    this.mapIsInitialized = true;
    this.updateCentroidPositions();
    this.map.off('render', this.mapOnRender);
    this.resizeContainer();
  }
  private updateCentroidPositions=():void=>{
    if(this.mapIsInitialized===false){return;}
    this.getMapSizePixels();
    const data:Array<CentroidVO> = this.centroidService.data;
    let point:any;
    let i:number = 0;
    const L:number = data.length;
    while(i<L){
      point = this.map.project([data[i].geoCoords[0],data[i].geoCoords[1]]);
      data[i].pixelCoords = [point.x,point.y];
      i++;
    }
    this.centroidService.mapPositionUpdate();
  }
  private updateMobilePopupPosition():void{
    if(this.mapClickCoords) {
      const point: any = this.map.project(this.mapClickCoords.lngLat);
      this.positionPop(point.x, point.y);
    }
  }
  private getMapSizePixels():void{
    const p1 = this.map.project(this.mapBounds[0]);
    const p2 = this.map.project(this.mapBounds[1]);
    const xx:number = p2.x - p1.x;
    const yy:number = p2.y - p1.y;
    this.model.MAP_SIZE = Math.sqrt(xx*xx+yy*yy)/2;
    this.model.MAP_ZOOM = this.map.getZoom();
  }

  private mapOnLoad=(e:any):void=>{
    this.logger.log('MAP-BOX - mapOnLoad');
    this.mapCanvasElement = document.getElementsByClassName('mapboxgl-canvas')[0] as HTMLElement;
    this.mapCanvasElement.style.outline = 'none';
    this.map.scrollZoom.setWheelZoomRate(1/100);
    this.map.scrollZoom.setZoomRate(1/100);
    //////////////////////////////////////////////////
    this.resizeContainer();
    this.checkLoading();
  }
  private mapOnSourceData=(e:any):void=>{
    if(this.mapStyleLoaded==true){return;}
    this.mapStyleLoaded = e.isSourceLoaded; this.checkLoading();
    this.logger.log('mapOnSourceData -> '+this.mapStyleLoaded);
  }

  private mapOnDoubleClick=(e:any):void=>{
    this.map.setBearing(0);
    this.map.setPitch(0);
    this.map.fitBounds(this.mapBounds,{padding: this.PADDING});
  }

  private mapOnMouseMove=(e:any):void=>{
    if(this.mobile===true){ return; }
    if(this.mouseIsDown===true){ return; }

    const features:Array<any> = this.map.queryRenderedFeatures(e.point);
    if(features[0]){
      this.showPop(features[0].properties.code, features[0].properties.name,features[0].properties.name_en , e.point.x,e.point.y);
    }else{
      this.hidePop();
    }
  }

  private layerOnMouseOver=(e:any):void=>{
    if(this.mobile===true){return;}
  }
  private layerOnMouseOut=(e:any):void=>{
    if(this.mobile===true){return;}
    this.hidePop();
  }

  private onPickingDataRequestAnswer=(picking:boolean):void=>{
    if(picking===true){return;}
    this.logger.log('MAP-BOX - onPickingDataRequestAnswer');
    const e:any =  this.mapClickCoords;
    this.popService.hide();
    const features: Array<any> = this.map.queryRenderedFeatures(e.point);

    if(features[0]) {
        this.showPop(features[0].properties.code, features[0].properties.name, features[0].properties.name_en, e.point.x, e.point.y);
    }
  }
  private mapOnClick=(e:any):void=>{
    if(this.mobile===true){
      this.mapClickCoords = e;
      this.popService.checkIfExistPickingData({x:e.point.x, y:e.point.y});
    }
  }
  private mapOnMouseOut=(e:any):void=>{
    if(this.mobile===true){return;}
    this.hidePop();
  }
  private mapOnMouseDown=(e:any):void=>{
    if(this.mobile===true){ return;}
    this.mouseIsDown = true;
    document.addEventListener('mousemove', this.onDocumentMouseMove);
  }

  private mapOnMouseUp=(e:any):void=>{
    if(this.mobile===true){return;}
    this.mouseIsDown = false;
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
  }
  private mapOnWheel=(e:any):void=>{
    this.map.scrollZoom.enable();
  }
  private mapOnZoomEnd=(e:any):void=>{
    this.ZOOM_IN_ENABLED = parseFloat(this.map.getZoom().toFixed(2)+'')<this.MAX_ZOOM;
    this.ZOOM_OUT_ENABLED = parseFloat(this.map.getZoom().toFixed(2)+'')>this.MIN_ZOOM;
  }
  private mapOnZoom=(e:any):void=>{
    if(this.mobile){
      this.updateMobilePopupPosition();
    }
    this.updateCentroidPositions();
  }
  private mapOnMoveStart=(e:any):void=>{
    if(this.mobile){
      this.updateMobilePopupPosition();
    }
  }
  private mapOnMoveEnd=(e:any):void=>{
    if(this.mobile){
      this.updateMobilePopupPosition();
    }
  }
  private mapOnMove=(e:any):void=>{
    if(this.mobile){
      this.updateMobilePopupPosition();
    }
    this.updateCentroidPositions();
  }

  private onWindowScroll=():void=>{
    if(this.mobile===true){
      this.hidePop();
    }
  }


  public getColorByPercentage=(value:number):string=>{
    let color = this.backgroundService.clusters.getColorByValue(value);
    //let new_color = Utils.hexToGrayscale(color);

    this.logger.log('*******************');
    this.logger.log('MAP-BOX - getColorByPercentage');
    this.logger.log('*******************');
    this.logger.dir(this.backgroundService.clusters);
    this.logger.log('value:'+value);
    this.logger.log('color:'+color);
    //this.logger.log('new_color:'+new_color);
    this.logger.log('*******************');

    return color;
  }


  private resizeContainer=():void=>{
    if(!this.map){ return;}
      this.map.resize();
      this.map.fitBounds(this.mapBounds,{padding: this.PADDING});
      this.MIN_ZOOM = parseFloat(this.map.getZoom().toFixed(2)+'');
      this.updateCentroidPositions();
  }


  private onCloseLayers=():void=>{
    this.layersOpen = false;
  }
  private onLayersChange=(id:string):void=>{
    this.model.MAP_POP_STYLE = id;
    this.backgroundLight = this.model.MAP_POP_STYLE!== 'map_dark';
    this.generateMapStyle();
    this.mapStyleLoaded = false; this.checkLoading();
    this.map.setStyle(this.tileStyle);
  }
  private onCloseLegend=():void=>{
    this.dom.legendIsVisible = false;
    this.dom.update();
  }
  private showPop=(code:string,name_lv:string,name_en:string, x:number,y:number):void=>{
    if(this.popService.type!==1){
     return;
    }
    this.createMapPop(code, x,y);
  }

  private createMapPop(code:string, x:number,y:number):void{
    if(this.popService.voSimple===null || this.popService.voSimple.code!==code) {
      const vo:PopSimpleVO = this.popService.createPopSimpleVO(code);
      const rect = this.mapCanvasElement.getBoundingClientRect();
      if(!rect){ return;}
      this.popService.show(vo,rect.left + x,rect.top + y);
    }else{
      const rect = this.mapCanvasElement.getBoundingClientRect();
      if(!rect){ return;}
      this.popService.positionUpdate({x:rect.left + x,y:rect.top + y});
    }
  }

  private positionPop(x:number,y:number):void{
    // if(this.popService.type!==1){ return;}
    const rect = this.mapCanvasElement.getBoundingClientRect();
    if(!rect){ return;}
    this.popService.positionUpdate({x:rect.left + x,y:rect.top + y});
  }
  private hidePop=():void=>{
    if(this.popService.type!==1){ return; }
    this.popService.hide();
  }
  private checkLoading=():void=>{
    this.logger.log('*****************');
    this.logger.log('checkLoading');
    this.logger.log('*****************');

    this.logger.log('mapIsInitialized:'+this.mapIsInitialized);
    this.logger.log('mapStyleLoaded:'+this.mapStyleLoaded);
    this.logger.log('*****************');

    this.reloading = (this.mapStyleLoaded == true && this.mapIsInitialized == true)?false:true;

    (this.loaderContainer.element.nativeElement as HTMLElement).style.display=this.reloading===true?'block':'none';
  }


  private onDocumentMouseMove=(evt:any):void=>{
    if(this.mouseIsDown===false){
      return;
    }
    const rect = this.mapArea.getBoundingClientRect();
    const x:number =  (evt.clientX) - rect.left;
    const y:number =  (evt.clientY) - rect.top;
    this.positionPop(x,y);
  }

  @HostListener('window:resize', ['$event'])
  onHostResize(event:Event){
    this.resizeContainer();
  }

  @HostListener('window:orientationchange', ['$event'])
  onHostOrientationChange(event:Event){
    this.resizeContainer();
  }


  public onSettingsClick=(value:boolean):void=>{
    this.onSettingsChange.emit(value);
  }
  public onFullscreenClick=(value:boolean):void=>{
    this.onFullScreenChange.emit(value);
  }
  public onLegendClick=(value:boolean):void=>{
    this.onLegendChange.emit(value);
  }
  public onZoomClick=(dir:number):void=>{
    if(dir===1){
      this.map.zoomIn({animate:true,duration:1.8,easing: function (t) { return t; }});
    }else{
      this.map.zoomOut({animate:true,duration:1.8,easing: function (t) { return t; }});
    }
  }

}
