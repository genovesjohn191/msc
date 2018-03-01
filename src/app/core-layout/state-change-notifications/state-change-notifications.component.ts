import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Renderer2,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  McsApiJob,
  McsNotificationEventsService,
  McsDataStatus,
} from '../../core';
import {
  unsubscribeSafely,
  addOrUpdateArrayRecord,
  deleteArrayRecord,
  isNullOrEmpty
} from '../../utilities';

@Component({
  selector: 'mcs-state-change-notifications',
  templateUrl: './state-change-notifications.component.html',
  styleUrls: ['./state-change-notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'state-change-notifications-wrapper'
  }
})

export class StateChangeNotificationsComponent implements OnInit, OnDestroy {
  @Input()
  public placement: 'left' | 'right';

  @ViewChild('stateChangeNotificationsElement')
  public stateChangeNotificationsElement: ElementRef;

  // Notifications variable
  public notifications: McsApiJob[];
  public notificationsSubscription: any;
  public visible: boolean;

  public constructor(
    private _notificationEvents: McsNotificationEventsService,
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.placement = 'left';
    this.notifications = new Array();
    this.visible = true;
  }

  public ngOnInit() {
    // Listen to notifications change event of the current user profile
    this._listenToCurrentUserJob();

    // Set notifications placement
    this.setPlacement();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.notificationsSubscription);
  }

  /**
   * Event that emits when notification is removed
   * @param _job Job to be removed
   */
  public removeNotification(_job: McsApiJob): void {
    if (isNullOrEmpty(_job)) { return; }
    deleteArrayRecord(this.notifications, (notification: McsApiJob) => {
      return notification.id === _job.id;
    });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Sets the placement of the notifications
   */
  public setPlacement() {
    if (!this.stateChangeNotificationsElement) { return; }
    switch (this.placement) {
      case 'left':
        this._renderer.setStyle(this.stateChangeNotificationsElement.nativeElement,
          'left', '20px');
        break;

      case 'right':
      default:
        this._renderer.setStyle(this.stateChangeNotificationsElement.nativeElement,
          'right', '20px');
        break;
    }
  }

  /**
   * Listen to current user job triggered
   */
  private _listenToCurrentUserJob(): void {
    this.notificationsSubscription = this._notificationEvents.currentUserJob
      .subscribe((notification) => {
        if (isNullOrEmpty(notification) ||
          notification.dataStatus === McsDataStatus.InProgress) { return; }

        // Update or add the new notification based on job ID
        this.notifications = addOrUpdateArrayRecord(
          this.notifications,
          notification,
          false, (_first: McsApiJob, _second: McsApiJob) => {
            return _first.id === _second.id;
          });
        this._changeDetectorRef.markForCheck();
      });
  }
}
