import { Injectable } from '@angular/core';
import {
  Headers,
  RequestOptions
} from '@angular/http';

@Injectable()
export class Config {

  private _serverUrl: string;
  private _token: string;
  private _requestOptions: RequestOptions;

  public constructor() {
    this._serverUrl = `http://pochti-vse.in.ua/test/backend.php`;
    this.setDefaultsOptions();
  }

  public setDefaultsOptions(): void {
    const headers: Headers = new Headers({'Content-Type': 'application/json'});
    const requestOptions: RequestOptions = new RequestOptions({headers: headers});
    this._requestOptions = requestOptions;
  }

  public set authToken(token: string) {
    const headers: Headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    });
    const requestOptions: RequestOptions = new RequestOptions({headers: headers});
    this._requestOptions = requestOptions;
    this._token = token;
  }

  public get requestOptions(): RequestOptions {
    return this._requestOptions;
  }

  public get serverUrl(): string {
    return this._serverUrl;
  }

}
