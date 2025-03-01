import { Injectable } from '@angular/core';
import {ModelService} from "../../model.service";
import {HttpClient, HttpUrlEncodingCodec} from '@angular/common/http';
import {Router} from "@angular/router";
import {LoggerService} from "../../log/logger.service";

@Injectable()

export class RouteService {

  public model:ModelService;

  constructor(private http: HttpClient, private router:Router,private logger:LoggerService) {
    this.logger.enabled = false;
  }

  public initialize(model:ModelService){
    this.model = model;
  }

  public saveRouteURL=(url:string):void=>{
    if(this.model.READY===false){ return;}
    const route:string = (this.model.config.hostName+url).replace(/\//g, '^');
/*     this.logger.log('*****************');
     this.logger.log('MODEL - saveRouteURL');
     this.logger.log('url: '+route);
     this.logger.log('*****************');*/
    this.http.post(this.model.config.serviceURL+'?db=route', JSON.stringify({route:route})).subscribe(response => {
       //this.logger.dir(response);
    });
  }
}
