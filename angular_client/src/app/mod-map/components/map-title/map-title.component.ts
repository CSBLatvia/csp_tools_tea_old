import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TitlesVO} from "../../../model/vo/TitlesVO";
import {ModelService} from "../../../model/model.service";


@Component({
  selector: 'app-map-title',
  templateUrl: './map-title.component.html',
  styleUrls: ['./map-title.component.scss']
})
export class MapTitleComponent implements OnInit,OnDestroy {

  @Input() mobile:boolean = false;
  @Input() settingsVisible:boolean = false;
  @Input() lang:string;

  private initialized:boolean = false;
  private onModelReadyListener:any;
  private onSettingsVisibilityChangeListener:any;
  private onTitlesUpdateListener:any;
  public titlesVO:TitlesVO;



  constructor(private model:ModelService) { }

  ngOnDestroy():void{
    this.onModelReadyListener.unsubscribe();
    this.onTitlesUpdateListener.unsubscribe();
  }
  ngOnInit() {
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onTitlesUpdateListener = this.model.titlesService.onServiceChange.subscribe(this.onTitlesUpdate);

    if(this.model.READY===true){
      this.initialize();
    }
  }
  private onModelReady=():void=>{
    this.initialize();
  }
  private onTitlesUpdate=():void=>{
    this.titlesVO = this.model.titlesService.vo;
  }
  initialize():void {
    if(this.initialized===true){return;}
    this.initialized = true;
  }

}
