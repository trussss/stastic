import {
  Injectable,
} from '@angular/core';
import {
  Http,
  Response
} from '@angular/http';

import {
  Config,
} from './servicesGlobal';

// import {} from './../models/models';
import { Observable } from 'rxjs';

@Injectable()
export class HomeService {
  public constructor(
    private http: Http,
    private config: Config,
  ) {}

  public getData(
  ): Observable<any> {
    return this.http.get(
      this.config.serverUrl + `?getBase=1`)
  }


}
