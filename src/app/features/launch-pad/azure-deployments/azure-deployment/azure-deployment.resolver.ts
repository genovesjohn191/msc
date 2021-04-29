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
  McsTerraformDeployment
} from '@app/models';
import { McsApiService } from '@app/services';

@Injectable()
export class AzureDeploymentResolver implements Resolve<McsTerraformDeployment> {

  constructor(private _apiService: McsApiService) { }

  public resolve(route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<McsTerraformDeployment> {
    return this._apiService.getTerraformDeployment(route.paramMap.get('id'))
    .pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
