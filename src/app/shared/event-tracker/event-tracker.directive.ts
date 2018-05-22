import {
  Directive,
  Input } from '@angular/core';
import { GoogleAnalyticsEventsService } from '../../core';
import { coerceNumber } from '../../utilities';

@Directive({
  selector: '[mcsEventTracker]',
  host: {
    '(click)': 'onClick()'
  }
})

export class EventTrackerDirective {

  @Input()
  public eventCategory: string;

  @Input()
  public eventLabel: string;

  @Input()
  public set eventValue(value: number) {
    this._eventValue = coerceNumber(value, null);
  }
  private _eventValue: number;

  @Input('mcsEventTracker')
  public set eventTracker(value: string) {
    this._action = value;
  }
  private _action: string;

  constructor(private _ga: GoogleAnalyticsEventsService) {
  }

  public onClick(): void {
    this._ga.emitEvent(
      this.eventCategory,
      this._action + '-click',
      this.eventLabel,
      this._eventValue);
  }
}
