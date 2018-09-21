import {
  Directive,
  Input } from '@angular/core';
import { GoogleAnalyticsEventsService } from '@app/core';
import { coerceNumber } from '@app/utilities';

@Directive({
  selector: '[mcsEventTracker]',
  host: {
    '(click)': 'onClick()'
  }
})

export class EventTrackerDirective {

  @Input('mcsEventCategory')
  public set eventCategory(value: string) {
    this._eventCategory = value;
  }
  private _eventCategory: string;

  @Input('mcsEventLabel')
  public set eventLabel(value: string) {
    this._eventLabel = value;
  }
  private _eventLabel: string;

  @Input('mcsEventValue')
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
      this._eventCategory,
      this._action + '-click',
      this._eventLabel,
      this._eventValue);
  }
}
