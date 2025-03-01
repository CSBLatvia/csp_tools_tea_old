import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {TitlesVO} from "../../../../../model/vo/TitlesVO";
import {TranslationVO} from "../../../../../model/vo/TranslationVO";
import {ModelService} from "../../../../../model/model.service";
import {Utils} from "../../../../../model/inc/Utils";

@Component({
  selector: 'app-legend-sizes',
  templateUrl: './legend-sizes.component.html',
  styleUrls: ['./legend-sizes.component.scss']
})
export class LegendSizesComponent implements OnInit,OnDestroy,OnChanges {

  @Input() lang:string;
  @Input() titlesVO:TitlesVO;
  @Input() dataIsNotComplete:boolean = false;

  private onDataUpdateListener:any;
  private onModelReadyListener:any;
  private onSizesInfoUpdateListener:any;
  public initialized:boolean = false;

  private minTitleVO:TranslationVO;
  private areaTitleVO:TranslationVO;
  private areaTitleEmptyVO:TranslationVO;

  public valueTooSmallStartsFrom:number=-1;
  public valueMaxOnScreen:number=-1;
  public areaMaxOnScreen:number=-1;


  public minTitle:string;
  public areaTitle:string;
  private pixels:number = 100;
  private pixelsArea:number=-1;
  public noDataTitle:TranslationVO;

  constructor(private model:ModelService) {}
  ngOnDestroy(): void {
    this.onDataUpdateListener.unsubscribe();
    this.onModelReadyListener.unsubscribe();
    this.onSizesInfoUpdateListener.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['lang']){
      this.updateLocalizations();
    }
  }
  ngOnInit() {
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onDataUpdateListener = this.model.mapLegendService.onDataUpdate.subscribe(this.onDataUpdate);
    this.onSizesInfoUpdateListener = this.model.mapLegendService.onSizesInfoUpdate.subscribe(this.onSizesInfoUpdate);

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
    this.initialized = true;
    this.onDataUpdate();
    this.onSizesInfoUpdate();
  }
  public onDataUpdate=():void=>{
    // this.logger.log('LEGEND-SIZES - onDataUpdate');
    const M2:string = this.model.getRoute().M2;
    this.minTitleVO = this.model.translations.item('legend-sizes-circle-min-'+M2);
    this.areaTitleVO = this.model.translations.item('legend-sizes-circle-area-'+M2);
    this.areaTitleEmptyVO = this.model.translations.item('legend-sizes-circle-area-no-data');
    this.updateSizeTexts();
  }
  public onSizesInfoUpdate=():void=>{
    this.dataIsNotComplete = this.model.dataIsNotComplete;
    this.valueTooSmallStartsFrom = this.model.mapLegendService.valueTooSmallStartsFrom;
    this.valueMaxOnScreen = this.model.mapLegendService.valueMaxOnScreen;
    this.areaMaxOnScreen = this.model.mapLegendService.areaMaxOnScreen;

    if(this.areaMaxOnScreen!==-1 && this.valueMaxOnScreen!==-1){
      this.pixelsArea = this.pixels*this.valueMaxOnScreen/this.areaMaxOnScreen;
    }else{
      this.pixelsArea = -1;
    }

    this.updateSizeTexts();
  }
  private updateLocalizations():void{
    if(this.initialized===false){return;}
    this.lang = this.model.route.lang;
    this.updateSizeTexts();
  }
  private updateSizeTexts():void{
    this.noDataTitle = this.model.translations.item('legend-no-data-info');
    this.noDataTitle.lang = this.lang;

    if(this.valueTooSmallStartsFrom!==-1){
      this.minTitle = this.lang==='lv'?this.minTitleVO.name_lv.replace('[value]',Utils.prettyNumber(this.valueTooSmallStartsFrom,this.lang)):this.minTitleVO.name_en.replace('[value]',Utils.prettyNumber(this.valueTooSmallStartsFrom,this.lang));
    }else{
      this.minTitle='';
    }

    if(this.pixelsArea!==-1){
      this.areaTitle = this.lang==='lv'?this.areaTitleVO.name_lv.replace('[area]',this.pixels+'').replace('[value]',Utils.prettyNumber(this.pixelsArea,this.lang)):this.areaTitleVO.name_en.replace('[area]',this.pixels+'').replace('[value]',Utils.prettyNumber(this.pixelsArea,this.lang));
    }else{
      this.areaTitle = this.lang==='lv'?this.areaTitleEmptyVO.name_lv.replace('[area]',this.pixels+''):this.areaTitleEmptyVO.name_en.replace('[area]',this.pixels+'');
    }

  }

}
