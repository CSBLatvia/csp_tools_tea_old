import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {CentroidVO} from '../../vos/CentroidVO';
import {IMap} from '../map-mapbox/IMap';
import {RouteVO} from "../../../model/vo/RouteVO";
import {LoggerService} from "../../../model/log/logger.service";
import {MapCentroidsService} from "../../services/map-centroids/map-centroids.service";
import {ModelService} from "../../../model/model.service";

@Component({
  selector: 'app-viz-map',
  templateUrl: './viz-map.component.html',
  styleUrls: ['./viz-map.component.scss']
})
export class VizMapComponent implements OnInit,OnDestroy {


  @Input() mobile:boolean=false;
  public centroidData:Array<CentroidVO>=[];
  public MAP_SIZE:number=1;
  public strokeMin:number = 1;
  public strokeMax:number = 1;
  public radiusMin:number = 1;
  public radiusMax:number = 1;
  public dpi:number=-1;



  public visualization_type:number=1;         // 1-circles, 2-circles-region, 3-circles-sectors, 4-circles-sectors-region
  public initialized:boolean = false;


  public route:RouteVO;
  private onCentroidsMapPositionUpdateListener:any;
  private onRouteChangeListener:any;
  private onModelReadyListener:any;
  private onModelMaxValuesReadyListener:any;

  public lastEvent:string;
  ///////////////////////////////
  public ww:number = 1;
  public hh:number = 1;
  public wwR:number = 1;
  public hhR:number = 1;
  public resizeEvent:string = '';


  constructor(public centroidService:MapCentroidsService,public model:ModelService, private logger:LoggerService) {
    this.logger.enabled = false;
  }

  ngOnInit() {
    this.onCentroidsMapPositionUpdateListener = this.centroidService.onMapPositionUpdated.subscribe(this.onMapPositionUpdate);
    this.onRouteChangeListener = this.model.onRouteUpdate.subscribe(this.onRouteUpdate);
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onModelMaxValuesReadyListener = this.model.onMaxValuesReady.subscribe(this.onMaxValuesReady);

    this.route = this.model.getRoute();
    this.centroidData = this.centroidService.data;

    this.checkReady();
  }
  ngOnDestroy(): void {
    this.onCentroidsMapPositionUpdateListener.unsubscribe();
    this.onRouteChangeListener.unsubscribe();
    this.onModelReadyListener.unsubscribe();
    this.onModelMaxValuesReadyListener.unsubscribe();
  }
  private onMaxValuesReady=():void=>{
    if (this.initialized === true) {
      return;
    }
    this.checkReady();
  }
  private onModelReady=():void=>{
    if (this.initialized === true) {
      return;
    }
    this.checkReady();
  }
  initialize():void {
    if (this.initialized === true) { return; }
    this.strokeMin = 0;
    this.strokeMax = 0;
    this.radiusMin = 0;
    this.radiusMax = 0;


    this.dpi = this.model.DPI;
    this.visualization_type = this.model.VIZ;

    this.resizeContainer();
    this.initialized = true;
  }

  private onRouteUpdate=():void=>{
    this.route = this.model.getRoute();
    this.dpi = this.model.DPI;
    this.visualization_type = this.model.VIZ;
  }
  private onMapPositionUpdate=():void=>{
    this.centroidData = [...this.centroidService.data];
    this.MAP_SIZE = this.model.MAP_SIZE;
  }
  private checkReady():void{
    if(this.model.READY===true && this.initialized===false){
      this.initialize();
    }
  }



  private resizeContainer():void{
    this.dpi = this.model.DPI;
    this.ww = window.screen.width;
    this.hh = window.screen.height;

    this.wwR = this.ww*this.dpi;
    this.hhR = this.hh*this.dpi;

    this.resizeEvent = this.ww+'-'+this.hh;
  }

  @HostListener('window:resize', ['$event'])
  onHostResize=(event:Event):void=>{
    this.lastEvent = 'resize';
    this.resizeContainer();
  }

  @HostListener('window:orientationchange', ['$event'])
  onHostOrientationChange=(event:Event):void=>{
    this.lastEvent = 'orientationchange';
    this.resizeContainer();
  }
}
