import {EventEmitter, Inject, Injectable} from '@angular/core';
import {HttpClient, HttpUrlEncodingCodec} from '@angular/common/http';
import {ActivationEnd, NavigationEnd, Router} from '@angular/router';
import {Translations} from './Translations';
import {Config} from './Config';
import {DOCUMENT} from "@angular/common";
import {MetaUpdateService} from './services/meta-update/meta-update.service';
import {LoggerService} from './log/logger.service';


import {RouteVO} from './vo/RouteVO';
import {MapMaxValuesVO} from './vo/MapMaxValuesVO';
import {throwError} from 'rxjs';
import {ColorCategories} from './inc/ColorCategories';
import {RegionNameVO} from './vo/RegionNameVO';
import {TranslationVO} from './vo/TranslationVO';

import {SettingsService} from '../mod-map/services/settings/settings.service';
import {InfoBlockService} from '../mod-map/services/info-block/info-block.service';
import {DataTableService} from '../mod-map/services/data-table/data-table.service';

import {TitlesService} from '../mod-map/services/titles/titles.service';
import {TitlesVO} from './vo/TitlesVO';
import {environment} from '../../environments/environment';
import {ControlValueVO} from '../ui-controls/vos/ControlValueVO';

import {ConfigMapColors} from './configs/ConfigMapColors';
import {ColorCategoriesVO} from './inc/ColorCategoriesVO';
import {DomElementsInfo} from "./vo/DomElementsInfo";
import {StatsService} from "./services/stats/stats.service";
import {WindowRefService} from "./services/window/window-ref.service";
import {MapLegendService} from "../mod-map/services/map-legend/map-legend.service";
import {MapPopService} from "../mod-map/services/map-pop/map-pop.service";
import {BackgroundDataVO} from "../mod-map/vos/BackgroundDataVO";
import {IVizService} from "../mod-map/services/viz-services/IVizService";
import {Environment} from "@angular/compiler-cli/src/ngtsc/typecheck/src/environment";
import {RouteService} from "./services/route/route.service";


@Injectable({
  providedIn: 'root'
})
export class ModelService{



  public selectedRegion:RegionNameVO = null;
  public maxValues:MapMaxValuesVO = null;

  public regionNames:Array<RegionNameVO> = [];
  public regionNames_ids:Array<string> = [];

  public background_data:Array<BackgroundDataVO>=[];
  public background_data_ids:Array<string>=[];


  public config:Config;
  private readyCount:number = 0; // finished if count === 4
  public READY:boolean = false;
  public MOBILE_SIZE:number= 900;
  public DPI:number = 1;

  public translations:Translations;
  public MAP_SIZE:number;
  public MAP_ZOOM:number;

  // map_light
  // map_dark
  // map_osm
  public MAP_POP_STYLE:string = 'map_light';
  //////////////////////////////////////////////

  //public M1:string = '';
  public M1_names:Array<string>=['workplace','place-of-residence'];
  public M1_ids:Array<string>=['w','h'];

  //public M2:string = '';
  public M2_names:Array<string>=['number-of-employees','added-value','value-produced'];
  public M2_ids:Array<string>=['e','av','vp'];

  //public M3:string = '';
  //public M4:string = '';

  public M3_names:Array<any> = ['industry','profession','sector'];
  public M3_ids:Array<any> = ['i','p','s'];



 // public T1:string = '3'; // 3,4,7
  //public T2:string = 'all';
  public T1_names:Array<any> = ['territories-3','territories-4','territories-7'];
  public T1_ids:Array<any> = ['3','4','7'];

  public VIZ:number=-1;
  public vizService:IVizService = null;

  public years:Array<ControlValueVO> = [];



  //////////////////////////////////////////////
  public onDataUpdate:EventEmitter<string> = new EventEmitter<string>();
  public onLanguageUpdate:EventEmitter<string> = new EventEmitter<string>();
  public onRouteUpdate:EventEmitter<string> = new EventEmitter<string>();
  public onMaxValuesReady:EventEmitter<string> = new EventEmitter<string>();
  public onModelReady:EventEmitter<string> = new EventEmitter<string>();
  public onResizeUpdate:EventEmitter<string> = new EventEmitter<string>();

  public routeURL:string='none';
  private initialURL:string='';
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////
  private translationsURL:string = 'assets/config/translations.json';
  private configURL:string = 'assets/config/config.json';
  //////////////////////////////////////////////////////
  private URLencoder:HttpUrlEncodingCodec;
  /////////////////////////////////////////////////////
  public theme:number = -1;     // -1: ugly,  1:normal
  public themeSTR:string = '';

