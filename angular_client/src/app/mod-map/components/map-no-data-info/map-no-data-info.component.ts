import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {TranslationVO} from "../../../model/vo/TranslationVO";
import {ModelService} from "../../../model/model.service";

@Component({
  selector: 'map-no-data-info',
  templateUrl: './map-no-data-info.component.html',
  styleUrls: ['./map-no-data-info.component.scss']
})
export class MapNoDataInfoComponent implements OnInit,OnDestroy {

  public titleVO:TranslationVO;
  private onLanguageUpdateListener:any;

  constructor(private model: ModelService) { }

  ngOnInit(): void {
    this.titleVO = this.model.translations.item('map-no-data-info');
    this.titleVO.lang = this.model.route.lang;
    this.onLanguageUpdateListener = this.model.onLanguageUpdate.subscribe(this.onLanguageUpdate);
  }
  private onLanguageUpdate=():void=>{
    this.titleVO.lang = this.model.route.lang;
  }
  ngOnDestroy(){
    this.onLanguageUpdateListener.unsubscribe();
  }

}
