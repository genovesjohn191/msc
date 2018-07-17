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
import { ServerCreateService } from './server-create.service';

@Injectable()
export class ServerCreateGuard implements CanActivate {

  constructor(
    private _serverCreateService: ServerCreateService,
    private _errorHandlerService: McsErrorHandlerService
  ) { }

  public canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this._serverCreateService
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