  ////////////////////////////////////////////////////
  ///////////////////////////////////////////////////
  public titlesVO:TitlesVO;
  ////////////////////////////////////////////
  public dataIsNotComplete:boolean = false;
  ////////////////////////////////////////////
  public oldRoute:RouteVO;
  public route:RouteVO = new RouteVO('landing','lv');


  constructor(
    private http: HttpClient,
    private router:Router,

    public window: WindowRefService,
    @Inject(DOCUMENT) public document: Document,
    @Inject(DomElementsInfo) public dom:DomElementsInfo,
    private statsService:StatsService,

    public meta:MetaUpdateService,
    public mapLegendService:MapLegendService,
    public settings:SettingsService,
    public infoService:InfoBlockService,
    public dataService:DataTableService,
    public popService:MapPopService,
    public titlesService:TitlesService,
    private routeService:RouteService,
    private logger:LoggerService
  ) {

    this.logger.enabled = false;
    this.URLencoder = new HttpUrlEncodingCodec();
    this.config = new Config();
    this.translations = new Translations();
    this.DPI = window.nativeWindow.devicePixelRatio || 1;
    ////////////////////////////////////////

    document.querySelector('meta[property=\'js:version\']').setAttribute('content',environment.appVersion);


    this.meta.initialize(this);
    this.statsService.model = this;
    this.statsService.meta = this.meta;

    this.mapLegendService.initialize(this);
    this.settings.initialize(this);
    this.infoService.initialize(this);
    this.dataService.initialize(this);
    this.popService.initialize(this);
    this.titlesService.initialize(this);
    this.routeService.initialize(this);




    ////////////////////////////////////////
    // optional environment params goes here..
    ///////////////////////////////////////
    this.parseURLParams();

    // NavigationEnd
    // NavigationCancel
    // NavigationError
    // RoutesRecognized

    this.router.events.forEach((evt) => {
      if (this.readyCount === 0) {
        this.initialize();
      }
      if(evt instanceof ActivationEnd) {
        const url:string = evt.snapshot.url+'';
        if(url!=='' && this.READY===true){
          this.parseURL(url);
        }else{
          this.initialURL = url;
        }
      }
      if(evt instanceof NavigationEnd) {
          const url: string = evt.urlAfterRedirects + '';
          this.routeService.saveRouteURL(url);
      }
    });
  }

