import { Subscription } from 'rxjs';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  DataStatus,
  McsJob
} from '@app/models';
import {
  addOrUpdateArrayRecord,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';

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
    this._registerEvents();
  }

  public ngOnInit() {
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
    if (isNullOrEmpty(job) || job.dataStatus === DataStatus.Active) { return; }
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
      McsEvent.jobCurrentUser, this._onCurrentUserJob.bind(this));

    this._eventDispatcher.dispatch(McsEvent.jobCurrentUser);
  }
}
