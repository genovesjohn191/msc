import { Directive } from '@angular/core';
import { Location } from '@angular/common';
import { isNullOrEmpty } from '@app/utilities';

@Directive({
  selector: '[mcsNavigateForward]',
  host: {
    '(click)': 'onClickHost($event)'
  }
})

export class NavigateForwardDirective {

  constructor(private _locationService: Location) { }

  /**
   * Event that emits when the host was clicked
   * @param mouseEvent Mouse event that triggers the event
   */
  public onClickHost(mouseEvent: MouseEvent): void {
    if (!isNullOrEmpty(mouseEvent)) {
      mouseEvent.preventDefault();
    }
    this._locationService.forward();
  }
}
