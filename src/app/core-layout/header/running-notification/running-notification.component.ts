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
  McsNotificationContextService,
  CoreDefinition,
  McsDataStatus
} from '../../../core';
import {
  formatDate,
  refreshView
} from '../../../utilities';

@Component({
  selector: 'mcs-running-notification',
  templateUrl: './running-notification.component.html',
  styleUrls: ['./running-notification.component.scss']
})

export class RunningNotificationComponent implements OnInit, OnChanges {
  @Input()
  public attribute: McsApiJob;

  @Input()
  public pauseOnHover: boolean;

  public iconStatusKey: string;
  public iconStatusColor: any;

  public get displayErrorMessage(): boolean {
    return this.attribute.dataStatus === McsDataStatus.Error;
  }

  /**
   * Trigger the animation based on the value
   */
  private _animateTrigger: string;
  public get animateTrigger(): string {
    return this._animateTrigger;
  }
  public set animateTrigger(value: string) {
    if (this._animateTrigger !== value) {
      this._animateTrigger = value;
    }
  }

  private _timer: any;
  private _timeStart: any;
  private _timeRemaining: any;
  private _timeOut: number;

  public constructor(
    private _ngZone: NgZone,
    private _notificationContextService: McsNotificationContextService
  ) {
    this.pauseOnHover = true;
    this.attribute = new McsApiJob();
  }

  public ngOnInit() {
    this.animateTrigger = 'fadeIn';
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
      this.animateTrigger = 'fadeOut';

      this._ngZone.runOutsideAngular(() => {
        refreshView(() => {
          this._notificationContextService.deleteNotificationById(this.attribute.id);
        }, CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
      });
    }, timeOut);
  }
}
