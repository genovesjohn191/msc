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
import {
  McsJob,
  DataStatus,
  RouteKey,
} from '@app/models';
import {
  CommonDefinition,
  refreshView,
  isNullOrEmpty,
  getSafeProperty
} from '@app/utilities';

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
  public notification: McsJob = new McsJob();

  @Input()
  public pauseOnHover: boolean = true;

  @Output()
  public remove = new EventEmitter<McsJob>();

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

  public get closeIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CLOSE_WHITE;
  }

  public get bulletIconKey(): string {
    return CommonDefinition.ASSETS_SVG_BULLET;
  }

  public get dataStatusEnum(): any {
    return DataStatus;
  }

  public get timeOutInMilliSeconds(): number {
    let dataStatus = getSafeProperty(this.notification, (obj) => obj.dataStatus);
    if (dataStatus === DataStatus.Active) { return undefined; }
    return dataStatus === DataStatus.Success ?
      CommonDefinition.NOTIFICATION_COMPLETED_TIMEOUT_IN_MS :
      CommonDefinition.NOTIFICATION_FAILED_TIMEOUT_IN_MS;
  }

  public constructor(
    private _ngZone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    // Set the animation based on notification type
    this._triggerAnimation('enter');
  }

  public ngOnChanges() {
    // Set the timer gradually
    if (this.timeOutInMilliSeconds) {
      this._removeNotification(this.timeOutInMilliSeconds);
    }
  }

  public get routeKeyEnum(): any {
    return RouteKey;
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
   * Sets the time remaining for the specific job
   */
  private _setTimeRemaining(): void {
    let currentTime = new Date().getTime();
    if (isNullOrEmpty(this._timeRemainingInMilliSeconds)) {
      this._timeRemainingInMilliSeconds = this.timeOutInMilliSeconds;
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
        }, CommonDefinition.NOTIFICATION_ANIMATION_DELAY);
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
