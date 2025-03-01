import {
  AfterViewInit,
  Component, EventEmitter,
  Input, LOCALE_ID, OnChanges,
  OnDestroy,
  OnInit, Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';


import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en-GB';
import {RouteVO} from "../../../model/vo/RouteVO";
import {TranslationVO} from "../../../model/vo/TranslationVO";
import {DomElementsInfo} from "../../../model/vo/DomElementsInfo";
import {ModelService} from "../../../model/model.service";
import {LoggerService} from "../../../model/log/logger.service";
import {SettingsService} from "../../services/settings/settings.service";
import {ControlValueVO} from "../../../ui-controls/vos/ControlValueVO";

registerLocaleData(localeEn);

@Component({
  selector: 'app-map-settings',
  templateUrl: './map-settings.component.html',
  styleUrls: ['./map-settings.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'en-GB' }],
})
export class MapSettingsComponent implements OnInit,AfterViewInit,OnDestroy,OnChanges {


  @Input() route:RouteVO;
  @Input() visible:boolean = true;
  @Input() mobile:boolean;
  @Input() lang:string;

  public initialized:boolean = false;
  private htmlElementsReady:boolean = false;
  private onDomUpdateListener:any;

  @ViewChild("scrollableArea", { read: ViewContainerRef }) scrollableArea: ViewContainerRef;
  @ViewChild("settingsHeader", { read: ViewContainerRef }) settingsHeader: ViewContainerRef;
  @ViewChild("settings", { read: ViewContainerRef }) settings: ViewContainerRef;

  private interval:number=-1;

  @Output() onSettingsChange:EventEmitter<any> = new EventEmitter<any>();

  public settingsButtonCloseVO:TranslationVO;
  public titleVO:TranslationVO = new TranslationVO('settings-title','settings-title','settings-title');
  public descriptionVO:TranslationVO = new TranslationVO('settings-description','settings-description','settings-description');
  ///////////////////////////////////////////
  ///////////////////////////////////////////
  ///////////////////////////////
  // M1 - place - work, home
  // M2 - added value, number-of-employees, value-produced-by-employees
  // M3 - industry, profesion, sector
  /*
    - mprofs:       https://tools.csb.gov.lv/tea/api?db=menu-profs
    - mnaces:       https://tools.csb.gov.lv/tea/api?db=menu-naces
    - msectors:     https://tools.csb.gov.lv/tea/api?db=menu-sector
    - territories:  https://tools.csb.gov.lv/tea/api?db=menu-territories&level=4
    - years:        https://tools.csb.gov.lv/tea/api?db=menu-years
  */

  // M4 - chosen M3
  // T1 - territory one
  // T2 - territory two
  ///////////////////////////////
  public  m1:string = '';
  public  m1_label:TranslationVO;
  public  m1_data:Array<ControlValueVO>=[];

  public  m2:string = '';
  public  m2_label:TranslationVO;
  public  m2_data:Array<ControlValueVO>=[];

  public  m3:string = '';
  public  m3_label:TranslationVO;
  public  m3_data:Array<ControlValueVO>=[];

  public  m4:string = '';
  public  m4_label:TranslationVO;
  public  m4_data:Array<ControlValueVO>=[];
  public  m4_loading:boolean = false;
  public  m4_disabled:boolean = true;


  public  y:string = '';
  public  y_label:TranslationVO;
  public  y_data:Array<ControlValueVO>=[];
  public  y_loading:boolean = false;
  public  year_disabled:boolean = true;


  public  t1:string = '';
  public  t2:string = '';
  public  t1_label:TranslationVO;
  public  t2_search_label:TranslationVO;
  public  t1_data:Array<ControlValueVO>=[];
  public  t2_data:Array<ControlValueVO>=[];
  public  t2_loading:boolean = false;

  private onServiceInitializedListener:any;
  private onServiceChangeListener:any;
  private onModelReadyListener:any;







  constructor(private model: ModelService, public dom:DomElementsInfo, private logger:LoggerService) {
    this.logger.enabled = false;
  }


  ngOnInit(): void {

    this.onDomUpdateListener = this.dom.onUpdate.subscribe(this.onDomElementsUpdate);
    this.onServiceInitializedListener = this.model.settings.onServiceInitialized.subscribe(this.onServiceInitialized);
    this.onServiceChangeListener = this.model.settings.onServiceChange.subscribe(this.onServiceChange);
    this.onModelReadyListener =  this.model.onModelReady.subscribe(this.onModelReady);

    if(this.model.READY===true){
      this.initialize();
    }
  }
  ngAfterViewInit() {
    if(this.model.READY===true){
      this.initialize();
    }
    this.interval = <any>setInterval(this.checkIfValuesReady,100);
  }
  private checkIfValuesReady=():void=>{
      if(this.model.dom.footer.height==0 && this.model.dom.header.height==0) {
        return;
      }
      clearInterval(this.interval);
      this.htmlElementsReady = true;
      this.onResize();
  }

  ngOnChanges(changes: SimpleChanges):void {
    this.route = this.model.getRoute();
    this.lang = this.route.lang;


    if( changes['route'] && this.route!==undefined ){
      this.updateTranslationVOS();
    }
    if(changes['visible'] && this.visible == true){
      this.onResize();
    }
  }
  private updateTranslationVOS():void{
    if(!this.initialized){ return; }

    this.titleVO = this.model.translations.item('tool-landing-title');
    this.descriptionVO = this.model.translations.item('tool-landing-desc').clone();
    this.descriptionVO.replaceString('[year]',this.route.year+'',this.route.year+'');

    this.titleVO.lang = this.lang;
    this.descriptionVO.lang = this.lang;

    this.settingsButtonCloseVO = this.model.translations.item('settings-button-close-mobile');

    this.m1_label = this.model.settings.m1_label;
    this.m2_label = this.model.settings.m2_label;
    this.m3_label = this.model.settings.m3_label;
    this.m4_label = this.model.settings.m4_label;
    this.t1_label = this.model.settings.t1_label;
    this.t2_search_label = this.model.settings.t2_search_label;

    this.y_label = this.model.settings.y_label;


    this.onResize();
  }
  private onModelReady=():void=>{
    this.initialize();
  }
  ngOnDestroy() {
    this.onDomUpdateListener.unsubscribe();
    this.onServiceInitializedListener.unsubscribe();
    this.onServiceChangeListener.unsubscribe();
  }

  initialize():void {
    if (this.initialized == true) { return; }
    this.route = this.model.getRoute();
    this.lang = this.route.lang;
    this.initialized = true;
    this.updateTranslationVOS();
    this.onServiceChange();
  }



  private onDomElementsUpdate=():void=> {
    this.onResize();
  }
  private onResize=():void=> {
    if(this.initialized==false || this.htmlElementsReady==false){ return; }

    this.dom.mapMenu.width = this.settings.element.nativeElement.offsetWidth;
    this.mobile = this.dom.isMobile;

    let newH:number = this.dom.hh - this.dom.header.height - this.settingsHeader.element.nativeElement.offsetHeight - this.dom.footer.height;
    this.scrollableArea.element.nativeElement.style.height = newH+'px';
    this.dom.mapMenu.update();
  }

  public onSettingsClose=():void=>{
    this.visible = false;
    this.onSettingsChange.emit(false);
    this.onResize();
  }


  private onServiceInitialized=():void=>{
    this.initialize();
  }
  private onServiceChange=():void=>{

    this.logger.log('********************************');
    this.logger.log('map-settings - onServiceChange()');
    this.logger.log('********************************');

    this.m1 = this.model.settings.m1;
    this.m2 = this.model.settings.m2;
    this.t1 = this.model.settings.t1;
    this.t2 = this.model.settings.t2;
    this.m3 = this.model.settings.m3;
    this.m4 = this.model.settings.m4;

    this.m1_data = this.model.settings.m1_data;
    this.m2_data = this.model.settings.m2_data;
    this.m3_data = this.model.settings.m3_data;
    this.m4_data = this.model.settings.m4_data;

    /////////////////
    this.t1_data = this.model.settings.t1_data;
    this.t2_data = this.model.settings.t2_data;
    this.t2_loading = this.model.settings.t2_loading;
    this.m4_loading = this.model.settings.m4_loading;
    this.m4_disabled = this.m3==='none';

    this.y_data = this.model.settings.y_data;
    this.y_loading = this.model.settings.y_loading;
    this.y = this.model.settings.y;
  }

  ///////////////////////////////////////////////////
  // html
  public onChangeM1=(vo:ControlValueVO):void=>{
    this.model.settings.changeM1(vo);
  }
  public onChangeM2=(vo:ControlValueVO):void=>{
    this.model.settings.changeM2(vo);
  }
  public onChangeM3=(vo:ControlValueVO):void=>{
    this.model.settings.changeM3(vo);
  }
  public onChangeM4=(vo:ControlValueVO):void=>{
    this.model.settings.changeM4(vo);
  }
  public onChangeT1=(vo:ControlValueVO):void=>{
    this.model.settings.changeT1(vo);
  }
  public onChangeT2=(vo:ControlValueVO):void=>{
    this.model.settings.changeT2(vo);
  }
  public onChangeYear=(vo:ControlValueVO):void=>{
    this.model.settings.changeYear(vo);
  }
  ///////////////////////////////////////////////////

}
