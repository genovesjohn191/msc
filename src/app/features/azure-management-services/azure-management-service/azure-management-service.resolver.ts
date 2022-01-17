import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  McsApiErrorContext,
  McsAzureManagementService
} from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class AzureManagementServiceResolver implements Resolve<McsAzureManagementService> {

  constructor(private _apiService: McsApiService) { }

  public resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {
    return this._apiService.getAzureManagementServiceById(route.paramMap.get('id')).pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
