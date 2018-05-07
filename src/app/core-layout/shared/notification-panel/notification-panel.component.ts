import {
  Component,
  OnInit,
  Input,
  Output,
  OnChanges,
  NgZone,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
/** Services/Providers */
import {
  McsApiJob,
  McsDataStatus,
  CoreDefinition
} from '../../../core';
import {
  formatDate,
  refreshView,
  isNullOrEmpty
} from '../../../utilities';
import { Router } from '@angular/router';

// Notification type
type notificationType = 'statechange' | 'running';

@Component({
  selector: 'mcs-notification-panel',
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'notification-panel-wrapper',
    '[class.notification-running-wrapper]': 'type === "running"',
    '[class.notification-statechange-wrapper]': 'type === "statechange"',
    '(mouseenter)': 'onMouseEnter()',
    '(focusin)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focusout)': 'onMouseLeave()',
  }
})

export class NotificationPanelComponent implements OnInit, OnChanges {
  // Icon strategy
  public iconStatusKey: string;
  public iconStatusColor: any;

  @Input()
  public notification: McsApiJob = new McsApiJob();

  @Input()
  public pauseOnHover: boolean = true;

  @Output()
  public remove = new EventEmitter<McsApiJob>();

  /**
   * Type of the notification panel to be displayed
   */
  @Input()
  public get type(): notificationType { return this._type; }
  public set type(value: notificationType) {
    this._type = value;
    this._changeDetectorRef.markForCheck();
  }
  private _type: notificationType = 'statechange';

  /**
   * Slider type to be trigger during the transition
   */
  private _animationTrigger: string;
  public get animationTrigger(): string { return this._animationTrigger; }
  public set animationTrigger(value: string) {
    if (value !== this._animationTrigger) {
      this._animationTrigger = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  // Timer variables
  private _timer: any;
  private _timeStart: any;
  private _timeRemainingInMilliSeconds: number;
  private _timeOutInMilliSeconds: number;

  public get closeIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CLOSE_WHITE;
  }

  public get bulletIconKey(): string {
    return CoreDefinition.ASSETS_FONT_BULLET;
  }

  /**
   * Returns the formatted started date of the job
   */
  public get startTimeText(): string {
    return isNullOrEmpty(this.notification) ?
      '' : formatDate(this.notification.startedOn, 'LT');
  }

  public constructor(
    private _ngZone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router
  ) { }

  public ngOnInit() {
    // Set the animation based on notification type
    this._triggerAnimation('enter');
  }

  public ngOnChanges() {
    this.initializeNotification(this.notification);

    // Set the timer gradually
    if (this._timeOutInMilliSeconds) {
      this._removeNotification(this._timeOutInMilliSeconds);
    }
  }

  /**
   * Event that emits when mouse enter the component element
   */
  public onMouseEnter() {
    if (this.pauseOnHover) {
      this._pauseTimeOut();
    }
  }

  /**
   * Event that emits when mouse leave the component element
   */
  public onMouseLeave() {
    if (this.pauseOnHover) {
      this._resumeTimeOut();
    }
  }

  /**
   * Event that triggers when the notification was closed manually
   */
  public removeNotification(): void {
    this._removeNotification(0);
  }

  /**
   * Event that triggers when the notification was clicked
   */
  public onClickNotification(): void {
    let hasLink = !isNullOrEmpty(this.notification) &&
      !isNullOrEmpty(this.notification.link);
    if (!hasLink) { return; }
    this._router.navigate([this.notification.link]);
  }

  /**
   * Sets the time remaining for the specific job
   */
  private _setTimeRemaining(): void {
    let currentTime = new Date().getTime();
    if (isNullOrEmpty(this._timeRemainingInMilliSeconds)) {
      this._timeRemainingInMilliSeconds = this._timeOutInMilliSeconds;
    }
    this._timeRemainingInMilliSeconds = this._timeRemainingInMilliSeconds -
      (currentTime - this._timeStart);
  }

  /**
   * Pause the current timer for the notification before it fades out
   */
  private _pauseTimeOut(): void {
    this._setTimeRemaining();

    let timerStarted = !isNullOrEmpty(this._timer);
    if (timerStarted) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  /**
   * Resume the timer of the notification before it fades out
   */
  private _resumeTimeOut(): void {
    if (this._timeRemainingInMilliSeconds) {
      this._removeNotification(this._timeRemainingInMilliSeconds);
    }
  }

  /**
   * Initializes the notification settings based on input
   */
  private initializeNotification(notification: McsApiJob): void {
    switch (notification.dataStatus) {
      case McsDataStatus.InProgress:
        this.iconStatusKey = CoreDefinition.ASSETS_GIF_SPINNER;
        this.iconStatusColor = 'black';
        break;
      case McsDataStatus.Error:
        this.iconStatusKey = CoreDefinition.ASSETS_FONT_CLOSE;
        this.iconStatusColor = 'red';
        this._timeOutInMilliSeconds = CoreDefinition.NOTIFICATION_FAILED_TIMEOUT_IN_MS;
        break;
      case McsDataStatus.Success:
        this.iconStatusKey = CoreDefinition.ASSETS_FONT_CHECK;
        this.iconStatusColor = 'green';
        this._timeOutInMilliSeconds = CoreDefinition.NOTIFICATION_COMPLETED_TIMEOUT_IN_MS;
        break;
      default:
        break;
    }
  }

  /**
   * Remove the notification panel based on the timer set
   */
  private _removeNotification(timeOut: number): void {
    this._timeStart = new Date().getTime();

    // Remove notification from the list when fade out animation is finished
    this._timer = refreshView(() => {
      this._triggerAnimation('leave');

      this._ngZone.runOutsideAngular(() => {
        refreshView(() => {
          this.remove.emit(this.notification);
        }, CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
      });
    }, timeOut);
  }

  /**
   * Trigger animation based on type
   */
  private _triggerAnimation(type: 'enter' | 'leave'): void {
    switch (type) {
      case 'enter':
        this.animationTrigger = this.type === 'running' ?
          'fadeIn' : 'slideInLeft';
        break;

      case 'leave':
      default:
        this.animationTrigger = this.type === 'running' ?
          'fadeOut' : 'slideOutLeft';
        break;
    }
    this._changeDetectorRef.markForCheck();
  }
}
