import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ModelService} from '../model/model.service';
import {TranslationVO} from '../model/vo/TranslationVO';
import {Location} from '@angular/common';
import {RouteVO} from "../model/vo/RouteVO";

@Component({
  selector: 'app-about-view',
  templateUrl: './about-view.component.html',
  styleUrls: ['./about-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AboutViewComponent implements OnInit,OnDestroy {


  public title:TranslationVO;
  public buttonBack:TranslationVO;
  public description:TranslationVO;
  public urlVO:TranslationVO;
  public route:RouteVO;
  public initialized:boolean = false;

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

    this.route = this.model.getRoute();

    this.title = this.model.translations.item('about-view-title');
    this.description = this.model.translations.item('about-view-description');
    this.buttonBack = this.model.translations.item('about-view-close');

    this.onLanguageUpdate();
    this.initialized = true;
  }
  private onLanguageUpdate=():void=>{
    this.route = this.model.getRoute();
    this.title.lang = this.route.lang;
    this.description.lang = this.route.lang;
    this.buttonBack.lang = this.route.lang;
  }
  public close=():void=>{
    this.location.back();
  }

}
