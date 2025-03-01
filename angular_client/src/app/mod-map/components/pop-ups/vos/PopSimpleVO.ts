import {TranslationVO} from "../../../../model/vo/TranslationVO";
import {ModelService} from "../../../../model/model.service";

export class PopSimpleVO{


  public title:TranslationVO;
  public code:string;

  constructor(model:ModelService, code:string){
    this.code = code;
    this.title = model.getRegionbyCode(code).name;
    this.title.lang = model.route.lang;
  }
}
