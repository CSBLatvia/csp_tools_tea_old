import {EventEmitter, Injectable} from '@angular/core';
import {ModelService} from '../../../model/model.service';
import {TranslationVO} from '../../../model/vo/TranslationVO';
import {ControlValueVO} from '../../../ui-controls/vos/ControlValueVO';
import {RouteVO} from '../../../model/vo/RouteVO';

@Injectable({
  providedIn: 'root'
})
export class MapLegendService {

  private model:ModelService;
  private serviceURL:string = '';
  private onModelReadyListener:any;
  public initialized:boolean = false;
  //////////////////////////////////


  private route:RouteVO;

  public titleClustersVO:TranslationVO;
  public subtitleClustersVO:TranslationVO;

  public titleSizesVO:TranslationVO;
  public subtitleSizesVO:TranslationVO;

  public titleCirclesVO:TranslationVO;
  public subtitleCirclesVO:TranslationVO;

  public titleListVO:TranslationVO;
  public subtitleListVO:TranslationVO;


  public listData:Array<ControlValueVO>=[];

  private onSettingsChangeListener:any;
  public onDataUpdate:EventEmitter<any> = new EventEmitter<any>();
  public onSizesInfoUpdate:EventEmitter<any> = new EventEmitter<any>();

  //////////////////////////////////
  public valueTooSmallStartsFrom:number=-1;
  public valueMaxOnScreen:number=-1;
  public areaMaxOnScreen:number=-1;



  constructor() {}
  public initialize(model:ModelService):void{
    this.model = model;
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    if(this.model.READY===true){
      this.initializeService();
    }
  }
  private initializeService():void {
    if(this.initialized===true){return;}
    this.initialized = true;
    this.serviceURL = this.model.config.serviceURL;

    this.route = this.model.getRoute();
    this.onSettingsChangeListener = this.model.settings.onServiceChange.subscribe(this.onSettingsChange);
    this.getLocalizations();
  }
  private onModelReady=():void=>{
    this.initializeService();
  }

  public destroy():void{
    this.onSettingsChangeListener.unsubscribe();
  }
  private onSettingsChange=():void=>{
    const route:RouteVO = this.model.getRoute();
    if(this.route.isEqual(route)===true){ return; }

    this.route = this.model.getRoute();
    this.listData = [];
    this.getLocalizations();
  }
  private getLocalizations():void{

    let titleSTR:string = 'legend-clusters-title-'+this.route.M1+'-'+this.route.M2;
    let subtitleSTR:string = 'legend-clusters-subtitle-'+this.route.M1+'-'+this.route.M2;

    this.titleClustersVO = this.model.translations.item(titleSTR);
    this.subtitleClustersVO = this.model.translations.item(subtitleSTR);


    titleSTR = 'legend-circles-title-'+this.route.M1+'-'+this.route.M2;
    subtitleSTR = 'legend-circles-subtitle-'+this.route.M1+'-'+this.route.M2;

    this.titleCirclesVO = this.model.translations.item(titleSTR);
    this.subtitleCirclesVO = this.model.translations.item(subtitleSTR);

    titleSTR = 'legend-sizes-title-'+this.route.M1+'-'+this.route.M2;
    subtitleSTR = 'legend-sizes-subtitle-'+this.route.M1+'-'+this.route.M2;

    this.titleSizesVO = this.model.translations.item(titleSTR);
    this.subtitleSizesVO = this.model.translations.item(subtitleSTR);


    if(this.route.M3!=='none') {
      titleSTR = 'legend-list-title-' + this.route.M3;
      subtitleSTR = 'legend-list-subtitle-' + this.route.M3;

      this.titleListVO = this.model.translations.item(titleSTR);
      this.subtitleListVO = this.model.translations.item(subtitleSTR);

    }else{
      this.titleListVO = null;
      this.subtitleListVO = null;
    }
    this.onDataUpdate.emit('update');

  }

  public updateLegendSizes(valueTooSmallStartsFrom:number=-1,valueMaxOnScreen:number=-1,areaMaxOnScreen:number=-1){
    this.valueTooSmallStartsFrom = valueTooSmallStartsFrom;
    this.valueMaxOnScreen = valueMaxOnScreen;
    this.areaMaxOnScreen = areaMaxOnScreen;
    this.onSizesInfoUpdate.emit('update');
  }
  public updateLegendListData(listData:Array<ControlValueVO>):void{
      this.listData = listData;
      this.onDataUpdate.emit('update');
  }
}
