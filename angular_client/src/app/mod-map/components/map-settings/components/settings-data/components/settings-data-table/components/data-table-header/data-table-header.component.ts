import {AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {RouteVO} from "../../../../../../../../../model/vo/RouteVO";
import {TranslationVO} from "../../../../../../../../../model/vo/TranslationVO";
import {TitlesVO} from "../../../../../../../../../model/vo/TitlesVO";
import {ModelService} from "../../../../../../../../../model/model.service";
import {DataTableVO} from "../../../../../../../../../model/vo/DataTableVO";


@Component({
  selector: 'app-data-table-header',
  templateUrl: './data-table-header.component.html',
  styleUrls: ['./data-table-header.component.scss']
})
export class DataTableHeaderComponent implements OnInit,OnDestroy,AfterViewInit {

  public type:number = 1; // 1-regular, 2-overlay
  public containerClass:string;
  public showSortOverlay:boolean = false;
  //////////////////////////////////////////////////
  public lang:string;

  private route:RouteVO;
  private initialized:boolean = false;
  private onModelReadyListener:any;
  private onLanguageUpdateListener:any;
  private onSettingsChangeListener:any;
  private onTitlesUpdateListener:any;
  private onDataSortedListener:any;
  private onSortOverlayChangeListener:any;

  public downloadButtonLabelVO:TranslationVO;
  public downloadButtonVO:TranslationVO;

  public titleDownload:TranslationVO;
  public titleRegionCode:TranslationVO;
  public titleRegionName:TranslationVO;
  public titleValueOne:TranslationVO;
  public titleValueTwo:TranslationVO;

  public sort_order_one:number = 1; // -1
  public sort_order_two:number = 1; // -1
  public sort_order_three:number = 1; // -1
  public sortType:number = 2;

  private observerHead:IntersectionObserver;
  private headBlock:HTMLElement;

  public titlesVO:TitlesVO;





  constructor(private model:ModelService) { }

  ngOnDestroy():void{
    this.onModelReadyListener.unsubscribe();
    this.onLanguageUpdateListener.unsubscribe();
    this.onSettingsChangeListener.unsubscribe();
    this.onTitlesUpdateListener.unsubscribe();
    this.onDataSortedListener.unsubscribe();
    this.onSortOverlayChangeListener.unsubscribe();
  }
  ngOnInit() {
    this.onResize();
    if(this.type===1){
      this.containerClass = 'container';
    }else{
      this.containerClass = 'container-overlay';
    }
    this.route = this.model.getRoute();
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    this.onSettingsChangeListener = this.model.settings.onServiceChange.subscribe(this.onSettingsChange);
    this.onTitlesUpdateListener = this.model.titlesService.onServiceChange.subscribe(this.onTitlesUpdate);
    this.onDataSortedListener = this.model.dataService.onDataSorted.subscribe(this.onDataSorted);
    this.onSortOverlayChangeListener = this.model.dataService.onSortOverlayChange.subscribe(this.onSortOverlayChange);

    if(this.model.READY===true){
      this.initialize();
    }
  }
  ngAfterViewInit(): void {

      this.headBlock = document.getElementById('data-dummy');

      this.observerHead = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          //this.logger.dir('ratio:'+entry.intersectionRatio);
          if (entry.intersectionRatio > 0) {
            this.type = 1;
            this.checkVisibility();
          } else {
            this.type = 2;
            this.checkVisibility();
          }
        });
      });

      this.observerHead.observe(this.headBlock);
      this.checkVisibility();
  }
  private checkVisibility=():void=>{
     //this.logger.log('checkVisibility - type:'+this.type);
  }

  private onModelReady=():void=>{
    this.initialize();
  }
  private onLanguageUpdate=():void=>{
    this.lang = this.model.route.lang;
    if(this.initialized===false){return;}
    this.updateLocalizations();
  }
  private onSettingsChange=():void=>{
    if(this.initialized===false){return;}
    this.lang = this.model.route.lang;
    if(this.route.isEqual(this.model.getRoute())===false){
      this.route = this.model.getRoute();
    }
    this.updateLocalizations();
  }
  private onTitlesUpdate=():void=>{
    this.titlesVO = this.model.titlesService.vo;
  }

  initialize():void {
    if(this.initialized===true){return;}
    this.route = this.model.getRoute();
    this.updateSortParameters();
    this.updateLocalizations();
    this.initialized = true;
  }
  private updateLocalizations=():void=>{
    this.lang = this.model.route.lang;
    this.titleDownload = this.model.translations.item('table-download');
    this.titleRegionCode = this.model.translations.item('csv-column-region-code');
    this.titleRegionName = this.model.translations.item('csv-column-region-name');
    this.titleValueOne = this.model.translations.item('csv-column-one_'+this.route.M1 + '_' + this.route.M2);
    this.titleValueTwo = this.model.translations.item('csv-column-two_' + this.route.M1 + '_' + this.route.M2);


    this.downloadButtonLabelVO = this.model.translations.item('table-download-label');
    this.downloadButtonVO = this.model.translations.item('table-download');

  }
  private onSortOverlayChange=():void=>{
    if(this.type===1) { return;}
    this.showSortOverlay = this.model.dataService.showSortOverlay;
  }
  private onDataSorted=():void=>{
    this.updateSortParameters();
  }
  private updateSortParameters=():void=>{
    this.sortType = this.model.dataService.sortType;
    this.sort_order_one = this.model.dataService.sort_order_one;
    this.sort_order_two = this.model.dataService.sort_order_two;
    this.sort_order_three = this.model.dataService.sort_order_three;
  }

  public onSortClick=(id:number):void=>{
    this.model.dataService.sort(id);
  }

  private downloadCSV=(fileName:string, fileString:string):void=> {
    const blob:any = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]),fileString],{ type: 'text/plain;charset=utf-8' });
    if ((window.navigator as any).msSaveOrOpenBlob){
      (window.navigator as any).msSaveBlob(blob, fileName);
    }else {
      const a:any = window.document.createElement('a');
      a.id = fileName;
      a.href = window.URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
  public onDownloadClick=():void=>{
    if(this.route.M3==='none'){
      ///////////////////////////////////////////////////
      const columns:Array<string>  = [this.titleRegionCode.name, this.titleRegionName.name, this.titleValueOne.name,this.titleValueTwo.name];
      let csv:string = columns.join('\t')+'\n';

      this.model.dataService.data.forEach((item:DataTableVO)=>{
        csv += [item.title.id, item.title.name, item.value, item.value_calc].join('\t')+'\n';
      });
      this.downloadCSV(this.getFileNameByRoute(), csv);
      ///////////////////////////////////////////////////
    }
    if(this.route.M3!=='none' && this.route.M4==='none'){
      ///////////////////////////////////////////////////
      const columns:Array<string>  = [this.titleRegionCode.name, this.titleRegionName.name,this.model.translations.item('csv-'+this.route.M3).name, this.titleValueOne.name,this.titleValueTwo.name];
      let csv:string = columns.join('\t')+'\n';

      this.model.dataService.data.forEach((item:DataTableVO)=>{
        const region:TranslationVO = item.title;
        let property:TranslationVO = this.model.translations.item('csv-total');
        csv += [item.title.id, region.name, property.name, item.value, item.value_calc].join('\t')+'\n';

        item.data.forEach((vo:DataTableVO)=>{
          property = vo.title;
          csv += [region.id, region.name, property.name ,vo.value, vo.value_calc].join('\t')+'\n';
        });
      });
      this.downloadCSV(this.getFileNameByRoute(), csv);
      ///////////////////////////////////////////////////
    }
    if(this.route.M3!=='none' && this.route.M4!=='none'){
      ///////////////////////////////////////////////////
      const columns:Array<string>  = [this.titleRegionCode.name, this.titleRegionName.name, this.titleValueOne.name, this.titleValueTwo.name];
      let csv:string = columns.join('\t')+'\n';

      this.model.dataService.data.forEach((item:DataTableVO)=>{
        csv += [item.title.id, item.title.name, item.value, item.value_calc].join('\t')+'\n';
      });
      this.downloadCSV(this.getFileNameByRoute(), csv);
      ///////////////////////////////////////////////////
    }
  }
  private getFileNameByRoute():string{

    const assoc:string = this.model.translations.item('file-assoc').name;
    const m1_name:TranslationVO = this.model.translations.item('file-m1-'+this.route.M1);
    const m2_name:TranslationVO = this.model.translations.item('file-m2-'+this.route.M2);

    const m3_name:TranslationVO = this.model.translations.item('file-m3-'+this.route.M3);
    const m3_top_name:TranslationVO = this.model.translations.item('file-m3-top-'+this.route.M3);

    const t1_name:TranslationVO = this.model.translations.item('file-t1-'+this.route.T1);
    const t2_all:TranslationVO = this.model.translations.item('file-all-country');

    let str:string='';
    const region_t2_str:string = this.route.T2==='all'?t2_all.name:this.route.T2;

    if(this.route.M3==='none'){
      str = this.route.year+'_'+m1_name.name+'_'+m2_name.name+'_'+t1_name.name+'_'+region_t2_str;
    }else if(this.route.M3!=='none' && this.route.M4==='none'){
      str = this.route.year+'_'+m1_name.name+'_'+m2_name.name+'_'+m3_top_name.name+'_'+t1_name.name+'-'+region_t2_str;
    }else if(this.route.M3!=='none' && this.route.M4!=='none'){
      str = this.route.year+'_'+m1_name.name+'_'+m2_name.name+'_'+m3_name.name+'-'+this.route.M4+'_'+t1_name.name+'-'+region_t2_str;
    }
    return str.toLowerCase()+'.'+assoc;

  }




  /////////////////////
  @HostListener('window:resize', ['$event'])
  onHostResize(event:Event){
    this.onResize();
  }

  @HostListener('window:orientationchange', ['$event'])
  onHostOrientationChange(event:Event){
    this.onResize();
  }

  onResize() {
    const win:any = window;
    const ww = +win.innerWidth;
  }

}
