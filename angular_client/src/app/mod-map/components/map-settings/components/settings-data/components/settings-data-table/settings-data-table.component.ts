import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {RouteVO} from '../../../../../../../model/vo/RouteVO';
import {ModelService} from '../../../../../../../model/model.service';
import {DataTableVO} from '../../../../../../../model/vo/DataTableVO';

@Component({
  selector: 'app-settings-data-table',
  templateUrl: './settings-data-table.component.html',
  styleUrls: ['./settings-data-table.component.scss']
})
export class SettingsDataTableComponent implements OnInit,OnDestroy {

  public lang:string;
  public data:Array<DataTableVO>=[];
  public roundValues:boolean = false;

  private route:RouteVO;
  private initialized:boolean = false;
  private onModelReadyListener:any;
  private onLanguageUpdateListener:any;
  private onSettingsChangeListener:any;
  private onDataUpdateListener:any;


  constructor(private model:ModelService) { }


  ngOnDestroy():void{
    this.onModelReadyListener.unsubscribe();
    this.onLanguageUpdateListener.unsubscribe();
    this.onSettingsChangeListener.unsubscribe();
    this.onDataUpdateListener.unsubscribe();
  }
  ngOnInit() {
    this.route = this.model.getRoute();
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    this.onSettingsChangeListener = this.model.settings.onServiceChange.subscribe(this.onSettingsChange);
    this.onDataUpdateListener = this.model.dataService.onDataUpdated.subscribe(this.onDataUpdate);

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
    this.updateDataLanguage();
  }
  private onSettingsChange=():void=>{
    if(this.initialized===false){return;}
    this.lang = this.model.route.lang;
    if(this.route.isEqual(this.model.getRoute())===false){
      this.route = this.model.getRoute();
      this.roundValues = this.route.M2!=='e'?true:false;
      this.load();
    }
  }
  initialize():void {
    if(this.initialized===true){return;}
    this.route = this.model.getRoute();
    this.roundValues = this.route.M2!=='e'?true:false;
    this.lang = this.route.lang;
    this.load();
    this.initialized = true;
  }
  private updateDataLanguage():void{
    if(this.data.length>0){
      this.data.forEach((item:DataTableVO)=>{
        item.title.lang = this.lang;
      });
    }
  }
  private load():void{
    this.model.dataService.loadDataList(this.route);
  }
  private onDataUpdate=():void=>{
    this.data = this.model.dataService.data;
    this.model.resize();
  }

}
