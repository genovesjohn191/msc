import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  McsErrorHandlerService,
  McsHttpStatusCode,
  McsAccessControlService
} from '../../../core';

@Injectable()
export class MediasGuard implements CanActivate {

  constructor(
    private _accessControlService: McsAccessControlService,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  /**
   * Load route if media catalog was feature flag, otherwise it
   * will navigate to 404 page
   * @param route Route
   */
  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean>|Promise<boolean>|boolean {
    if (this._accessControlService.hasAccessToFeature('enableMediaCatalog')) {
      return true;
    } else {
      this._errorHandlerService.handleHttpRedirectionError(McsHttpStatusCode.NotFound);
      return false;
    }
  }
}
