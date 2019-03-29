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
import { Subscription } from 'rxjs';
import {
  McsJob,
  DataStatus
} from '@app/models';
import {
  unsubscribeSafely,
  addOrUpdateArrayRecord,
  isNullOrEmpty
} from '@app/utilities';
import { EventBusDispatcherService } from '@app/event-bus';
import { CoreEvent } from '@app/core/core.event';

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
  public notifications: McsJob[];
  public closedNotifications: McsJob[];
  public visible: boolean;

  private _currentUserJobHandler: Subscription;

  public constructor(
    private _eventDispatcher: EventBusDispatcherService,
    private _renderer: Renderer2,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.placement = 'left';
    this.notifications = new Array();
    this.closedNotifications = new Array();
    this.visible = true;
  }

  public ngOnInit() {
    this._registerEvents();
    this.setPlacement();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._currentUserJobHandler);
  }

  /**
   * Returns the displayed notifications and ignore those who are already closed
   */
  public get displayedNotifications(): McsJob[] {
    return this.notifications.filter((job) => {
      let jobClosed = this.closedNotifications
        .find((closedJob) => job.id === closedJob.id);
      return !jobClosed;
    });
  }

  /**
   * Event that emits when notification is removed
   * @param _job Job to be removed
   */
  public removeNotification(_job: McsJob): void {
    if (isNullOrEmpty(_job)) { return; }
    this.closedNotifications.push(_job);
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
   * Event that emits when the current user job has been received
   * @param job Job emitted on the current user
   */
  private _onCurrentUserJob(job: McsJob): void {
    if (isNullOrEmpty(job) || job.dataStatus === DataStatus.InProgress) { return; }
    this.notifications = addOrUpdateArrayRecord(
      this.notifications,
      job,
      false,
      (_existingJob: McsJob) => {
        return _existingJob.id === job.id;
      });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Register job events
   */
  private _registerEvents(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobCurrentUser, this._onCurrentUserJob.bind(this));
  }
}
