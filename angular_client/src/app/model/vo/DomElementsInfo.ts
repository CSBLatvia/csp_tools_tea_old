import {DomVO} from "./DomVO";
import {EventEmitter, Inject, Injectable} from "@angular/core";

import {WindowRefService} from "../services/window/window-ref.service";
import {DOCUMENT} from "@angular/common";

@Injectable({
  providedIn: 'root'
})

export class DomElementsInfo{

  public header:DomVO = new DomVO();
  public footer:DomVO = new DomVO();
  public mapMenu:DomVO = new DomVO();

  public settingsDataSortType:number = 3; // 1- territory name, 2-territory code, 3-count, 4-change

  ///////////////////////////////////////////
  public mapSettingsVisible:boolean = false;
  public mapIsFullScreen:boolean = false;
  public legendIsVisible:boolean = false;
  public isMobile:boolean = false;
  public screenshot:boolean = false;
  ////////////////////////////////////////////////

  public ww:number;
  public hh:number;
  public dpi:number;
  public wwR:number;
  public hhR:number;


  public onUpdate:EventEmitter<DomElementsInfo> = new EventEmitter<DomElementsInfo>();

  constructor(public window: WindowRefService,  @Inject(DOCUMENT) public document: Document) {
    this.window.nativeWindow.addEventListener('resize',this.onHostResize);
    this.window.nativeWindow.addEventListener('orientationchange',this.onHostOrientationChange);
    this.window.nativeWindow.addEventListener('scroll',this.onHostScroll);



    this.onResize();
  }
  public update():void{
    let AH:number = this.hh - this.header.height - this.footer.height;
    this.document.documentElement.style.setProperty("--AH", AH + "px");
    this.document.documentElement.style.setProperty("--HH", this.hh + "px");
    this.onUpdate.emit(this);
  }
  private onHostResize=(event:Event):void=>{
    this.onResize();
  }
  private onHostScroll=(event:Event):void=>{
    this.onResize();
  }

  private onHostOrientationChange=(event:Event):void=>{
    this.onResize();
  }
  private onResize=():void=> {
    this.ww = this.window.nativeWindow.innerWidth;
    this.hh = this.window.nativeWindow.innerHeight;
    this.dpi = this.window.nativeWindow.devicePixelRatio || 1;

    this.isMobile = this.ww<=900?true:false;

    this.wwR = this.ww*this.dpi;
    this.hhR = this.hh*this.dpi;

    this.update();
  }



}
