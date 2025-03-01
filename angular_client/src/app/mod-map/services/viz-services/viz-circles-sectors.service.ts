import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {throwError} from 'rxjs';
import {VizCircleSectorVO} from '../../vos/VizCircleSectorVO';
import {PickingColors} from '../../components/inc/PickingColors';
import {IVizService} from './IVizService';
import {ModelService} from "../../../model/model.service";
import {RouteVO} from "../../../model/vo/RouteVO";
import {MapBackgroundChoroService} from "../map-bacground-choro/map-background-choro.service";

@Injectable()
export class VizCirclesSectorsService  implements IVizService {

  private serviceURL:string = '';
  public onDataUpdated:EventEmitter<string> = new EventEmitter<string>();
  public data:Array<VizCircleSectorVO> = [];
  public ids:Array<string> = [];
  public colors:Array<string> = [];
  private route:RouteVO;

  constructor(private http: HttpClient, private model:ModelService, public backgroundService:MapBackgroundChoroService) { }
  public initialize():void{
    this.serviceURL = this.model.config.serviceURL;
    this.backgroundService.initialize();
  }
  public loadData(route:RouteVO):void{
    this.route = route;
    const url:string = this.serviceURL+'?db=viz-circles-sectors&m1='+route.M1+'&m2='+route.M2+'&m3='+route.M3+'&m4='+route.M4+'&t1='+route.T1+'&year='+route.year;
    this.data=[];
    this.ids=[];
    this.colors=[];
    this.http.get(url).subscribe((data:any) => this.onLoadDataDone({...data}));
  }
  private onLoadDataDone=(data:any):void=>{
    if(data.info==='ok'){
      this.parseData(data.data,data.time);
    }else{
      throwError('VizCirclesSectorsService - ERROR');
    }
  }

  private parseData(obj:any,time:string):void{
    // this.logger.log('*********************');
    // this.logger.log('VIZ-CIRCLES-SECTORS - parseData - time:'+time);
    // this.logger.dir(obj);

    const data:Array<any> = obj.map_set.map_data==null?[]:obj.map_set.map_data;
    const sector_meta:Array<any> = obj.map_set.sector_meta==null?[]:obj.map_set.sector_meta;
    const clusters:Array<any> = obj.map_set.clusters==null?[]:obj.map_set.clusters;
    this.model.dataIsNotComplete = data.length===0 || sector_meta.length===0 || clusters.length===0;


    this.backgroundService.setData(data, clusters);

    // this.logger.log(' data:'+data.length);
    // this.logger.log(' sector_meta:'+sector_meta.length);
    // this.logger.log(' clusters:'+clusters.length);
    // this.logger.log(' dataIsNotComplete:'+this.model.dataIsNotComplete);
    // this.logger.log('*********************');

    this.model.config.colorCategories.generatePropertyColors(sector_meta);
    this.model.updateLegendListData(this.model.config.colorCategories);

    ///////////////////
    this.data=[];
    this.ids=[];
    let vo:VizCircleSectorVO;
    ///////////////////
    const picking:PickingColors = new PickingColors();
    let max:number = -1;
    let color: string;

    data.forEach((item:any)=>{

      /*
      code	"LV0980290"
      property_id	"G17"
      display_property_id	"other"
      value	1907790.45
      value_total	7596882.58
      choro	47694.76
      */

      if(item.value!==null && parseInt(item.value)>0){
          const property_id:string = item.display_property_id;
          color = this.model.config.colorCategories.getColorByProperty(property_id);
          vo = new VizCircleSectorVO(item.code,parseFloat(item.value+''),parseFloat(item.value_total+''), parseFloat(item.choro+''), property_id,false);
          vo.property_color = color;
          vo.picking_color = picking.color();

          this.data.push(vo);
          this.ids.push(item.code);
          this.colors.push(vo.picking_color);
          max = Math.max(max,vo.value_total);
      }
    });
    //////////////////
    let j:number=0;
    const K:number = this.data.length;
    while(j<K){
      vo = this.data[j];
      vo.percentageFromData = (vo.value_total)*100/(max);
      j++;
    }
    //////////////////
    this.dataHasBeenUpdated();
  }
  private dataHasBeenUpdated():void{
    this.onDataUpdated.emit('update');
  }
  public getValueObjectByColor(color:string):VizCircleSectorVO{
    const index:number = this.colors.indexOf(color);
    if(index!==-1){
      return this.data[index];
    }else{
      return null;
    }
  }
  public getValueObjectByRegionCode(code:string):VizCircleSectorVO{
    const index:number = this.ids.indexOf(code);
    if(index!==-1){
      return this.data[index];
    }else{
      return null;
    }
  }
}
