import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ModelService} from '../../model/model.service';
import {Observable} from 'rxjs';

@Injectable()
export class LandingService {



  constructor(private http: HttpClient,private model:ModelService) {}

  public loadAllLevels():Observable<any>{
    const url:string = this.model.config.serviceURL+'?action=levels';
    return this.http.get(url);
  }
  public loadAllDates():Observable<any>{
    const url:string = this.model.config.serviceURL+'?action=periods';
    return this.http.get(url);
  }


}
