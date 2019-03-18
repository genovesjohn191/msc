import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { McsSafeToNavigateAway } from '@app/utilities';

@Injectable()
export class McsNavigateAwayGuard implements CanDeactivate<McsSafeToNavigateAway> {

  constructor(private _translateService: TranslateService) { }

  public canDeactivate(target: McsSafeToNavigateAway) {
    if (!target.safeToNavigateAway()) {
      let message = this._translateService.instant('shared.safeToNavigateAway.message');
      return window.confirm(message);
    }

    return true;
  }
}
