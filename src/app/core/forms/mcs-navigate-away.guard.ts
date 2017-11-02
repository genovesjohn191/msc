import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { McsSafeToNavigateAway } from '../interfaces/mcs-safe-to-navigate-away.interface';

@Injectable()
export class McsNavigateAwayGuard implements CanDeactivate<McsSafeToNavigateAway> {

  public canDeactivate(target: McsSafeToNavigateAway) {
    if (!target.safeToNavigateAway()) {
      let message = 'Your changes may not be saved. Are you sure you want to leave this page';
      return window.confirm(message);
    }

    return true;
  }
}
