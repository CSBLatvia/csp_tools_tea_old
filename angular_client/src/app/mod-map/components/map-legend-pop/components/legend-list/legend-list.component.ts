import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {TitlesVO} from "../../../../../model/vo/TitlesVO";
import {ControlValueVO} from "../../../../../ui-controls/vos/ControlValueVO";
import {TranslationVO} from "../../../../../model/vo/TranslationVO";
import {ModelService} from "../../../../../model/model.service";

@Component({
  selector: 'app-legend-list',
  templateUrl: './legend-list.component.html',
  styleUrls: ['./legend-list.component.scss']
})
export class LegendListComponent implements OnInit,OnDestroy,OnChanges {

  @Input() horizontal:boolean = true;
  @Input() lang:string;
  @Input() titlesVO:TitlesVO;
  @Input() dataIsNotComplete:boolean = false;

  public data:Array<ControlValueVO>=[];
  private onDataUpdateListener:any;
  private onModelReadyListener:any;
  public initialized:boolean = false;
  public noDataTitle:TranslationVO;


  constructor(private model:ModelService) {}
  ngOnDestroy(): void {
    this.onDataUpdateListener.unsubscribe();
    this.onModelReadyListener.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['lang']){
      this.updateLocalizations();
    }
  }

  ngOnInit() {
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onDataUpdateListener = this.model.mapLegendService.onDataUpdate.subscribe(this.onDataUpdate);

    if(this.model.READY===true && this.initialized===false){
      this.initialize();
    }
  }
  private onModelReady=():void=>{
    if(this.initialized===true){return;}
    this.initialize();
  }
  initialize():void{
    if(this.initialized===true){return;}
    this.lang = this.model.route.lang;
    this.initialized = true;
    this.onDataUpdate();
  }

  public onDataUpdate=():void=>{
    this.data = [...this.model.mapLegendService.listData];
    this.dataIsNotComplete = (this.data==null || this.data.length===0)?true:false;
    this.updateLocalizations();
  }
  private updateLocalizations():void{
    if(this.initialized===false){return;}
    this.lang = this.model.route.lang;

    this.noDataTitle = this.model.translations.item('legend-no-data-info');
    this.noDataTitle.lang = this.lang;

    this.data.forEach((item:ControlValueVO)=>{
      item.name.lang = this.lang;
    });
  }
}
