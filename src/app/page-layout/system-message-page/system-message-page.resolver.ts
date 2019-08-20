import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  McsSystemMessage,
  McsApiErrorContext
} from '@app/models';
import { McsSystemMessageService } from '@app/core';

@Injectable()
export class SystemMessagePageResolver implements Resolve<McsSystemMessage> {

  constructor(private _systemMessageService: McsSystemMessageService) {}

  public resolve(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<any> {
    return this._systemMessageService.activeMessage().pipe(
      catchError((error) => McsApiErrorContext.throwPrimaryError(error))
    );
  }
}
