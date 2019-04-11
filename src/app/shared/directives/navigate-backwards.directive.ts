import { Directive } from '@angular/core';
import { Location } from '@angular/common';
import { isNullOrEmpty } from '@app/utilities';

@Directive({
  selector: '[mcsNavigateBackward]',
  host: {
    '(click)': 'onNavigateBack($event)',
  }
})

export class NavigateBackwardDirective {

  constructor(private _location: Location) { }

  /**
   * Listen to click event and navigate back to the previous route
   * @param mouseEvent Mouse event that triggers the event
   */
  public onNavigateBack(mouseEvent: MouseEvent) {
    if (!isNullOrEmpty(mouseEvent)) {
      mouseEvent.preventDefault();
    }
    this._location.back();
  }
}
