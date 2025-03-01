import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {throwError} from 'rxjs';
import {VizCircleVO} from '../../vos/VizCircleVO';
import {PickingColors} from '../../components/inc/PickingColors';
import {IVizService} from './IVizService';
import {ModelService} from "../../../model/model.service";
import {RouteVO} from "../../../model/vo/RouteVO";
import {MapBackgroundChoroService} from "../map-bacground-choro/map-background-choro.service";


@Injectable()
export class VizCirclesRegionService implements IVizService {

  private serviceURL:string = '';
  public onDataUpdated:EventEmitter<string> = new EventEmitter<string>();

  public parent:VizCircleVO = null;
  public data:Array<VizCircleVO> = [];
  public ids:Array<string> = [];
  public colors:Array<string> = [];

  private route:RouteVO;

  constructor(private http: HttpClient,private model:ModelService, public backgroundService:MapBackgroundChoroService) {}

  public initialize():void{
    this.serviceURL = this.model.config.serviceURL;
    this.backgroundService.initialize();
  }

  public loadData(route:RouteVO):void{
    this.route = route;
    const url:string = this.serviceURL+'?db=viz-circles-region&m1='+route.M1+'&m2='+route.M2+'&t1='+route.T1+'&t2='+route.T2+'&year='+route.year;
    this.data=[];
    this.ids=[];
    this.colors=[];
    this.http.get(url).subscribe((data:any) => this.onLoadDataDone({...data}));
  }
  private onLoadDataDone=(data:any):void=>{
    if(data.info==='ok'){
      this.parseData(data.data,data.time);
    }else{
      throwError('VizCirclesService - ERROR');
    }
  }

  private parseData(obj:any,time:string):void{
    // this.logger.log('*********************');
    // this.logger.log('VIZ-CIRCLES-REGION - parseData - time:'+time);
    // this.logger.dir(obj);

    const data:Array<any> = obj.map_set.map_data==null?[]:obj.map_set.map_data;
    const clusters:Array<any> = obj.map_set.clusters==null?[]:obj.map_set.clusters;
    this.model.dataIsNotComplete = data.length===0 || clusters.length===0;
    this.backgroundService.setData(data, clusters);

    // this.logger.log(' data:'+data.length);
    // this.logger.log(' clusters:'+clusters.length);
    // this.logger.log(' dataIsNotComplete:'+this.model.dataIsNotComplete);
    // this.logger.log('*********************');


    this.data=[];
    this.ids=[];
    let vo:VizCircleVO;
    ///////////////////
    const picking:PickingColors = new PickingColors();
    let max:number = -1;

    data.forEach((item:any)=>{
      // code: "LV0010000", value_total: 17442259726.03, choro: 37129.52, type:"flow/parent"}
      if(item.type==='flow'){
        if(item.value_total!==null && parseInt(item.value_total)>0 && this.ids.indexOf(item.code)===-1){
          vo = new VizCircleVO(item.code, parseFloat(item.value_total + ''),parseFloat(item.choro + ''),false);
          vo.picking_color = picking.color();
          this.data.push(vo);
          this.ids.push(item.code);
          this.colors.push(vo.picking_color);
          max = Math.max(max,vo.value_area);
        }
      }else if(item.type==='parent'){
        this.parent = new VizCircleVO(item.code, parseFloat(item.value_total + ''),parseFloat(item.choro + ''), true);
        vo = new VizCircleVO('parent-'+item.code, parseFloat(item.value_total + ''),parseFloat(item.choro + ''), true);
        vo.picking_color = picking.color();
        this.data.push(vo);
        this.ids.push(vo.code);
        this.colors.push(vo.picking_color);
        max = Math.max(max,vo.value_area);
      }
    });

    //////////////////
    let j:number=0;
    const K:number = this.data.length;
    while(j<K){
      vo = this.data[j];
      vo.percentageFromData = (vo.value_area)*100/(max);
      j++;
    }
    //////////////////
    this.dataHasBeenUpdated();
  }
  private dataHasBeenUpdated():void{
    this.onDataUpdated.emit('update');
  }
  public getValueObjectByColor(color:string):VizCircleVO{
    const index:number = this.colors.indexOf(color);
    if(index!==-1){
      return this.data[index];
    }else{
      return null;
    }
  }
  public getValueObjectByRegionCode(code:string):VizCircleVO{
    const index:number = this.ids.indexOf(code);
    if(index!==-1){
      return this.data[index];
    }else{
      return null;
    }
  }
}
