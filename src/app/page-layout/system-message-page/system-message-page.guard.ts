import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSafeProperty } from '@app/utilities';
import { McsApiService } from '@app/services';

@Injectable()
export class McsSystemMessagePageGuard implements CanActivate {

  constructor(private _apiService: McsApiService) { }

  public canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this._apiService.getActiveSystemMessages().pipe(
      map((response) => {
        return getSafeProperty(response.collection, (message) => message[0].isCritical, false);
      })
    );
  }
}
