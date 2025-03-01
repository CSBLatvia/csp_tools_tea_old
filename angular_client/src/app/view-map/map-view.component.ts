import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit, ViewChild
} from '@angular/core';
import {TranslationVO} from "../model/vo/TranslationVO";
import {RouteVO} from "../model/vo/RouteVO";
import {ModelService} from "../model/model.service";
import {DomElementsInfo} from "../model/vo/DomElementsInfo";

@Component({
  selector: 'map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {

  public mapTitle:TranslationVO;
  public route:RouteVO;
  public lang:string;
  public initialized:boolean = false;

  private onModelReadyListener:any;
  private onLanguageUpdateListener:any;
  private onRouteUpdateListener:any;

  private onDomUpdateListener:any;
  private onDomMapMenuUpdateListener:any;

  public mobile:boolean = false;


  constructor(public model: ModelService, public dom:DomElementsInfo) {}

  ngOnInit() {
    this.dom.mapMenu.visible = true;
    this.onModelReadyListener =  this.model.onModelReady.subscribe(this.onModelReady);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    this.onRouteUpdateListener = this.model.onRouteUpdate.subscribe(this.onRouteUpdate);

    this.onDomUpdateListener = this.dom.onUpdate.subscribe(this.onDomElementsUpdate);
    this.onDomMapMenuUpdateListener = this.dom.mapMenu.onUpdate.subscribe(this.onMapMenuUpdate);

    if(this.model.READY===true){
      this.initialize();
    }
    this.onResize();
  }
  ngAfterViewInit() {
    this.onResize();
  }

  ngOnDestroy() {
    this.onModelReadyListener.unsubscribe();
    this.onLanguageUpdateListener.unsubscribe();
    this.onRouteUpdateListener.unsubscribe();

    this.onDomUpdateListener.unsubscribe();
    this.onDomMapMenuUpdateListener.unsubscribe();
  }
  private onModelReady=():void=>{
    this.initialize();
  }
  initialize():void{
    if(this.initialized===true){return;}
    this.route = this.model.getRoute();
    this.lang = this.model.route.lang;
    this.onResize();
    this.initialized = true;
    this.onRouteUpdate();
  }
  private onLanguageUpdate=():void=>{
    if(this.initialized===false){return;}
    this.lang = this.model.route.lang;
  }
  private onRouteUpdate=():void=>{
    if(this.initialized===false){return;}
    this.route = this.model.getRoute();
    this.lang = this.model.route.lang;
  }

  public onSettingsChange=(value:boolean):void=>{
    this.dom.mapMenu.visible = value;
    this.dom.mapMenu.update();
    this.onResize();
  }
  private onDomElementsUpdate=():void=>{
    this.onResize();
  }
  private onMapMenuUpdate=():void=>{
    this.onResize();
  }
  private onResize=():void=> {
    this.mobile = this.dom.isMobile;
    this.resizeMapArea();
  }


  private resizeMapArea=():void=>{
    const mapArea:HTMLElement = document.getElementById('mapArea');
    const mapContainer:HTMLElement = document.getElementById('mapContainer');
    const footer:HTMLElement = document.getElementById('footer');

    if(mapArea==null || mapContainer==null){
      return;
    }

    // this.logger.log('RESIZE-MAP-AREA - mapSelectedButtonsArea');
    // this.logger.log(' - width'+this.dom.mapSelectedButtonsArea.width);
    // this.logger.log(' - height'+this.dom.mapSelectedButtonsArea.height);
    // this.logger.log(' - x'+this.dom.mapSelectedButtonsArea.x);
    // this.logger.log(' - y'+this.dom.mapSelectedButtonsArea.y);

    if(this.dom.mapIsFullScreen==false){
        mapArea.style.height = this.dom.hh - this.dom.footer.height - this.dom.header.height+'px';
        mapContainer.style.height = this.dom.hh - this.dom.footer.height - this.dom.header.height+'px';
        footer.style.display='block';
    }else{
        mapArea.style.height = this.dom.hh+'px';
        mapArea.style.width = '100%';
        mapContainer.style.height = this.dom.hh+'px';
        footer.style.display='none';
    }


  }

}
