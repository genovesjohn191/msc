import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { McsTextContentProvider } from '../providers/mcs-text-content.provider';
import { McsSafeToNavigateAway } from '../interfaces/mcs-safe-to-navigate-away.interface';

@Injectable()
export class McsNavigateAwayGuard implements CanDeactivate<McsSafeToNavigateAway> {

  constructor(private _textContent: McsTextContentProvider) {}

  public canDeactivate(target: McsSafeToNavigateAway) {
    if (!target.safeToNavigateAway()) {
      let message = this._textContent.content.shared.safeToNavigateAway.message;
      return window.confirm(message);
    }

    return true;
  }
}
