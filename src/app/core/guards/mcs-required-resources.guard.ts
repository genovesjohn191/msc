import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNullOrEmpty } from '@app/utilities';
import {
  HttpStatusCode,
  McsResource,
  ServiceType
} from '@app/models';
import { McsResourcesRepository } from '@app/services';
import { McsErrorHandlerService } from '../services/mcs-error-handler.service';
import { McsAccessControlService } from '../authentication/mcs-access-control.service';
import { CoreDefinition } from '../core.definition';

@Injectable()
export class McsRequiredResourcesGuard implements CanActivate {

  constructor(
    private _accessControlService: McsAccessControlService,
    private _resourcesRepository: McsResourcesRepository,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this._getResourcesByAccess().pipe(
      map((resources) => {
        if (isNullOrEmpty(resources)) {
          this._errorHandlerService.redirectToErrorPage(HttpStatusCode.Forbidden);
          return false;
        }
        return true;
      })
    );
  }

  /**
   * Gets the resources based on access level
   */
  private _getResourcesByAccess(): Observable<McsResource[]> {
    return this._resourcesRepository.getAll().pipe(
      map((resources) => {
        let managedResourceIsOn = this._accessControlService.hasAccess(
          ['OrderEdit'], CoreDefinition.FEATURE_FLAG_ENABLE_CREATE_MANAGED_SERVER);

        return resources.filter(
          (resource) => resource.serviceType === ServiceType.SelfManaged ||
            (managedResourceIsOn && resource.serviceType === ServiceType.Managed)
        );
      })
    );
  }
}
