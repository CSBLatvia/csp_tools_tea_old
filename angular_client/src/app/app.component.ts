import {Component, OnInit} from '@angular/core';
import {ModelService} from "./model/model.service";
import {RouteVO} from "./model/vo/RouteVO";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent  implements OnInit {

  public route:RouteVO;
  public title:string = 'angular-client';

  constructor(public model:ModelService) {
    this.route = model.route;
  }
  ngOnInit() { }
}
