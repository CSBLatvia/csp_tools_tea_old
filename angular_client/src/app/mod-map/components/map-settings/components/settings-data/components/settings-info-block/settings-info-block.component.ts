import {Component, OnDestroy, OnInit} from '@angular/core';
import {ModelService} from '../../../../../../../model/model.service';
import {RouteVO} from '../../../../../../../model/vo/RouteVO';
import {TranslationVO} from '../../../../../../../model/vo/TranslationVO';
import {PopTextDebugVO} from "../../../../../pop-ups/vos/PopTextDebugVO";


@Component({
  selector: 'app-settings-info-block',
  templateUrl: './settings-info-block.component.html',
  styleUrls: ['./settings-info-block.component.scss']
})
export class SettingsInfoBlockComponent implements OnInit,OnDestroy {

  public lang:string;
  public route:RouteVO;
  private initialized:boolean = false;
  private onModelReadyListener:any;
  private onLanguageUpdateListener:any;
  private onSettingsChangeListener:any;
  private onDataUpdateListener:any;


  public selectedRegion:TranslationVO;
  public textHTMLValue:string='';
  public info:PopTextDebugVO = null;


  constructor(private model:ModelService) { }

  ngOnDestroy():void{
    this.onModelReadyListener.unsubscribe();
    this.onLanguageUpdateListener.unsubscribe();
    this.onSettingsChangeListener.unsubscribe();
    this.onDataUpdateListener.unsubscribe();

  }
  ngOnInit() {
    this.route = this.model.getRoute();
    this.lang = this.route.lang;
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    this.onSettingsChangeListener = this.model.settings.onServiceChange.subscribe(this.onSettingsChange);
    this.onDataUpdateListener = this.model.infoService.onDataUpdated.subscribe(this.onDataUpdate);

    if(this.model.READY===true){
      this.initialize();
    }
  }
  private onModelReady=():void=>{
    this.initialize();
  }
  private onLanguageUpdate=():void=>{
    this.lang = this.model.route.lang;
    if(this.initialized===false){return;}
    this.updateLocalizations();
  }
  private onSettingsChange=():void=>{
    if(this.initialized===false){return;}
    this.route = this.model.getRoute();
    this.lang = this.route.lang;
    this.load();
  }
  initialize():void {
    if(this.initialized===true){return;}
    this.route = this.model.getRoute();
    this.lang = this.route.lang;
    this.load();
    this.initialized = true;
  }
  private updateLocalizations=():void=>{
    this.route = this.model.getRoute();
    this.lang = this.route.lang;
    this.load();
  }

  private load():void{
    this.model.infoService.reset();
    this.info = null;
    this.textHTMLValue = '';

    if(this.route.T2!=='all'){
      this.model.infoService.loadRegionName(this.route);
    }
    this.model.infoService.loadData(this.route,true);
  }
  private onDataUpdate=():void=>{
    if(this.route.T2==='all'){
      this.selectedRegion = this.model.translations.item('territories-all');
      this.selectedRegion.lang = this.lang;
    }else{
      this.selectedRegion = this.model.infoService.selectedRegion;
      if(this.selectedRegion!==null){
        this.selectedRegion.lang = this.lang;
      }
    }
    if(this.model.infoService.textHTMLValue!==''){
      this.textHTMLValue = this.model.infoService.textHTMLValue;
      this.info = this.model.infoService.info;
    }

  }

}
