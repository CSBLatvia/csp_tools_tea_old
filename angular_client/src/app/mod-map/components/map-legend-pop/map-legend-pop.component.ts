import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {ClusterVO} from "../../../model/vo/ClusterVO";
import {LoggerService} from "../../../model/log/logger.service";
import {TranslationVO} from "../../../model/vo/TranslationVO";
import {TitlesVO} from "../../../model/vo/TitlesVO";
import {ModelService} from "../../../model/model.service";

@Component({
  selector: 'map-legend-pop',
  templateUrl: './map-legend-pop.component.html',
  styleUrls: ['./map-legend-pop.component.scss']
})
export class MapLegendPopComponent implements OnInit,OnDestroy {


  @Input() mobile:boolean = false;
  @Input() visible:boolean = false;
  @Input() lang:string;
  @Input() onClose:any;
  public initialized:boolean = false;

  public t1:string='3';
  public t2:string='none';

  public m1:string='e'; // w,h
  public m2:string='e';// e, vp, va
  public m3:string='none';

  public clusters:Array<ClusterVO> = [];
  public impossibleData:boolean = false;
  public zerroData:boolean = false;

  public isEmpty:boolean = true;

  private onModelReadyListener:any;
  private onRouteChangeListener:any;
  private onLanguageUpdateListener:any;
  private onTitlesUpdateListener:any;
  private onDataUpdateListener:any;

  public isVisible_list:boolean = false;
  public isVisible_circles:boolean = true;
  public dataIsNotComplete:boolean = false;


  // legend-choro-title-e
  // legend-choro-title-av
  // legend-choro-title-vp

  // legend-choro-subtitle-e
  // legend-choro-subtitle-av
  // legend-choro-subtitle-vp

  public titleColorsVO:TranslationVO;
  public subtitleColorsVO:TranslationVO;

  public titleCirclesVO:TranslationVO;
  public titleListVO:TranslationVO;


  private legendContainer:HTMLElement;
  public ww:number=0;
  public wwMin:number=720;
  public horizontal:boolean = true;



  public titlesVO:TitlesVO;




  constructor(private model: ModelService, private logger:LoggerService) {
    this.logger.enabled = false;
  }
  private resizeContainer():void{
    if(this.legendContainer){
      this.horizontal = this.legendContainer.offsetWidth>this.wwMin;
    }
  }
  ngOnInit() {

    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onRouteChangeListener = this.model.onRouteUpdate.subscribe(this.onRouteUpdate);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    this.onTitlesUpdateListener = this.model.titlesService.onServiceChange.subscribe(this.onTitlesUpdate);
    this.onDataUpdateListener = this.model.mapLegendService.onDataUpdate.subscribe(this.onDataUpdate);

    this.legendContainer = document.getElementById('legendContainer') as HTMLElement;

    if(this.model.READY===true){
      this.initialize();
    }
  }
  ngOnDestroy(): void {

    this.onModelReadyListener.unsubscribe();
    this.onRouteChangeListener.unsubscribe();
    this.onLanguageUpdateListener.unsubscribe();
    this.onTitlesUpdateListener.unsubscribe();
    this.onDataUpdateListener.unsubscribe();
  }
  public onDataUpdate=():void=>{
    this.dataIsNotComplete = this.model.dataIsNotComplete;
  }
  public update(clusters:Array<ClusterVO>,impossibleData:boolean,zerroData:boolean):void{
    this.clusters = [...clusters].reverse();
    this.isEmpty = this.clusters.length===0;
    this.impossibleData = impossibleData;
    this.zerroData = zerroData;
  }

  initialize():void{
    if(this.initialized===true){return;}
    this.m1 = this.model.route.M1;
    this.m2 = this.model.route.M2;
    this.m3 = this.model.route.M3;
    this.t1 = this.model.route.T1;
    this.t2 = this.model.route.T2;
    this.initialized = true;

    this.checkVisibility();
    this.updateLocalizations();

    this.isEmpty = this.clusters.length===0;
    this.dataIsNotComplete = this.model.dataIsNotComplete;
    this.resizeContainer();

  }
  private checkVisibility():void{
    this.isVisible_list = this.m3!=='none';
  }
  private updateLocalizations():void{
    switch (this.m2) {
      case 'e':
        this.titleColorsVO = this.model.translations.item('legend-choro-title-e');
        this.subtitleColorsVO = this.model.translations.item('legend-choro-subtitle-e');
        break;
      case 'av':
        this.titleColorsVO = this.model.translations.item('legend-choro-title-av');
        this.subtitleColorsVO = this.model.translations.item('legend-choro-subtitle-av');
        break;
      case 'vp':
        this.titleColorsVO = this.model.translations.item('legend-choro-title-vp');
        this.subtitleColorsVO = this.model.translations.item('legend-choro-subtitle-vp');
        break;
    }
    this.titleCirclesVO = this.model.translations.item('legend-circles-title');

    switch (this.m3) {
      case 'i':
        this.titleListVO = this.model.translations.item('legend-info-title-i');
        break;
      case 'p':
        this.titleListVO = this.model.translations.item('legend-info-title-p');
        break;
      case 's':
        this.titleListVO = this.model.translations.item('legend-info-title-s');
        break;
    }
  }
  private onModelReady=():void=>{
    if(this.initialized===true){return;}
    this.initialize();
  }
  private onLanguageUpdate=():void=>{
    if(this.initialized===false){return;}
    this.lang = this.model.route.lang;
    this.updateLocalizations();
  }
  private onRouteUpdate=():void=>{
    if(this.initialized===false){return;}
    if(this.t1===this.model.route.T1 && this.t2===this.model.route.T2 && this.m2===this.model.route.M2 && this.m3===this.model.route.M3 && this.m1===this.model.route.M1){ return;}
    this.m1 = this.model.route.M1;
    this.m2 = this.model.route.M2;
    this.m3 = this.model.route.M3;
    this.t1 = this.model.route.T1;
    this.t2 = this.model.route.T2;

    this.checkVisibility();
    this.updateLocalizations();
  }
  private onTitlesUpdate=():void=>{
    this.titlesVO = this.model.titlesService.vo;
  }
  public onCloseClick():void{
    this.visible = false;
    this.onClose();
  }
  @HostListener('window:resize', ['$event'])
  onHostResize(event:Event){
    this.resizeContainer();
  }

  @HostListener('window:orientationchange', ['$event'])
  onHostOrientationChange(event:Event){
    this.resizeContainer();
  }


}
