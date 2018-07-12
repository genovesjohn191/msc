import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  McsHttpStatusCode,
  McsErrorHandlerService
} from '../../../core';
import { isNullOrEmpty } from '../../../utilities';
import { CreateServerService } from './create-server.service';

@Injectable()
export class CreateServerGuard implements CanActivate {

  constructor(
    private _createServerService: CreateServerService,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this._createServerService
      .getCreationResources()
      .pipe(
        map((resources) => {
          if (isNullOrEmpty(resources)) {
            this._errorHandlerService.handleHttpRedirectionError(McsHttpStatusCode.Forbidden);
            return false;
          }
          return true;
        })
      );
  }
}
