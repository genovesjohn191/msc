import { Injectable, Optional } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { FusionApiConfig } from  './fusion-api.config';

@Injectable()
export class FusionApiHttpClientService {
  private host: string;

  constructor(private http: Http, @Optional() config: FusionApiConfig) {
    if (config) {
      this.host = config.host;
    }
  }

  public sayHello(): string {
    return 'host: ' + this.host;
  }

  public get(endpoint: string, options?: Object): Observable<Response> {
    return this.http
      .get(`${this.host + endpoint}`, {headers: this.getHeaders()});
  }

  public post(endpoint: string): Observable<Response> {
    return this.http
      .post(`${this.host + endpoint}`, {headers: this.getHeaders()});
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
