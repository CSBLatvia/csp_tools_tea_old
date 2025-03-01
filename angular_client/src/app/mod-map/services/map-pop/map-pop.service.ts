import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RouteVO} from '../../../model/vo/RouteVO';
import {ModelService} from '../../../model/model.service';
import {PopTextDebugVO} from "../../components/pop-ups/vos/PopTextDebugVO";
import {PopVO} from "../../components/pop-ups/vos/PopVO";
import {PopSimpleVO} from "../../components/pop-ups/vos/PopSimpleVO";



@Injectable({
  providedIn: 'root'
})
export class MapPopService {


  private model:ModelService;
  serviceURL:string = '';
  private onModelReadyListener:any;
  public initialized:boolean = false;
  //////////////////////////////////

  public onShow:EventEmitter<any> = new EventEmitter<any>();
  public onHide:EventEmitter<any> = new EventEmitter<any>();
  public onPositionUpdate:EventEmitter<any> = new EventEmitter<any>();
  public onPickingDataRequest:EventEmitter<any> = new EventEmitter<any>();
  public onPickingDataRequestAnswer:EventEmitter<any> = new EventEmitter<any>();
  public onPopDebugInfo:EventEmitter<PopTextDebugVO> = new EventEmitter<PopTextDebugVO>();


  public vo:PopVO;
  public voSimple:PopSimpleVO;
  public type:number = 1;
  private saved_code:string;
  private saved_type:number;


  public x:number = 1;
  public y:number = 1;
  public picking:boolean = false;

  public route:RouteVO;
  public textHTMLValue:string;



  constructor(private http: HttpClient) {}
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
  }
  private onModelReady=():void=>{
    this.initializeService();
  }


  public show=(vo:any,x:number,y:number):void=>{
    this.x = x;
    this.y = y;
    this.onShow.emit({type:this.type,vo:vo, x:this.x, y:this.y});
  }
  public hide=():void=>{
    this.type = 1;
    this.vo = null;
    this.voSimple = null;
    this.picking = false;

    this.textHTMLValue = '';
    this.saved_type=-1;
    this.saved_code='';

    this.onHide.emit();
  }
  public positionUpdate=(ob:any):void=>{
    this.x = ob.x;
    this.y = ob.y;
    this.onPositionUpdate.emit(ob);
  }
  public checkIfExistPickingData=(ob:any):void=>{
    this.onPickingDataRequest.emit(ob);
  }
  public emitPickingData=(picking:boolean):void=>{
    this.picking = picking;
    this.onPickingDataRequestAnswer.emit(this.picking);
  }
  ///////////////////////////////////////
  public loadPopData(route:RouteVO, region_over:string, pop_type:string='over'):void{
    this.saved_code = this.vo.code;
    this.saved_type = this.type;
    const url:string = this.serviceURL+'?db=pop&lang='+route.lang+'&year='+route.year+'&m1='+route.M1+'&m2='+route.M2+'&m3='+route.M3+'&m4='+route.M4+'&t1='+route.T1+'&t2='+route.T2+'&region_over='+region_over+'&type='+pop_type;
    this.http.get(url).subscribe((data:any) => this.onPopDataLoadDone({...data}));
  }
  public onPopDataLoadDone=(data:any):void=>{
    // html - text value
    // deb_par - parameters used
    // deb_sql - sql
    // deb_r_id

    if(data.info==='ok'){
      this.textHTMLValue = data.data.html;
      const info:PopTextDebugVO = new PopTextDebugVO(data.data.html,false,data.data.deb_sql,data.data.deb_par,data.data.deb_r_id);
      this.onPopDebugInfo.emit(info);


    }else{
      this.textHTMLValue = 'error..';

      const info:PopTextDebugVO = new PopTextDebugVO('',true,data.sql,'','',data.error_info);
      this.onPopDebugInfo.emit(info);

    }
    if(this.vo && this.vo.code===this.saved_code && this.type===this.saved_type) {
      this.vo.update(this.textHTMLValue);
    }
  }
  ///////////////////////////////////
  ///////////////////////////////////

  public createPopSimpleVO(code:string):PopSimpleVO{
    this.voSimple = new PopSimpleVO(this.model,code);
    return this.voSimple as PopSimpleVO;
  }
  public createPopVO(code:string,pop_type:string='over'):PopVO{
    this.vo = new PopVO(this.model,code);
    this.loadPopData(this.model.getRoute(),code,pop_type);
    return this.vo as PopVO;
  }


}
