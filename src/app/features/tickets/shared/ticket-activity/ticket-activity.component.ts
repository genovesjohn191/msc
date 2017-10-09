import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { convertDateToStandardString } from '../../../../utilities';
import { CoreDefinition } from '../../../../core';
import {
  TicketActivity,
  TicketActivityType
} from '../../models';

@Component({
  selector: 'mcs-ticket-activity',
  templateUrl: './ticket-activity.component.html',
  styleUrls: ['./ticket-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketActivityComponent {

  /**
   * Activity of the ticket to be populated on the view
   */
  @Input()
  public get activity(): TicketActivity {
    return this._activity;
  }
  public set activity(value: TicketActivity) {
    if (this._activity !== value) {
      this._activity = value;
      this._changeDetectorRef.markForCheck();
    }
  }
  private _activity: TicketActivity;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this._activity = new TicketActivity();
  }

  public get activityIconKey(): string {
    return this.activity.type === TicketActivityType.Comment ?
      CoreDefinition.ASSETS_FONT_COMMENT :
      CoreDefinition.ASSETS_FONT_ATTACHMENT;
  }

  /**
   * Converts the date and time to string based on standard format
   * @param date Date to be converted
   */
  public convertDateTimeToString(date: Date): string {
    return convertDateToStandardString(date);
  }
}
