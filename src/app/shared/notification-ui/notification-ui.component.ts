import {
  Component,
  OnInit,
  Input,
  OnChanges,
  NgZone,
  HostListener
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  keyframes
} from '@angular/animations';

/** Services/Providers */
import {
  McsAssetsProvider,
  McsApiJob,
  McsNotificationContextService,
  CoreDefinition,
  formatDate
} from '../../core';

@Component({
  selector: 'mcs-notification-ui',
  templateUrl: './notification-ui.component.html',
  styles: [require('./notification-ui.component.scss')],
  animations: [
    trigger('fade', [
      // Fade-in from top
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('* => in', [
        style({ opacity: 0, transform: 'translateY(-3%)' }),
        animate('300ms ease-in-out')
      ]),
      // Fade-out from bottom
      state('out', style({ opacity: 0, transform: 'translateY(-3%)' })),
      transition('in => out', [
        style({ opacity: 1, transform: 'translateY(0)' }),
        animate('300ms ease-in-out')
      ]),
    ])
  ]
})

export class NotificationUiComponent implements OnInit, OnChanges {
  @Input()
  public attribute: McsApiJob;

  @Input()
  public pauseOnHover: boolean;

  public iconStatusClass: string;
  public animate: string;

  private _timer: any;
  private _timeStart: any;
  private _timeRemaining: any;
  private _timeOut: number;

  public constructor(
    private _ngZone: NgZone,
    private _notificationContextService: McsNotificationContextService,
    private _assetsProvider: McsAssetsProvider
  ) {
    this.pauseOnHover = true;
    this.attribute = new McsApiJob();
  }

  public ngOnInit() {
    this.animate = 'in';
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

  public displayErrorMessage(status: string): boolean {
    let isError: boolean = false;

    if (status) {
      isError = status.localeCompare(CoreDefinition.NOTIFICATION_JOB_TIMEDOUT) === 0 ||
        status.localeCompare(CoreDefinition.NOTIFICATION_JOB_FAILED) === 0 ||
        status.localeCompare(CoreDefinition.NOTIFICATION_JOB_CANCELLED) === 0;
    }
    return isError;
  }

  private _setIconAndTimeOut(notification: McsApiJob): void {
    switch (notification.status) {
      case CoreDefinition.NOTIFICATION_JOB_PENDING:
      case CoreDefinition.NOTIFICATION_JOB_ACTIVE:
        this.iconStatusClass = this._assetsProvider.getIcon('spinner');
        this.iconStatusClass += ' active';
        break;
      case CoreDefinition.NOTIFICATION_JOB_TIMEDOUT:
      case CoreDefinition.NOTIFICATION_JOB_FAILED:
      case CoreDefinition.NOTIFICATION_JOB_CANCELLED:
        this.iconStatusClass = this._assetsProvider.getIcon('close');
        this.iconStatusClass += ' failed';
        this._timeOut = CoreDefinition.NOTIFICATION_FAILED_TIMEDOUT;
        break;
      case CoreDefinition.NOTIFICATION_JOB_COMPLETED:
        this.iconStatusClass = this._assetsProvider.getIcon('check');
        this.iconStatusClass += ' completed';
        this._timeOut = CoreDefinition.NOTIFICATION_COMPLETED_TIMEDOUT;
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
    this._timer = setTimeout(() => {
      this.animate = 'out';

      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this._notificationContextService
            .deleteNotificationById(this.attribute.id);
        }, CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
      });
    }, timeOut);
  }
}
