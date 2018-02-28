import {
  Component,
  OnInit,
  Input,
  OnChanges,
  NgZone,
  HostListener
} from '@angular/core';
/** Services/Providers */
import {
  McsApiJob,
  McsDataStatus,
  McsNotificationContextService,
  CoreDefinition
} from '../../../core';
import {
  formatDate,
  refreshView
} from '../../../utilities';

@Component({
  selector: 'mcs-state-change-notification',
  templateUrl: './state-change-notification.component.html',
  styleUrls: ['./state-change-notification.component.scss']
})

export class StateChangeNotificationComponent implements OnInit, OnChanges {
  @Input()
  public attribute: McsApiJob;

  @Input()
  public pauseOnHover: boolean;

  public iconStatusKey: string;
  public iconStatusColor: any;
  public slideTrigger: string;

  private _timer: any;
  private _timeStart: any;
  private _timeRemaining: any;
  private _timeOut: number;

  public get displayErrorMessage(): boolean {
    return this.attribute.dataStatus === McsDataStatus.Error;
  }

  public constructor(
    private _ngZone: NgZone,
    private _notificationContextService: McsNotificationContextService
  ) {
    this.pauseOnHover = true;
    this.attribute = new McsApiJob();
  }

  public ngOnInit() {
    this.slideTrigger = 'slideInLeft';
  }

  public ngOnChanges() {
    this._setIconAndTimeOut(this.attribute);
    if (this._timeOut) {
      this._removeNotification(this._timeOut);
    }
  }

  @HostListener('focusin')
  @HostListener('mouseenter')
  public onMouseEnter() {
    if (this.pauseOnHover) {
      this._pauseTimeOut();
    }
  }

  @HostListener('focusout')
  @HostListener('mouseleave')
  public onMouseLeave() {
    if (this.pauseOnHover) {
      this._resumeTimeOut();
    }
  }

  public getStartTime(): string {
    let time: string;
    if (this.attribute.startedOn) {
      time = formatDate(this.attribute.startedOn, 'LT');
    } else {
      time = '';
    }
    return time;
  }

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_WHITE;
  }

  public onClickCloseBtn(): void {
    this._removeNotification(0);
  }

  private _setIconAndTimeOut(notification: McsApiJob): void {
    switch (notification.dataStatus) {
      case McsDataStatus.InProgress:
        this.iconStatusKey = CoreDefinition.ASSETS_GIF_SPINNER;
        this.iconStatusColor = 'black';
        break;

      case McsDataStatus.Error:
        this.iconStatusKey = CoreDefinition.ASSETS_FONT_CLOSE;
        this.iconStatusColor = 'red';
        this._timeOut = CoreDefinition.NOTIFICATION_FAILED_TIMEOUT;
        break;

      case McsDataStatus.Success:
        this.iconStatusKey = CoreDefinition.ASSETS_FONT_CHECK;
        this.iconStatusColor = 'green';
        this._timeOut = CoreDefinition.NOTIFICATION_COMPLETED_TIMEOUT;
        break;

      default:
        break;
    }
  }

  private _setTimeRemaining(): void {
    let currentTime = new Date().getTime();
    if (!this._timeRemaining) { this._timeRemaining = this._timeOut; }
    this._timeRemaining = this._timeRemaining - (currentTime - this._timeStart);
  }

  private _pauseTimeOut(): void {
    this._setTimeRemaining();
    clearTimeout(this._timer);
  }

  private _resumeTimeOut(): void {
    if (this._timeRemaining) {
      this._removeNotification(this._timeRemaining);
    }
  }

  private _removeNotification(timeOut: number): void {
    this._timeStart = new Date().getTime();

    // Remove notification from the list when fade out animation is finished
    this._timer = refreshView(() => {
      this.slideTrigger = 'slideOutLeft';

      this._ngZone.runOutsideAngular(() => {
        refreshView(() => {
          this._notificationContextService
            .deleteNotificationById(this.attribute.id);
        }, CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
      });
    }, timeOut);
  }
}
