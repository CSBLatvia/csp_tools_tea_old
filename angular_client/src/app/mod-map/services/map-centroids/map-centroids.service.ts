import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {throwError} from 'rxjs';
import {CentroidVO} from "../../vos/CentroidVO";


@Injectable({
  providedIn: 'root'
})
export class MapCentroidsService {

  public serviceURL:string = '';
  public onDataUpdated:EventEmitter<string> = new EventEmitter<string>();
  public onMapPositionUpdated:EventEmitter<string> = new EventEmitter<string>();

  public data:Array<CentroidVO> = [];
  public geoJsonFeatures:any=[];
  public ids:Array<string> = [];

  constructor(private http: HttpClient) { }

  public loadData(t1:string, year:number):void{
    /*
    this.logger.log('*******************');
    this.logger.log('MapCentroidsService.loadData -  T1:'+t1+' year:'+year);
    this.logger.log('*******************');
    */
    const url:string = this.serviceURL+'?db=map-centroids&t1='+t1+'&year='+year;
    this.data=[];
    this.ids=[];
    this.geoJsonFeatures = [];
    this.http.get(url).subscribe((data:any) => this.onLoadDataDone({...data}));
  }
  private onLoadDataDone=(data:any):void=>{
    if(data.info==='ok'){
      this.parseData(data.data);
    }else{
      throwError('MapCentroidsService - ERROR');
    }
  }

  private parseData(data:Array<any>):void{
    this.data=[];
    this.ids=[];
    this.geoJsonFeatures = [];
    let vo:CentroidVO;
    data.forEach((item:any)=>{

      ////////////////////////
      vo = new CentroidVO(item.code,[parseFloat(item.lon+''),parseFloat(item.lat+'')]);
      this.data.push(vo);
      this.ids.push(item.code);

      ////////////////////////
      this.geoJsonFeatures.push(
        {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [parseFloat(item.lon+''), parseFloat(item.lat+'')]
          }
        }
      );
      ////////////////////////

    });
    this.dataHasBeenUpdated();
  }
  public mapPositionUpdate():void{
    this.onMapPositionUpdated.emit('update');
  }

  private dataHasBeenUpdated():void{
    this.onDataUpdated.emit('update');
  }
}
