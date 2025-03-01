import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {RouteVO} from "../../../model/vo/RouteVO";
import {ModelService} from "../../../model/model.service";
import {LoggerService} from "../../../model/log/logger.service";
import {DomElementsInfo} from "../../../model/vo/DomElementsInfo";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit,OnChanges {

  @Input() route:RouteVO;
  @Input() lang:string;
  @Input() mobile:boolean;
  @Input() screenshot:boolean;

  @Input() settingsVisible:boolean;
  @Input() legendIsVisible:boolean;
  @Input() mapIsFullScreen:boolean;
  @Input() initialized:boolean = false;

  private onDomUpdateListener:any;



  constructor(private model:ModelService, private dom:DomElementsInfo, private logger:LoggerService) {
    this.mobile = this.model.dom.isMobile;
    this.screenshot = this.model.dom.screenshot;
    this.logger.enabled = false;
  }

  ngOnInit(): void {
    this.onDomUpdateListener = this.dom.onUpdate.subscribe(this.onDomElementsUpdate);
    this.onResize();
  }
  ngOnChanges(changes: SimpleChanges) {}

  public onSettingsChange=(value:boolean):void=>{
    this.dom.mapMenu.visible = value;
    this.dom.mapMenu.update();
  }
  public onFullScreenChange=(value:boolean):void=>{
    this.dom.mapIsFullScreen = value;
    this.dom.update();
  }
  public onLegendChange=(value:boolean):void=>{
    this.dom.legendIsVisible = value;
    this.dom.update();
  }

  private onDomElementsUpdate=():void=>{
    this.onResize();
  }
  public onResize=():void=>{
  }

}
