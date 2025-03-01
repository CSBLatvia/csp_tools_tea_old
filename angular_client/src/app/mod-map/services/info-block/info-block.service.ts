import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ModelService} from '../../../model/model.service';
import {RouteVO} from '../../../model/vo/RouteVO';
import {TranslationVO} from '../../../model/vo/TranslationVO';
import {PopTextDebugVO} from "../../components/pop-ups/vos/PopTextDebugVO";

@Injectable({
  providedIn: 'root'
})

export class InfoBlockService {

  private model:ModelService;
  private serviceURL:string = '';
  private onModelReadyListener:any;
  public initialized:boolean = false;
  //////////////////////////////////


  public onDataUpdated:EventEmitter<string> = new EventEmitter<string>();
  ///////////////////////////////
  public route:RouteVO;
  public textHTMLValue:string = '';
  public info:PopTextDebugVO;
  public selectedRegion:TranslationVO=null;


  constructor(private http: HttpClient) { }
  public initialize(model:ModelService){
    this.model = model;
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    if(this.model.READY===true){
      this.initializeService();
    }
  }
  initializeService():void {
    if(this.initialized===true){return;}
    this.initialized = true;
    this.serviceURL = this.model.config.serviceURL;
  }
  private onModelReady=():void=>{
    this.initializeService();
  }
  public reset():void{
    this.selectedRegion = null;
    this.textHTMLValue = '';
  }


  ///////////////////////////////////////
  public loadData(route:RouteVO,forceNewRequest:boolean = false):void{
    if(this.route!==undefined) {
      if(this.route.isEqual(route) && forceNewRequest===false) {
        return;
      }
    }
    this.textHTMLValue = '';
    this.route = route;
    const url:string = this.serviceURL+'?db=pop&lang='+this.route.lang+'&year='+this.route.year+'&m1='+this.route.M1+'&m2='+this.route.M2+'&m3='+this.route.M3+'&m4='+this.route.M4+'&t1='+this.route.T1+'&t2='+this.route.T2+'&region_over=none&type=panel';
    this.http.get(url).subscribe((data:any) => this.onLoadDataDone({...data}) );
  }
  private onLoadDataDone=(data:any):void=>{
    if(data.info==='ok'){
      this.textHTMLValue = data.data.html;
      this.info = new PopTextDebugVO(data.data.html, false,data.data.deb_sql,data.data.deb_par,data.data.deb_r_id);
      this.onDataUpdated.emit('update');
    }else{
      this.textHTMLValue = '';
      this.info = new PopTextDebugVO('',true,'','','',data.error_info);
      this.onDataUpdated.emit('update');
    }
  }


  ///////////////////////////////////////
  public loadRegionName(route:RouteVO):void{
    const url:string = this.serviceURL+'?db=menu-territory-name&level='+route.T1+'&code='+route.T2+'&year='+route.year;
    this.http.get(url).subscribe((data:any) => this.onLoadRegionNameDone({...data}) );
  }
  private onLoadRegionNameDone=(data:any):void=>{
    if(data.info==='ok'){
      this.selectedRegion = new TranslationVO(data.data[0].code,data.data[0].name_lv,data.data[0].name_en);
      this.onDataUpdated.emit('update');
    }else{
      this.selectedRegion = null;
      this.onDataUpdated.emit('update');
    }
  }
}
