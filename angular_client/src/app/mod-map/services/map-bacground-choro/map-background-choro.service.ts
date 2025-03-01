import {EventEmitter, Injectable} from '@angular/core';
import {AllClustersVO} from "../../../model/vo/AllClustersVO";
import {ModelService} from "../../../model/model.service";
import {BackgroundDataVO} from "../../vos/BackgroundDataVO";
import {LoggerService} from "../../../model/log/logger.service";


@Injectable({
  providedIn: 'root'
})
export class MapBackgroundChoroService {

  private serviceURL:string = '';
  public initialized:boolean = false;
  //////////////////////////////////

  public onDataUpdated:EventEmitter<string> = new EventEmitter<string>();
  public data:Array<BackgroundDataVO> = [];
  public ids:Array<string> = [];

  public clusters:AllClustersVO;
  public impossibleData:boolean = false;
  public zerroData:boolean = false;



  constructor(private model:ModelService, private logger:LoggerService) {

  }
  public initialize():void{
    if(this.initialized===true){return;}
    this.initialized = true;
    this.serviceURL = this.model.config.serviceURL;
  }

  public setData(data:Array<any>,clusters:Array<any>):void{
    this.logger.log('***************************');
    this.logger.log('backgroundService - setData');
    this.logger.log('***************************');
    this.logger.dir(this.model);
    this.logger.dir(this.model.configMapColors);
    this.logger.log('***************************');
    this.clusters = new AllClustersVO(clusters,this.model.configMapColors.choroColors(this.model.route.M1));
    this.data=[];
    this.ids=[];

    this.impossibleData = false;

    this.data=[];
    this.ids=[];
    this.impossibleData = false;
    this.zerroData = false;

    let vo:BackgroundDataVO;
    data.forEach((item:any)=>{
      // if value isn't possible it must be -1
      if(item.type && item.type==='parent'){

      }else {
          vo = new BackgroundDataVO(item.code, item.choro == null ? -1 : item.choro as number);

          this.data.push(vo);
          this.ids.push(item.code);

          ///////////////////////////////
          this.clusters.addValue(vo.value);
          ///////////////////////////////

          if (vo.value === -1) {
            this.impossibleData = true;
          }
          if (vo.value === 0) {
            this.zerroData = true;
          }
      }

    });


    this.logger.log('*****************');
    this.logger.log('MapBackgroundChoroService.setData');
    this.logger.dir(this.clusters);
    this.logger.log('*****************');
    this.logger.log('clusters count:'+this.clusters.items.length);
    this.logger.log('zerroData: '+this.zerroData);
    this.logger.log('impossibleData: '+this.impossibleData);
    this.logger.log('*****************');


    this.dataHasBeenUpdated();

  }
  private dataHasBeenUpdated():void{
    this.onDataUpdated.emit('update');
  }
}
