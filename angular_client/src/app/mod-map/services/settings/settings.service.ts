import {EventEmitter, Injectable, Input} from '@angular/core';
import {ModelService} from '../../../model/model.service';
import {ControlValueVO} from '../../../ui-controls/vos/ControlValueVO';
import {TranslationVO} from '../../../model/vo/TranslationVO';
import {RegionNameVO} from '../../../model/vo/RegionNameVO';
import {DataTableVO} from '../../../model/vo/DataTableVO';
import {RouteVO} from "../../../model/vo/RouteVO";
import {LoggerService} from "../../../model/log/logger.service";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private model:ModelService;
  private serviceURL:string = '';
  private onModelReadyListener:any;
  public initialized:boolean = false;

  ///////////////////////////////
  // M1 - place - work, home
  // M2 - added value, number-of-employees, value-produced-by-employees
  // M3 - industry, profesion, sector
  /*
    - mprofs:       https://dev_tea.csb.gov.lv/php/index.php?db=menu-profs
    - mnaces:       https://dev_tea.csb.gov.lv/php/index.php?db=menu-naces
    - msectors:     https://dev_tea.csb.gov.lv/php/index.php?db=menu-sector
    -territories:   https://dev_tea.csb.gov.lv/php/index.php?db=menu-territories&level=4
  */

  public route:RouteVO = new RouteVO('map','lv');
  public lang:string;
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
  public  m4_data_ids:Array<string>=[];
  private m4_data_preloaded:Array<any> = [[],[],[]];
  private m4_data_ids_preloaded:Array<any> = [[],[],[]];
  public  m4_loading:boolean = false;


  public  t1:string = '';
  public  t2:string = '';
  public  t1_label:TranslationVO;
  public  t2_search_label:TranslationVO;

  public  t1_data:Array<ControlValueVO>=[];
  public  t2_data:Array<ControlValueVO>=[];

  public  t2_data_preloaded:Array<any>=[[],[],[]];
  public  t2_data_preloaded_region_names:Array<any>=[[],[],[]];
  public  t2_data_preloaded_region_names_ids:Array<any>=[[],[],[]];

  public  y:string = '';
  public  y_label:TranslationVO;
  public  y_data:Array<ControlValueVO>=[];
  public  y_loading:boolean = false;



  public  t2_loading:boolean = false;
  //////////////////////////////////

  /////////////////////////////
  private onRouteUpdateListener:any;
  private onLanguageUpdateListener:any;
  /////////////////////////////
  public onServiceInitialized:EventEmitter<string> = new EventEmitter<string>();
  public onServiceLanguageUpdate:EventEmitter<string> = new EventEmitter<string>();
  public onServiceChange:EventEmitter<string> = new EventEmitter<string>();
  public onSettingsDesktopVisibilityChange:EventEmitter<string> = new EventEmitter<string>();
  public settingsHiddenDesktop:boolean = false;
  /////////////////////////////
  public activeM4:ControlValueVO=null;



  constructor(private http: HttpClient, private logger:LoggerService) {
    this.logger.enabled = false;
  }
  public initialize(model:ModelService){
    this.model = model;
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onRouteUpdateListener = this.model.onRouteUpdate.subscribe(this.onRouteUpdate);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    if(this.model.READY===true){
      this.initializeService();
    }
  }
  private onModelReady=():void=>{
    this.logger.log('SETTINGS - onModelReady');
    this.initializeService();
  }
  private onRouteUpdate=():void=>{
    if(this.initialized===false){return;}
    this.logger.log('SETTINGS - onRouteUpdate');
    if(this.route.M3!==this.model.route.M3 && this.model.route.M3!==''){
      this.loadMenuDataM4(this.model.route.M3);
    }
    if(this.route.T1!==this.model.route.T1) {
      this.loadMenuDataT2(this.model.route.T1);
    }

    this.route = this.model.getRoute();
    this.lang = this.route.lang;

    this.m1 = this.route.M1;
    this.m2 = this.route.M2;
    this.t1 = this.route.T1;
    this.t2 = this.route.T2;
    this.m3 = this.route.M3;
    this.m4 = this.route.M4;
    this.y = this.route.year+'';

    this.onServiceChange.emit('update');
  }
  private onLanguageUpdate=():void=>{
    if(this.initialized==false){return;}
    this.logger.log('SETTINGS - onLanguageUpdate');
    this.lang = this.model.route.lang;
    this.m1_label.lang = this.lang;
    this.m2_label.lang = this.lang;
    this.m3_label.lang = this.lang;
    this.m4_label.lang = this.lang;
    this.t1_label.lang = this.lang;
    this.y_label.lang = this.lang;
    this.t2_search_label.lang = this.lang;
    this.onServiceLanguageUpdate.emit('update');
  }

  private initializeService=():void=> {
    if(this.initialized===true){return;}
    this.logger.log('SETTINGS - initializeService');

    this.serviceURL = this.model.config.serviceURL;

    this.route = this.model.getRoute();
    this.lang = this.route.lang;

    this.m1_label = this.model.translations.item('m1-label');
    this.m2_label = this.model.translations.item('m2-label');
    this.m3_label = this.model.translations.item('m3-label');
    this.m4_label = this.model.translations.item('m4-label');
    this.t1_label = this.model.translations.item('t1-label');
    this.t2_search_label = this.model.translations.item('t2-search-label');
    this.y_label = this.model.translations.item('year-label');

    this.m1 = this.route.M1;
    this.m2 = this.route.M2;
    this.t1 = this.route.T1;
    this.t2 = this.route.T2;
    this.m3 = this.route.M3;
    this.m4 = this.route.M4;
    this.y = this.route.year+'';

    this.logger.log('********************');
    this.logger.log('settings-service - initializeService');
    this.logger.dir(this.model.years);
    this.logger.dir(this.route);
    this.logger.log('********************');

    //this.loadMenuDataYears();

    if(this.m3!==''){
      this.loadMenuDataM4(this.m3);
    }
    this.loadMenuDataT2(this.t1);


    // M1 -toggle
    this.m1_data = [
      new ControlValueVO('w',  this.model.translations.item('m1-value-1') ),
      new ControlValueVO('h',  this.model.translations.item('m1-value-2') )
    ];
    // M2 - dropdown
    // number-of-employees
    // the-added-value
    // value-produced-by-employees

    this.m2_data = [
      new ControlValueVO('e',  this.model.translations.item('m2-value-1') ),
      new ControlValueVO('av',  this.model.translations.item('m2-value-2') ),
      new ControlValueVO('vp',  this.model.translations.item('m2-value-3') )
    ];

    // M3-combo - industry, profession, sector
    this.m3_data = [
      new ControlValueVO('i', this.model.translations.item('m3-value-1'),false,0),
      new ControlValueVO('p', this.model.translations.item('m3-value-2'),false,1),
      new ControlValueVO('s', this.model.translations.item('m3-value-3'),false,2)
    ];

    /////////////////
    this.t1_data = [
      new ControlValueVO('3',this.model.translations.item('territories-3')),
      new ControlValueVO('4',this.model.translations.item('territories-4')),
      new ControlValueVO('7',this.model.translations.item('territories-7'))
    ];
    this.t2_data = [];
    this.y_data = this.model.years;


    this.initialized = true;
    this.logger.log('****** data ********');
    this.logger.dir(this.m1_data);
    this.logger.dir(this.m2_data);
    this.logger.dir(this.m3_data);
    this.logger.dir(this.m4_data);
    this.logger.dir(this.t1_data);
    this.logger.dir(this.t2_data);
    this.logger.log('years data:')
    this.logger.dir(this.y_data);
    this.logger.log('********************');
    this.onLanguageUpdate();
    this.onServiceInitialized.emit('update');
    this.onServiceChange.emit('update');
  }
  ////////////////////////////////////////////////
  public changeM1=(vo:ControlValueVO):void=>{
    let route:RouteVO = this.model.route.clone();
        route.M1 = vo.id;
    this.model.setRouteValues(route);
  }
  public changeM2=(vo:ControlValueVO):void=>{
    let route:RouteVO = this.model.route.clone();
    route.M2 = vo.id;
    this.model.setRouteValues(route);
  }
  public changeM3=(vo:ControlValueVO):void=>{
    this.activeM4 = new ControlValueVO('none',new TranslationVO('m4-none','top vērtības','top values'));
    if(vo.active===false){
      this.m4_data = [];
      let route:RouteVO = this.model.route.clone();
      route.M3 = 'none';
      route.M4 = 'none';
      this.model.setRouteValues(route);
    }else {
      let route:RouteVO = this.model.route.clone();
      route.M3 = vo.id;
      route.M4 = 'none';
      this.model.setRouteValues(route);
    }
  }
  public changeM4=(vo:ControlValueVO):void=>{
    this.activeM4 = vo;
    let route:RouteVO = this.model.route.clone();
    route.M4 = vo.id;
    this.model.setRouteValues(route);
  }
  public changeT1=(vo:ControlValueVO):void=>{
    let route:RouteVO = this.model.route.clone();
    route.T1 = vo.id;
    route.T2 = 'all';
    this.model.setRouteValues(route);
  }
  public changeT2=(vo:ControlValueVO):void=>{
    let route:RouteVO = this.model.route.clone();
    route.T2 = vo.id;
    this.model.setRouteValues(route);
  }
  public changeYear=(vo:ControlValueVO):void=>{
    this.logger.log('SETTINGS.changeYear(): '+vo.id);
    let route:RouteVO = this.model.route.clone();
    route.year = parseFloat(vo.id);
    this.model.setRouteValues(route);
  }
  ///////////////////////////////////////////////
  private loadMenuDataM4(id:string):void{
    let L:number;
    switch (id){
      case 'i':
        L = this.m4_data_preloaded[0].length;
        break;
      case 'p':
        L = this.m4_data_preloaded[1].length;
        break;
      case 's':
        L = this.m4_data_preloaded[2].length;
        break;
    }
    this.m4_data = [];
    this.m4_data_ids = [];
    this.m4_loading = true;
    if(L===0){
      switch (id) {
        case 'i':
          this.http.get(this.serviceURL+'?db=menu-naces').subscribe((data: any) => this.onloadMenuDataM4Done(id, {...data}));

          break;
        case 'p':
          this.http.get(this.serviceURL+'?db=menu-profs').subscribe((data: any) => this.onloadMenuDataM4Done(id, {...data}));
          break;
        case 's':
          this.http.get(this.serviceURL+'?db=menu-sectors').subscribe((data: any) => this.onloadMenuDataM4Done(id, {...data}));

          break;
      }
    }else{
      this.onloadMenuDataM4Preloaded(id);
    }

  }
  private loadMenuDataT2(id:string):void{
    let L:number;
    switch (id) {
      case '3':
        L = this.t2_data_preloaded[0].length;
        break;
      case '4':
        L = this.t2_data_preloaded[1].length;
        break;
      case '7':
        L = this.t2_data_preloaded[2].length;
        break;
    }
    this.t2_data = [];
    this.t2_loading = true;
    if(L===0){
      //this.menuService.loadTerritoriesMenuData(parseInt(id),this.model.route.year).subscribe((data:any) => this.onloadMenuDataT2Done(id,{...data}));
      this.http.get(this.serviceURL+'?db=menu-territories&level='+id+'&year='+this.model.route.year).subscribe((data:any) => this.onloadMenuDataT2Done(id,{...data}));
    }else{
      this.onloadMenuDataT2Preloaded(id);
    }

  }

  // nace, profesion, sector
  private onloadMenuDataM4Done=(id:string, data:any):void=>{
    if(data.info==='ok'){
      let item:any;
      const m4_data:Array<ControlValueVO> = [];
      const m4_data_ids:Array<string> = [];
            m4_data.push(new ControlValueVO('none',new TranslationVO('m4-none','top vērtības','top values')));
            m4_data_ids.push('none');

      const obj:any = data.data;
      for (const code in obj) {
        if (obj.hasOwnProperty(code)) {
          item = obj[code];
          m4_data.push(new ControlValueVO(code,new TranslationVO(code,obj[code][0],obj[code][1])));
          m4_data_ids.push(code);
        }
      }

      this.m4_data = m4_data;
      this.m4_data_ids = m4_data_ids;

      this.activeM4 = this.m4_data[0];
      this.m4_loading = false;

      switch (id) {
        case 'i':
          this.m4_data_preloaded[0] = m4_data;
          this.m4_data_ids_preloaded[0] = m4_data_ids;
          break;
        case 'p':
          this.m4_data_preloaded[1] = m4_data;
          this.m4_data_ids_preloaded[1] = m4_data_ids;
          break;
        case 's':
          this.m4_data_preloaded[2] = m4_data;
          this.m4_data_ids_preloaded[2] = m4_data_ids;
          break;
      }

      this.onServiceChange.emit('update');
    }else{
       this.logger.error('dataM4 - load error..');
    }
  }
  // teritories names
  private onloadMenuDataT2Done=(id:string,data:any):void=>{
    const t2_data:Array<ControlValueVO> = [];
    t2_data.push(new ControlValueVO('all',this.model.translations.item('territories-all')));

    if(data.info==='ok'){

      let arr:Array<any> = data.data as Array<any>;
      ///////////////////////////////////////////////
      const collator:any = new Intl.Collator('lv');
      arr = arr.sort(function(a:any, b:any) {
          return collator.compare(a.name_lv.toLowerCase(), b.name_lv.toLowerCase());
      });

      ///////////////////////////////////////////////



      let i:number=0;
      const L:number=arr.length;
      let item:any;

      const regionNames:Array<RegionNameVO> = [];
      const regionNames_ids:Array<string> = [];

      while(i<L){
        item = arr[i];
        t2_data.push(
          new ControlValueVO(
            item.code,
            new TranslationVO(item.code,item.name_lv,item.name_en)
          )
        );
        //////////////////////////////
        // model
        regionNames.push(
          new RegionNameVO(
            item.code,
            new TranslationVO(item.code,item.name_lv,item.name_en),
            new TranslationVO(item.code,item.name_lv_short,item.name_en_short)
          )
        );
        regionNames_ids.push(item.code);
        /////////////////////////////
        i++;
      }
      this.t2_data = t2_data;
      this.t2_loading = false;

      switch (this.t1) {
        case '3':
          this.t2_data_preloaded[0] = t2_data;
          this.t2_data_preloaded_region_names[0] = regionNames;
          this.t2_data_preloaded_region_names_ids[0] = regionNames_ids;

          break;
        case '4':
          this.t2_data_preloaded[1] = t2_data;
          this.t2_data_preloaded_region_names[1] = regionNames;
          this.t2_data_preloaded_region_names_ids[1] = regionNames_ids;

          break;
        case '7':
          this.t2_data_preloaded[2] = t2_data;
          this.t2_data_preloaded_region_names[2] = regionNames;
          this.t2_data_preloaded_region_names_ids[2] = regionNames_ids;

          break;
      }

      this.model.regionNames = [...regionNames];
      this.model.regionNames_ids = [...regionNames_ids];
      this.onServiceChange.emit('update');
    }else{
       this.logger.error('dataT2 - load error..');
    }
  }
  private onloadMenuDataT2Preloaded(id:string):void{
    switch (id) {
      case '3':
        this.t2_data = this.t2_data_preloaded[0];
        this.model.regionNames = this.t2_data_preloaded_region_names[0];
        this.model.regionNames_ids = this.t2_data_preloaded_region_names_ids[0];
        break;
      case '4':
        this.t2_data = this.t2_data_preloaded[1];
        this.model.regionNames = this.t2_data_preloaded_region_names[1];
        this.model.regionNames_ids = this.t2_data_preloaded_region_names_ids[1];
        break;
      case '7':
        this.t2_data = this.t2_data_preloaded[2];
        this.model.regionNames = this.t2_data_preloaded_region_names[2];
        this.model.regionNames_ids = this.t2_data_preloaded_region_names_ids[2];
        break;
    }
    this.t2_loading = false;
  }
  private onloadMenuDataM4Preloaded(id:string):void{
    switch (id) {
      case 'i':
        this.m4_data = this.m4_data_preloaded[0];
        this.m4_data_ids = this.m4_data_ids_preloaded[0];
        break;
      case 'p':
        this.m4_data = this.m4_data_preloaded[1];
        this.m4_data_ids = this.m4_data_ids_preloaded[1];
        break;
      case 's':
        this.m4_data = this.m4_data_preloaded[2];
        this.m4_data_ids = this.m4_data_ids_preloaded[2];
        break;
    }
    this.m4_loading = false;
  }

  ////////////////////////
  public getM4ValueByCode(code:string):ControlValueVO{
    const index = this.m4_data_ids.indexOf(code);
    if(index==-1){
      this.model.routeParamsNotValidError();
    }
    return this.m4_data[index];
  }
  ///////////////////////
  public updateSettingsHiddenDesktop(value:boolean):void{
      this.settingsHiddenDesktop = value;
      this.onSettingsDesktopVisibilityChange.emit('update');
  }

  public loadTerritoryName(code:string,level:string,year:number):Observable<any>{
    const url:string = this.serviceURL+'?db=menu-territory-name&level='+level+'&code='+code+'&year='+year;
    this.logger.log('menu-data-service - loadTerritoryName - url:'+url);
    return this.http.get(url);
  }
}
