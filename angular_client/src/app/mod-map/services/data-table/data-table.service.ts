import {EventEmitter, Injectable} from '@angular/core';
import {ModelService} from '../../../model/model.service';
import {HttpClient} from '@angular/common/http';
import {throwError} from 'rxjs';
import {RouteVO} from '../../../model/vo/RouteVO';
import {DataTableVO} from '../../../model/vo/DataTableVO';
import {TranslationVO} from '../../../model/vo/TranslationVO';


@Injectable({
  providedIn: 'root'
})
export class DataTableService {

  private model:ModelService;
  private serviceURL:string = '';
  private onModelReadyListener:any;
  public initialized:boolean = false;
  //////////////////////////////////


  private route:RouteVO;

  public onDataUpdated:EventEmitter<string> = new EventEmitter<string>();
  public onDataSorted:EventEmitter<string> = new EventEmitter<string>();
  public onSortOverlayChange:EventEmitter<string> = new EventEmitter<string>();




  private propertyTotal:TranslationVO;
  public data:Array<DataTableVO>=[];
  /////////////////////////////////
  public sort_order_one:number = 1; // -1
  public sort_order_two:number = 1; // -1
  public sort_order_three:number = 1; // -1
  public sortType:number = 2;
  ///////////////////////////////
  public showSortOverlay:boolean = false;


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
    this.serviceURL = this.model.config.serviceURL;
    this.propertyTotal = this.model.translations.item('data-table-property-total');
  }
  private onModelReady=():void=>{
    this.initializeService();
  }
  public reset():void{
      this.data = [];
  }
  public loadDataList(route:RouteVO):void{
    this.route = route;
    this.data = [];
    // data-table-list
     const url:string = this.serviceURL+'?db=data-table-list&m1='+route.M1+'&m2='+route.M2+'&m3='+route.M3+'&m4='+route.M4+'&t1='+route.T1+'&t2='+route.T2+'&year='+route.year;
    /*
    this.logger.log('*************');
    this.logger.log('data-table-servise - loadDataList');
    this.logger.log(url);
    this.logger.log('*************');
    */
    /*************
     T2 = none
     1) M3 == none
     2) M3 != none
    *************/

    /*************
     T2 != none
     1) M3 == none
     2) M3 != none
    *************/

    this.http.get(url).subscribe((data:any) => {
      if(data.info==='ok' && data.data.length>0){
       // this.logger.log('data-table-servise - LOADED DATA');
       //  this.logger.dir(data.data);

        // M1, M2
        // 0: {code: "LV0766300", name_lv_short: "Riebiņu n.", name_en_short: "Riebiņi m.", value: "1393", percentage: "44"}
        if(this.route.M3==='none' && this.route.M4==='none'){
            // this.logger.log('M1, M2');
            this.parseData(data.data);
        }

        // M1, M2, M3, M4 = top
        // code: "LV0010000", name_lv_short: "Rīga", name_en_short: "Rīga", property_id: "A", value: "1805", percentage: "44"}
        if(this.route.M3!=='none' && this.route.M4==='none'){
          // this.logger.log('M1, M2, M3, M4 = top');
          this.parseDataTOP(data.data);
        }

        // M1, M2, M3, M4 = selected value
        // {code: "LV0010000", name_lv_short: "Rīga", name_en_short: "Rīga", value: "1805", percentage: "1"}
        if(this.route.M3!=='none' && this.route.M4!=='none'){
          // this.logger.log('M1, M2, M3, M4 = selected value');
          this.parseData(data.data);
        }

        this.dataHasBeenUpdated();

      }else{
        throwError('DataTableService - ERROR');
        this.dataHasBeenUpdated();
      }
    });
  }
  private parseData(data:Array<any>):void{
    /*
      code: "LV0766300"
      data_ter: null
      name: "Riebiņu novads"
      property_id: "total"
      sort_code: "LV0766300"
      value: 1414
      value_calc: 44.2
     */
    this.data = [];
    let vo:DataTableVO;
    let region:TranslationVO;
    data.forEach((item:any)=>{

        if(item.code==='total'){
          region = this.model.translations.item('data-list-total');
        }else if(item.code==='out'){
          region = this.model.translations.item('data-list-out');
        }else if(item.code==='CONF'){
          region = this.model.translations.item('data-list-conf');
        }else if(item.code==='UNK'){
          region = this.model.translations.item('data-list-unk');
        }else if(item.code==='CORR'){
          region = this.model.translations.item('data-list-corr');
        }else{
          region = this.model.getRegionbyCode(item.code).name;
        }

        region.lang = this.model.route.lang;


        vo = new DataTableVO(
         region,
          parseFloat(item.value),
          parseFloat(item.value_calc),
          item.sort_code
        );

      this.data.push(vo);
    });
  }
  private parseDataTOP(data:Array<any>):void{
    this.data = [];
    let vo:DataTableVO;
    let subVO: DataTableVO;
    const arr:Array<DataTableVO> = [];
    let region:TranslationVO;

    data.forEach((item:any)=>{
      if(item.property_id!==null && item.property_id==='total'){
         // this.logger.dir(item);

        if(item.code==='total'){
          region = this.model.translations.item('data-list-total');
        }else if(item.code==='out'){
          region = this.model.translations.item('data-list-out');
        }else if(item.code==='CONF'){
          region = this.model.translations.item('data-list-conf');
        }else if(item.code==='UNK'){
          region = this.model.translations.item('data-list-unk');
        }else if(item.code==='CORR'){
          region = this.model.translations.item('data-list-corr');
        }else{
          region = this.model.getRegionbyCode(item.code).name;
        }
        region.lang = this.model.route.lang;

        vo = new DataTableVO(
          region,
          parseFloat(item.value),
          parseFloat(item.value_calc),
          item.sort_code
        );
        if(item.data_ter!==null&&item.data_ter.length>0) {
          /*
          property_id: "G18"
          value: 1343
          value_calc: 8091
          */
          item.data_ter.forEach((sub:any)=>{
             // this.logger.dir(sub);
            const propName:TranslationVO = this.model.settings.getM4ValueByCode(sub.property_id).name;
            subVO = new DataTableVO(
              propName,
              parseFloat(sub.value),
              parseFloat(sub.value_calc)
            );
            vo.data.push(subVO);
          });
        }
        ////////////////////////////////
        arr.push(vo);
      }
    });
    ////////////////////
    this.data = arr;
  }

  private dataHasBeenUpdated():void{
    this.sortData();
    this.onDataUpdated.emit('update');
  }
  private dataHasBeenSorted():void{
    this.onDataSorted.emit('update');
  }


  ///////////////////////////////
  // sorting
  ///////////////////////////////
  private sortData():void{
    switch (this.sortType) {
      case 1:
        this.data = this.sortOne(this.data, this.sort_order_one);
        break;
      case 2:
        this.data = this.sortTwo(this.data, this.sort_order_two);
        break;
      case 3:
        this.data = this.sortThree(this.data, this.sort_order_three);
        break;
    }
  }
  public sort=(id:number):void=>{
    switch (id) {
      case 1:
        this.sort_order_one = this.sortType===1 ? (this.sort_order_one===1?-1:1) : 1;
        this.sortType = 1;
        this.data = this.sortOne(this.data, this.sort_order_one);this.dataHasBeenSorted();
        break;
      case 2:
        this.sort_order_two = this.sortType===2 ? (this.sort_order_two===1?-1:1) : 1;
        this.sortType = 2;
        this.data = this.sortTwo(this.data, this.sort_order_two);this.dataHasBeenSorted();
        break;
      case 3:
        this.sort_order_three = this.sortType===3 ? (this.sort_order_three===1?-1:1) : 1;
        this.sortType = 3;
        this.data = this.sortThree(this.data, this.sort_order_three);this.dataHasBeenSorted();
        break;
    }
  }
  private sortOne(data:Array<DataTableVO>,order:number=1):Array<DataTableVO>{
    const collator:any = new Intl.Collator('lv');
    let sorted:Array<DataTableVO> = [];

    if(order===1){
      sorted =  data.sort(function(a:DataTableVO, b:DataTableVO) {
        return collator.compare(a.sort_code, b.sort_code);
      });
    }else{
      sorted =  data.sort(function(a:DataTableVO, b:DataTableVO) {
        return collator.compare(b.sort_code, a.sort_code);
      });
    }
    sorted.forEach((item:DataTableVO)=>{
      item.data = this.sortTwo(item.data,1);
    });

    return sorted;
  }
  private sortTwo(data:Array<DataTableVO>, order:number=-1):Array<DataTableVO>{
    let sorted:Array<DataTableVO> = [];
    if(order===-1) {
      sorted =  data.sort(function (a: DataTableVO, b: DataTableVO) {
        const A: number = a.value;
        const B: number = b.value;
        return (A < B) ? -1 : (A > B) ? 1 : 0;
      });
    }else{
      sorted =  data.sort(function (a: DataTableVO, b: DataTableVO) {
        const A: number = b.value;
        const B: number = a.value;
        return (A < B) ? -1 : (A > B) ? 1 : 0;
      });
    }
    sorted.forEach((item:DataTableVO)=>{
      item.data = this.sortTwo(item.data,order);
    });
    return sorted;
  }
  private sortThree(data:Array<DataTableVO>, order:number=-1):Array<DataTableVO>{
    let sorted:Array<DataTableVO> = [];
    if(order===-1) {
      sorted =  data.sort(function (a: DataTableVO, b: DataTableVO) {
        const A: number = a.value_calc;
        const B: number = b.value_calc;
        return (A < B) ? -1 : (A > B) ? 1 : 0;
      });
    }else{
      sorted =  data.sort(function (a: DataTableVO, b: DataTableVO) {
        const A: number = b.value_calc;
        const B: number = a.value_calc;
        return (A < B) ? -1 : (A > B) ? 1 : 0;
      });
    }
    sorted.forEach((item:DataTableVO)=>{
      item.data = this.sortThree(item.data,order);
    });
    return sorted;
  }

}
