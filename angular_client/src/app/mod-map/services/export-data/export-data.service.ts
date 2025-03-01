import {EventEmitter, Injectable} from '@angular/core';
import {ModelService} from '../../../model/model.service';
import {HttpClient} from '@angular/common/http';
import * as FileSaver from 'file-saver';
import {RouteVO} from "../../../model/vo/RouteVO";

@Injectable({
  providedIn: 'root'
})
export class ExportDataService {


  private route:RouteVO;
  private productCode:string;
  private openCodes:Array<string>=[];
  public onModalOpenUpdate:EventEmitter<string> = new EventEmitter<string>();
  public onModalDataReadyUpdate:EventEmitter<string> = new EventEmitter<string>();
  public onModalDataErrorUpdate:EventEmitter<string> = new EventEmitter<string>();

  constructor(private model:ModelService, private http: HttpClient) { }

  public setProduct(code:string):void{
    this.productCode = code;
    this.openCodes = [];
  }
  public openCode(code:string):void{
    this.openCodes.push(code);
  }
  public closeCode(code:string):void{
    const index:number = this.openCodes.indexOf(code);
    if (index > -1) {
      this.openCodes.splice(index, 1);
    }
  }
  public openModal():void{
    this.onModalOpenUpdate.emit('update');
  }
  public downloadCSV(allYears:boolean=false,allCountries:boolean = false,allProductNames:number=1,allCountriesNames:number=1):void{
    // https://dev_eksports.csb.gov.lv/php/service.php?action=getCSV&productID=sp_33&direction=imp&time=2019&countryID=TOTAL&openIDS=3307-330790
    /*
    this.route = this.model.getRoute();
    const country:string = allCountries===true?'all':this.route.countryCode;
    const year:string = allYears===true?'all':this.route.timePeriod+'';

    let url:string;
    if(this.openCodes.length>0) {
      //const url:string = this.model.config.serviceURL+'?period='+this.model.timePeriodType+'&action=getProductsListTop&&direction='+direction+'&limit='+count;
      url = this.model.config.serviceURL +'?period='+this.route.timePeriodType+'&action=getCSV&productID=' +this.productCode + '&direction=' + (this.model.route.direction === 'import' ? 'imp' : 'exp') + '&time=' + year + '&countryID=' + country + '&openIDS=' + this.openCodes.join('-')+'&allProductNames='+allProductNames+'&allCountriesNames='+allCountriesNames;
    }else{
      url = this.model.config.serviceURL +'?period='+this.route.timePeriodType+'&action=getCSV&productID=' + this.productCode + '&direction=' + (this.model.route.direction === 'import' ? 'imp' : 'exp') + '&time=' + year + '&countryID=' + country+ '&openIDS=none&allProductNames='+allProductNames+'&allCountriesNames='+allCountriesNames;
    }
    const fileName:string = this.model.route.direction+'_'+this.model.selectedProductsService.selectedProduct.code+'_'+(allYears===false?this.route.timePeriod:'all_years')+'_'+(allCountries===false?this.route.countryCode:'all_countries')+'.csv'
    this.http.get(url,{responseType: 'text'}).subscribe((data:string) => this.downloadCSVDone(data,fileName));
    */
  }
  private downloadCSVDone=(data:string,fileName:string):void=>{
    /*
    if(data.length>0){
      this.onModalDataReadyUpdate.emit('update');
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]),data], {type: 'text/csv;charset=utf-8;'});
      FileSaver.saveAs(blob, fileName);
    }else{
      this.onModalDataErrorUpdate.emit('update');
    }
    */
  }


}
