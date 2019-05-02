import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  getSafeProperty,
  isNullOrUndefined
} from '@app/utilities';
import { IMcsNavigateAwayGuard } from './mcs-navigate-away-guard.interface';

@Injectable()
export class McsNavigateAwayGuard implements CanDeactivate<IMcsNavigateAwayGuard> {

  constructor(private _translateService: TranslateService) { }

  public canDeactivate(target: IMcsNavigateAwayGuard) {
    let navigateAwayFunc = getSafeProperty(target, (obj) => obj.canNavigateAway);
    if (isNullOrUndefined(navigateAwayFunc)) {
      throw new Error(`The McsNavigateAwayGuard could not be recognized because
        the IMcsNavigateAwayGuard was not implement on the component.`);
    }

    if (!target.canNavigateAway()) {
      let message = this._translateService.instant('shared.safeToNavigateAway.message');
      return window.confirm(message);
    }
    return true;
  }
}
