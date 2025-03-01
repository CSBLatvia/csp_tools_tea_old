import {Component, Input, OnInit} from '@angular/core';
import {DataTableVO} from '../../../../../../../../../model/vo/DataTableVO';

@Component({
  selector: 'app-settings-data-table-item',
  templateUrl: './settings-data-table-item.component.html',
  styleUrls: ['./settings-data-table-item.component.scss']
})
export class SettingsDataTableItemComponent implements OnInit {

  @Input() lang:string;
  @Input() vo:DataTableVO;
  @Input() arrowClass:string;
  @Input() roundValues:boolean = false;

  public open:boolean = false;

  private itemOpen:string='stack-block stack-block-expandable stack-block-expanded';
  private itemClose:string='stack-block stack-block-expandable';
  private itemLast:string='stack-block';



  constructor() { }

  ngOnInit(): void {
    this.arrowClass = this.vo.data.length>0?this.itemClose:this.itemLast;
  }
  public onItemClick=(item:DataTableVO):void=>{
      if(this.vo.data.length===0){return;}
      if(this.open === false){
        this.arrowClass = this.itemOpen;
        this.open = true;
      }else{
        this.arrowClass = this.itemClose;
        this.open = false;
      }

  }

}