  private parseURLParams():void{
    //this.logger.log('Model.parseURLParams');
    const hasParams:boolean = this.router.url.split('?').length>1;
    let param_arr:Array<string>;
    let param:string='';
    let value:string='';

    if(hasParams===true){
      const params:Array<string> = this.router.url.split('?')[1].split('&');
      params.forEach((item:string)=>{
        param_arr = item.split('=');
        if(param_arr.length===2){
          param = item.split('=')[0];
          value = item.split('=')[1];
          if(param==='theme'){
            this.theme = value==='1'?1:-1;
            this.themeSTR = value==='1'?'?theme=1':'';
          }
          if(param==='screenshot'){
            this.dom.screenshot = value=='true'?true:false;
          }
        }
      });
    }
  }
  private parseURL=(url:string):void=>{
    this.parseURLParams();
    this.logger.log('Model.parseURL');
    this.logger.log('- url:' +url);
    this.logger.log('- routeURL:' +this.routeURL);

    if(this.routeURL === url){
      return;
    }
    this.oldRoute = this.route.clone();

    const arr:Array<string>=url.split(',');
    this.routeURL = url;

    let isRouteValid:boolean = true;
    const lang:string = arr[0]==='lv'?'lv':'en';
    const view:string = arr[1];
    let new_url: string;
    this.logger.log('- lang:' +lang);
    /////////////////////////////////////////////////////////////////////////////////////
    // landing, about, main
    /////////////////////////////////////////////////////////////////////////////////////

    if(view === 'landing'){
        // lang/landing
        this.route = new RouteVO(view,lang);
        this.route.year = this.oldRoute.year;
        this.VIZ=-1;
        new_url = '/' + this.route.lang + '/landing';
    }else if(view === 'about'){
        // lang/about
        this.route = new RouteVO(view,lang);
        this.route.year = this.oldRoute.year;
        this.VIZ=-1;
        new_url = '/' + this.route.lang + '/about';
    }else if(view === 'api'){
      // lang/about
      this.route = new RouteVO(view,lang);
      this.route.year = this.oldRoute.year;
      this.VIZ=-1;
      new_url = '/' + this.route.lang + '/api';
    }else if(view === 'map'){
      if(arr.length===9){

        // lang/map/2017/M1/M2/T1/T2/M3/M4
        // :lang/map/:year/:M1/:M2/:T1/:T2/:M3/:M4',

        const year:number = this.getYearFromRoute(arr[2]);
        if(year==-1){
          this.routeParamsNotValidError(); return;
        }

        const m1:string = arr[3];
        const m2:string = arr[4];
        const t1:string = arr[5];
        const t2:string = arr[6];
        const m3:string = arr[7];
        const m4:string = arr[8];

        if(this.M1_names.indexOf(m1)==-1 || this.M2_names.indexOf(m2)==-1 || this.T1_names.indexOf(t1)==-1){
          this.routeParamsNotValidError(); return;
        }

        const M1 = this.M1_ids[this.M1_names.indexOf(m1)];
        const M2 = this.M2_ids[this.M2_names.indexOf(m2)];
        const T1 = this.T1_ids[this.T1_names.indexOf(t1)];
        const T2 = t2;
        const M3 = m3==='none'?'none':this.M3_ids[this.M3_names.indexOf(m3)];
        const M4 = m4;


        this.route = new RouteVO(view,lang,M1, M2, M3, M4, T1, T2, year);


        if (M3 === 'none') {
          new_url = '/' + this.route.lang + '/map/' + this.route.year + '/' + this.M1_getRouteNameFromID(this.route.M1) + '/' + this.M2_getRouteNameFromID(this.route.M2) + '/' + this.T1_getRouteNameFromID(this.route.T1) + '/' + this.route.T2+'/none/none';
        }
        if (M3 !== 'none') {
          new_url = '/' + this.route.lang + '/map/' + this.route.year + '/' + this.M1_getRouteNameFromID(this.route.M1) + '/' + this.M2_getRouteNameFromID(this.route.M2) + '/' + this.T1_getRouteNameFromID(this.route.T1) + '/' + this.route.T2 + '/' + this.M3_getRouteNameFromID(this.route.M3) + '/' + this.route.M4;
        }
        if (T2!=='none') {
          this.selectedRegion = this.getRegionbyCode(this.route.T2);
        }else{
          this.selectedRegion = null;
        }
        this.VIZ = this.generateVizType();
        this.loadSelectedRegionName();
      }else{
        isRouteValid = false;
      }
    }else{
      isRouteValid = false;
    }

    if(isRouteValid == false){
      this.routeParamsNotValidError();
    }

    if(this.route.isLangChangedOnly(this.oldRoute)==true){
      this.languageHasBeenUpdated();
    }else{
      this.routeHasBeenUpdated();
    }
  }
  public setRouteValues(route:RouteVO):void{
    const isDirty:boolean = !this.route.isEqual(route);
    if(isDirty===false) { return;}

    let url:string;
    switch (route.view) {
      case 'landing':
        // :lang/landing
        url = '/' + route.lang + '/' + route.view;
        break;

      case 'about':
        // :lang/about
        url = '/' + route.lang + '/' + route.view;
        break;

      case 'api':
        // :lang/api
        url = '/' + route.lang + '/' + route.view;
        break;

      case 'map':
        if (route.M3 === 'none') {
          url = '/' + route.lang + '/map/' + route.year + '/' + this.M1_getRouteNameFromID(route.M1) + '/' + this.M2_getRouteNameFromID(route.M2) + '/' + this.T1_getRouteNameFromID(route.T1) + '/' + route.T2+'/none/none';
        }
        if (route.M3 !== 'none') {
          url = '/' + route.lang + '/map/' + route.year + '/' + this.M1_getRouteNameFromID(route.M1) + '/' + this.M2_getRouteNameFromID(route.M2) + '/' + this.T1_getRouteNameFromID(route.T1) + '/' + route.T2 + '/' + this.M3_getRouteNameFromID(route.M3) + '/' + route.M4;
        }
        break;
    }
    this.router.navigateByUrl(url);
  }


  private initialize():void{
    this.readyCount++;
    this.loadConfig();
  } // ready - 1
  private checkReady():void{
    if(this.readyCount === 4){
      this.READY = true;
      this.parseURL(this.initialURL);
      this.onModelReady.emit();
    }
  }

  public loadTranslations():void{
    if(this.config.translationsFrom==='json'){
      this.loadTranslationsJSON();
    }else{
      this.loadTranslationsDB();
    }
  }
  public loadTranslationsComplete():void{
    this.readyCount++;
    this.loadYears();
  }   // ready - 3

