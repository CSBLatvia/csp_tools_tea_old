import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ControlValueVO} from "../../../ui-controls/vos/ControlValueVO";
import {ModelService} from "../../../model/model.service";

@Component({
  selector: 'map-layers-pop',
  templateUrl: './map-layers-pop.component.html',
  styleUrls: ['./map-layers-pop.component.scss']
})
export class MapLayersPopComponent implements OnInit,OnDestroy {


  @Input() mobile:boolean = false;
  @Input() visible:boolean = false;
  @Input() lang:string;
  @Input() radio_id:string = '';
  @Input() radio_values:Array<ControlValueVO>=[];
  @Input() onClose:any;
  @Input() onChange:any;

  public initialized:boolean = false;


  private onModelReadyListener:any;
  private onLanguageUpdateListener:any;



  constructor(private model:ModelService) {}
  ngOnDestroy():void{
    this.onModelReadyListener.unsubscribe();
    this.onLanguageUpdateListener.unsubscribe();
  }
  ngOnInit() {
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    if(this.model.READY===true && this.initialized===false){
      this.initialize();
    }
  }
  private onModelReady=():void=>{
    this.initialize();
  }
  private onLanguageUpdate=():void=>{
    if(this.initialized===false){return;}
    this.lang = this.model.route.lang;
    this.radio_values.forEach((item:ControlValueVO)=>{
      item.name.lang = this.lang;
    });
  }
  private initialize():void{
    if(this.initialized===true){return;}
    this.lang = this.model.route.lang;
    this.radio_values = [
      new ControlValueVO('map_light',this.model.translations.item('map-layer-light')),
      new ControlValueVO('map_dark',this.model.translations.item('map-layer-dark')),
      new ControlValueVO('map_osm',this.model.translations.item('map-layer-osm')),
      new ControlValueVO('map_orto',this.model.translations.item('map-layer-orto'))
    ];
    this.radio_id = this.model.MAP_POP_STYLE;
    this.initialized = true;
  }
  public onCloseClick=():void=>{
    this.visible = false;
    this.onClose();
  }
  public onRadioChange=(item:any):void=>{
    this.onChange(item.id);
    this.visible = false;
    this.onClose();
  }

}
