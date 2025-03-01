import {TerritoryNameVO} from "./TerritoryNameVO";

export class ItemDataVO {


  public name:TerritoryNameVO = null;
  public code:string;
  public percentage:number;

  constructor(code:string,percentage:number){
    this.code = code;
    this.percentage = percentage;
  }

}
