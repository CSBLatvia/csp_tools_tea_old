import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslationVO} from "../model/vo/TranslationVO";
import {RouteVO} from "../model/vo/RouteVO";
import {ModelService} from "../model/model.service";
import {Location} from "@angular/common";
import {ItemApiVO} from "../model/vo/ItemApiVO";

@Component({
  selector: 'app-about-api-view',
  templateUrl: './about-api-view.component.html',
  styleUrls: ['./about-api-view.component.scss']
})
export class AboutApiViewComponent implements OnInit,OnDestroy {


  public title:TranslationVO;
  public description:TranslationVO;
  public route:RouteVO;
  public initialized:boolean = false;
  public serviceURL:string='';

  public items:Array<ItemApiVO>=[];
  public HOST:string;

  private onModelReadyListener:any;
  private onLanguageUpdateListener:any;


  constructor(private model: ModelService,private location: Location) { }

  ngOnInit() {
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    if(this.model.READY===true){
      this.initialize();
    }
  }
  ngOnDestroy() {
    this.onModelReadyListener.unsubscribe();
    this.onLanguageUpdateListener.unsubscribe();
  }

  private onModelReady=():void=>{
    this.initialize();
  }
  initialize():void{
    if(this.initialized===true){return;}
    this.HOST = this.model.config.hostName;
    this.serviceURL = this.model.config.serviceURL;
    this.route = this.model.getRoute();
    this.title = this.model.translations.item('api-title');
    this.description = this.model.translations.item('api-description');

    /////////////////////////////////////////////////
    this.items=[
      new ItemApiVO(this.returnItemAPIByName('api-f1')),
      new ItemApiVO(this.returnItemAPIByName('api-f2')),
      new ItemApiVO(this.returnItemAPIByName('api-f3')),
      new ItemApiVO(this.returnItemAPIByName('api-f4')),
      new ItemApiVO(this.returnItemAPIByName('api-f5')),
      new ItemApiVO(this.returnItemAPIByName('api-f6')),
      new ItemApiVO(this.returnItemAPIByName('api-f7')),
      new ItemApiVO(this.returnItemAPIByName('api-f8')),
      new ItemApiVO(this.returnItemAPIByName('api-f9')),
      new ItemApiVO(this.returnItemAPIByName('api-f10')),
      new ItemApiVO(this.returnItemAPIByName('api-f11')),
      new ItemApiVO(this.returnItemAPIByName('api-f12')),
      new ItemApiVO(this.returnItemAPIByName('api-f13'))
    ];
    this.items.forEach((vo:ItemApiVO)=>{
      vo.lang = this.route.lang;
    })
    this.onLanguageUpdate();
    this.initialized = true;
  }
  private returnItemAPIByName=(name:string):Array<TranslationVO>=>{
    let arr:Array<TranslationVO> = [
        this.model.translations.item(name),
        this.model.translations.item(name+'-descr'),
        this.model.translations.item(name+'-url'),
        this.model.translations.item(name+'-table')
    ];
    //console.dir(arr);
    arr[2].replaceString('[host]',this.model.config.hostURL,this.model.config.hostURL);
    return arr;
  }
  private onLanguageUpdate=():void=>{
    this.route = this.model.getRoute();
    this.items.forEach((vo:ItemApiVO)=>{
      vo.lang = this.route.lang;
    });
    this.title.lang = this.route.lang;
    this.description.lang = this.route.lang;
  }
  public close=():void=>{
    this.location.back();
  }

}
