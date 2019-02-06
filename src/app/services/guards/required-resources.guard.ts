import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { McsErrorHandlerService } from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import { HttpStatusCode } from '@app/models';
import { McsResourcesRepository } from '../repositories/mcs-resources.repository';

@Injectable()
export class RequiredResourcesGuard implements CanActivate {

  constructor(
    private _resourcesRepository: McsResourcesRepository,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this._resourcesRepository.getResourcesByFeature().pipe(
      map((resources) => {
        if (isNullOrEmpty(resources)) {
          this._errorHandlerService.redirectToErrorPage(HttpStatusCode.Forbidden);
          return false;
        }
        return true;
      })
    );
  }
}