  public loadTranslationsJSON():void{
    this.http.get(this.translationsURL).subscribe((data:any) => this.loadTranslationsJSONComplete({...data}));
  }
  public loadTranslationsJSONComplete(data:any):void{
    this.translations.initializeJSON(data,this.route.lang);
    this.loadTranslationsComplete();
  }

  public loadTranslationsDB():void{
    this.http.get(this.config.serviceURL+'?db=translations').subscribe((data:any) => this.loadTranslationsDBComplete({...data}));
  }
  public loadTranslationsDBComplete(data:any):void{
    if(data.info==='ok') {
      this.translations.initializeDB(data.data, this.route.lang);
      this.loadTranslationsComplete();
    }else{
      throwError('Model.loadTranslationsDB - translations not loaded..');
    }
  }

  public loadConfig():void{
    this.http.get(this.configURL).subscribe((data:any) => this.loadConfigComplete({...data}));
  }
  public loadConfigComplete=(data:any):void=>{
    this.config.serviceURL = data.serviceURL;
    this.config.hostURL = data.hostURL;
    this.config.hostName = data.hostURL;
    this.config.geoServerTilesURL = data.geoServerTilesURL;
    this.config.osmTilesURL = data.osmTilesURL;
    this.config.ortoTilesURL = data.ortoTilesURL;

    this.config.mapBoxLayer_1 = data.mapBoxLayer_1;
    this.config.mapBoxLayer_3 = data.mapBoxLayer_3;
    this.config.mapBoxLayer_4 = data.mapBoxLayer_4;
    this.config.mapBoxLayer_7 = data.mapBoxLayer_7;


    this.config.mapColors.initialize(data.mapColors);
    this.config.configViz.initialize(data.configViz);

    this.config.home_color = data.home_color;
    this.config.work_color = data.work_color;

    this.config.colorCategories = new ColorCategories(data.color_categories);
    this.config.translationsFrom = data.translationsFrom;

    this.config.stats_id = data.stats_id;

    this.readyCount++;
    this.loadTranslations();
  } // ready - 2

  public loadYears():void{
    // https://tools.csb.gov.lv/tea/api?db=menu-years
    this.logger.log('Model - loadYears');
    const url:string = this.config.serviceURL+'?db=menu-years';
    this.http.get(url).subscribe((data:any) => this.loadYearsComplete({...data}));
  }
  private loadYearsComplete=(data:any):void=>{
    this.logger.log('*************************');
    this.logger.log('Model - loadYearsComplete');
    this.logger.log('*************************');
    if(data.info==='ok'){
      const arr = data.data;
      const L:number = arr.length;
      let i:number=0;
      let year:number=0;
      while(i<L){
        year = arr[i].year;
        this.years.push(new ControlValueVO(year+'',new TranslationVO('year',year+'',year+'')));
        i++;
      }
      this.route.year = parseInt(this.years[this.years.length-1].id);

      this.logger.dir(this.years);
      this.logger.log('*************************');
      this.readyCount++;
      this.checkReady();

    }else{
      throwError('Model.loadYears - years not loaded..');
    }
  } // ready - 4



  private loadSelectedRegionName():void{
    if(this.route.T2==='all'){
      this.selectedRegion = null;
      return;
    }
    this.settings.loadTerritoryName(this.route.T2,this.route.T1,this.route.year).subscribe((data:any) => this.loadSelectedRegionDone({...data}));
  }
  private loadSelectedRegionDone=(ob:any):void=>{
    if(ob.data && ob.info==='ok'){
      const item:any = ob.data[0];
      this.selectedRegion = new RegionNameVO(
          item.code,
          new TranslationVO(item.code,item.name_lv,item.name_en),
          new TranslationVO(item.code,item.name_lv_short,item.name_en_short)
        );
    }else{
      this.selectedRegion = null;
    }
  }

  private dataHasBeenUpdated():void{
    this.onDataUpdate.emit('update');
  }
  private routeHasBeenUpdated():void{
    this.onRouteUpdate.emit('update');
    this.statsService.sendStats();
  }
  private languageHasBeenUpdated():void{
    this.translations.lang = this.route.lang;
    this.onLanguageUpdate.emit('update');
  }

