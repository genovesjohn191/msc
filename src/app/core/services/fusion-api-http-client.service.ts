import { Injectable, Optional } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { FusionApiConfig } from  './fusion-api.config';

@Injectable()
export class FusionApiHttpClientService {
  private _host: string;

  constructor(private _http: Http, @Optional() config: FusionApiConfig) {
    if (config) {
      this._host = config.host;
    }
  }

  public sayHello(): string {
    return 'host: ' + this._host;
  }

  public get(endpoint: string): Observable<any> {
    return this._http
      .get(`${this._host + endpoint}`, {headers: this.getHeaders()})
      .map((response) => response.json())
      ._catch(this.handleError);
  }

  public post(endpoint: string, data: any): Observable<any> {
    return this._http
      .post(`${this._host + endpoint}`, JSON.stringify(data), {headers: this.getHeaders()})
      .map((response) => response.json())
      ._catch(this.handleError);
  }

  public put(endpoint: string, data: any): Observable<any> {
    return this._http
      .put(`${this._host + endpoint}`, JSON.stringify(data), {headers: this.getHeaders()})
      .map((response) => response.json())
      ._catch(this.handleError);
  }

  public delete(endpoint: string): Observable<any> {
    return this._http
      .delete(`${this._host + endpoint}`, {headers: this.getHeaders()})
      .map((response) => response.json())
      ._catch(this.handleError);
  }

  private getHeaders() {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    // Appened security parameters
    return headers;
  }

  private extractData(res: Response) {
    // Extracting will depend on how the server provides response
    // This needs to be updated
    let body = res.json();
    // return body.data || { };
    return body;
  }

  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    console.error('Error thrown from fusion api client service.');
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }

    console.error('MFP Errors: ' + errMsg);
    return Observable.throw(errMsg);
  }

}
