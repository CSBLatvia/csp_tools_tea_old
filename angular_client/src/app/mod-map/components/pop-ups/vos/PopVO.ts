import {RouteVO} from "../../../../model/vo/RouteVO";
import {TranslationVO} from "../../../../model/vo/TranslationVO";
import {ModelService} from "../../../../model/model.service";

export class PopVO{

  public route:RouteVO;
  public code:string;
  public title:TranslationVO;
  public textHTMLValue:string='';

  constructor(model:ModelService, code:string){
    this.route = model.getRoute();
    this.title = model.getRegionbyCode(code).name;
    this.title.lang = this.route.lang;
    this.code = code;
  }

  public update(value:string):void{
    this.textHTMLValue = value;
  }
}
