import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Subject,
  Observable
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  McsJob,
  Breakpoint,
  McsCompany,
  DataStatus,
  RouteKey,
  McsIdentity
} from '@app/models';
/** Services/Providers */
import {
  CoreRoutes,
  CoreDefinition,
  McsTextContentProvider,
  McsNotificationEventsService,
  McsBrowserService,
  McsAuthenticationService
} from '@app/core';
import {
  refreshView,
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  compareDates,
  replacePlaceholder,
  unsubscribeSubject
} from '@app/utilities';
import {
  EventBusPropertyListenOn,
  EventBusState
} from '@app/event-bus';
import { SwitchAccountService } from '../../shared';

@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserPanelComponent implements OnInit, OnDestroy {
  public notifications: McsJob[];
  public hasConnectionError: boolean;
  public textContent: any;
  public deviceType: Breakpoint;

  @ViewChild('notificationsPopover')
  public notificationsPopover: any;

  @ViewChild('userPopover')
  public userPopover: any;

  @EventBusPropertyListenOn(EventBusState.UserChange)
  public activeUser$: Observable<McsIdentity>;

  @EventBusPropertyListenOn(EventBusState.AccountChange)
  public activeAccount$: Observable<McsCompany>;

  private _destroySubject = new Subject<void>();

  /**
   * Returns the displayed notifications and ignore those who are already closed
   */
  public get displayedNotifications(): McsJob[] {
    return this.notifications.filter((job) => {
      return job.dataStatus === DataStatus.InProgress;
    });
  }

  /**
   * Returns true when there are active job to be displayed, otherwise false
   */
  public get hasNotification(): boolean {
    return this.displayedNotifications && this.displayedNotifications.length > 0;
  }

  /**
   * Returns 'View [total number of other active notifications] More'
   * if more than three notifications are created else just returns 'View More'
   */
  public get viewMoreNotificationsText(): string {
    return this.displayedNotifications.length > 3 ?
      replacePlaceholder(this.textContent.notifications.viewMoreCount,
        'count', `${this.displayedNotifications.length - 3}`) :
      this.textContent.notifications.viewMore;
  }

  public get bellIconKey(): string {
    return CoreDefinition.ASSETS_FONT_BELL;
  }

  public get userIconKey(): string {
    return CoreDefinition.ASSETS_SVG_USER_WHITE;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public get logoutIconKey(): string {
    return CoreDefinition.ASSETS_SVG_LOGOUT_WHITE;
  }

  public constructor(
    private _textContent: McsTextContentProvider,
    private _router: Router,
    private _notificationEvents: McsNotificationEventsService,
    private _browserService: McsBrowserService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authenticationService: McsAuthenticationService,
    private _switchAccountService: SwitchAccountService
  ) {
    this.hasConnectionError = false;
    this.notifications = new Array();
    this.deviceType = Breakpoint.Large;
  }

  public ngOnInit(): void {
    this.textContent = this._textContent.content.header.userPanel;
    this._listenToCurrentUserJob();
    this._listenToBrowserResize();
    this._listenToSwitchAccount();
  }

  public ngOnDestroy(): void {
    unsubscribeSubject(this._destroySubject);
  }

  /**
   * Navigate to notifications page to see all the jobs
   */
  public viewNotificationsPage(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Notifications)]);
  }

  /**
   * Event that emits when user logged out
   */
  public logout(event): void {
    event.preventDefault();
    this._authenticationService.logOut();
  }

  /**
   * Event that emits when user click on user panel
   */
  public clickUser(): void {
    if (isNullOrEmpty(this.userPopover)) { return; }
    refreshView(() => {
      this.notificationsPopover.close();
      this.userPopover.toggle();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Event that emits when notification panel is opened
   */
  public onOpenNotificationPanel(): void {
    let displayNotificationsPage = !this.hasNotification
      || this.deviceType !== Breakpoint.Large;
    if (displayNotificationsPage) { this.viewNotificationsPage(); }

    let mobileMode = this.deviceType !== Breakpoint.Large
      && !isNullOrEmpty(this.notificationsPopover);
    if (mobileMode) { this.notificationsPopover.close(); }
  }

  /**
   * Sort the notifications(jobs) in descending order from the date created
   */
  private _sortNotifications(): void {
    if (isNullOrEmpty(this.notifications)) { return; }
    this.notifications.sort((_first: McsJob, _second: McsJob) => {
      return compareDates(_second.createdOn, _first.createdOn);
    });
  }

  /**
   * Listen to current user job triggered
   */
  private _listenToCurrentUserJob(): void {
    this._notificationEvents.currentUserJob
      .pipe(takeUntil(this._destroySubject))
      .subscribe((notification) => {
        if (isNullOrEmpty(notification)) { return; }

        // Update or add the new notification based on job ID
        this.notifications = addOrUpdateArrayRecord(
          this.notifications,
          notification,
          false,
          (_existingJob: McsJob) => {
            return _existingJob.id === notification.id;
          });
        this._sortNotifications();
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listener for browser resize
   */
  private _listenToBrowserResize(): void {
    // Subscribe to browser service
    this._browserService.breakpointChange()
      .pipe(takeUntil(this._destroySubject))
      .subscribe((deviceType: Breakpoint) => {
        this.deviceType = deviceType;
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listen when user switch account to update the company name under user name
   */
  private _listenToSwitchAccount(): void {
    this._switchAccountService.activeAccountStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => {
        // Refresh the page when account is selected
        this._changeDetectorRef.markForCheck();
      });
  }
}
