import {Component, OnDestroy, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {ModelService} from '../model/model.service';
import {TranslationVO} from '../model/vo/TranslationVO';
import {RouteVO} from "../model/vo/RouteVO";

@Component({
  selector: 'app-settings',
  templateUrl: './settings-view.component.html',
  styleUrls: ['./settings-view.component.scss']
})

export class SettingsViewComponent implements OnInit,OnDestroy {


  @ViewChild('settingsComponent', { read: ViewContainerRef, static: true }) settingsArea:ViewContainerRef;
  public route:RouteVO;

  public buttonMap:TranslationVO;
  public buttonAbout:TranslationVO;
  public buttonApi:TranslationVO;
  public title:TranslationVO;


  private onModelReadyListener:any;
  private onLanguageUpdateListener:any;
  //////////////////////////////
  public initialized:boolean = false;

  constructor(private model: ModelService){ }

  ngOnDestroy(): void {
    this.onModelReadyListener.unsubscribe();
    this.onLanguageUpdateListener.unsubscribe();
  }

  ngOnInit() {
    this.route = this.model.getRoute();
    this.onModelReadyListener = this.model.onModelReady.subscribe(this.onModelReady);
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
    if(this.model.READY===true){
      this.initialize();
    }
  }
  private onModelReady=():void=>{
    this.initialize();
  }
  initialize():void{
    if(this.initialized===true){return;}
    this.route = this.model.getRoute();
    this.buttonMap = this.model.translations.item('settings-button-map');
    this.buttonAbout= this.model.translations.item('settings-button-about');
    this.buttonApi= this.model.translations.item('settings-button-api');

    this.title = this.model.translations.item('tool-top-menu-title');
    this.initialized = true;
  }
  private onLanguageUpdate=():void=>{
    this.route = this.model.getRoute();
  }
  public close():void{
    this.settingsArea.element.nativeElement.parentElement.removeChild(this.settingsArea.element.nativeElement);
  }

}