  public updateLegendListData(colorCategories:ColorCategories):void{
    const items:Array<ColorCategoriesVO> = colorCategories.items;
    const arr:Array<ControlValueVO> = this.settings.m4_data.slice(1);

    function searchByPropCode(code:string):ControlValueVO {
      let ret:ControlValueVO = null;
      // tslint:disable-next-line:no-shadowed-variable
      arr.forEach((item:ControlValueVO)=>{
        if(item.id===code){
          ret = item;
        }
      });
      return ret;
    }
    const list_data:Array<ControlValueVO>=[];

    let i:number=0;
    const L:number = items.length;
    let item:ControlValueVO;
    let color:string;

    while(i<L){
      const code = items[i].property;
      color = items[i].color;
      item = searchByPropCode(code);
      if(item!==null){
        list_data.push(new ControlValueVO(item.id, item.name, false, i, color));
      }
      if(code==='other'){
        list_data.push(new ControlValueVO('other', new TranslationVO('legend-other','Cita','Other'), false, i, color));
      }
      i++;
    }
    this.mapLegendService.updateLegendListData(list_data);
  }
  public updateLegendSizes(valueTooSmallStartsFrom:number=-1,valueMaxOnScreen:number=-1,areaMaxOnScreen:number=-1){
    this.mapLegendService.updateLegendSizes(valueTooSmallStartsFrom,valueMaxOnScreen,areaMaxOnScreen);
  }
  /////////////////////////////////////////////////
  // setters & getters
  /////////////////////////////////////////////////

  public M1_getRouteNameFromID(id:string):string{
    const index:number = this.M1_ids.indexOf(id);
    if(index==-1){
      this.routeParamsNotValidError();
    }
    const value:string = this.M1_names[index];
    return value;
  }
  public M2_getRouteNameFromID(id:string):string{
    const index:number = this.M2_ids.indexOf(id);
    if(index==-1){
      this.routeParamsNotValidError();
    }
    return this.M2_names[index];
  }
  public M3_getRouteNameFromID(id:string):string{
    const index:number = this.M3_ids.indexOf(id);
    if(index==-1){
      this.routeParamsNotValidError();
    }
    return this.M3_names[index];
  }

  public T1_getRouteNameFromID(id:string):string{
    const index:number = this.T1_ids.indexOf(id);
    if(index==-1){
      this.routeParamsNotValidError();
    }
    return this.T1_names[index];
  }

  public getYearFromRoute(id:string):number{
    this.logger.log('**************************');
    this.logger.log('Model.getYearFromRoute- id:'+id);
    this.logger.log('**************************');

    let i:number=0;
    let L:number=this.years.length;
    let vo:ControlValueVO = null;
    let item:ControlValueVO = null;

    while(i<L){
      vo = this.years[i];
      if(vo.id == id){
        item = vo;
      }
      i++;
    }
    return item!==null?parseInt(item.id):-1;
    this.logger.log('**************************');
  }



  public getRegionbyCode(code:string):RegionNameVO{
    const arr:Array<string> = code.split('parent-');
    if(arr.length>1){
      code = arr[1];
    }
    if(code==='LV'|| code==='all'){
      return new RegionNameVO(code, new TranslationVO(code,'Visa Latvija','All country'),new TranslationVO(code,'Visa Latvija','All country'));
    }
    const index:number = this.regionNames_ids.indexOf(code);
    if(index!==-1){
      return this.regionNames[index];
    }else{
      this.routeParamsNotValidError();
      return null;
    }
  }
  public getRoute():RouteVO{
      return this.route.clone();
  }

  public routeParamsNotValidError=():void=>{
    this.logger.log('**************************');
    this.logger.log('Model.routeParamsNotValidError');
    this.logger.log('**************************');
    this.window.nativeWindow.location.href = this.config.hostURL+'/';
    this.logger.log('path:' +this.window.nativeWindow.location.href);
    this.logger.log('**************************');
  }

  public get configMapColors():ConfigMapColors{
    return this.config.mapColors;
  }
  private generateVizType():number{
    let type:number = -1;
    if(this.route.M3 === 'none' && this.route.M4 === 'none' && this.route.T2==='all'){
      // circles
      type = 1;
    }else if(this.route.M3 === 'none' && this.route.M4 === 'none' && this.route.T2!=='all'){
      // circles-region
      type = 2;
    }else if(this.route.M3 !== 'none' && this.route.T2==='all'){
      // circles-sectors
      type = 3;
    }else if(this.route.M3 !== 'none' && this.route.T2!=='all'){
      // circles-sectors-region
      type = 4;
    }
    return type;
  }
  //////////////////////////////////
  public resize():void{
    this.onResizeUpdate.emit('update');
  }




}
