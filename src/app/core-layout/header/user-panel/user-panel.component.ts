import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  Subject,
  Observable,
  Subscription
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
  CoreEvent,
  McsBrowserService,
  McsAuthenticationService
} from '@app/core';
import {
  refreshView,
  isNullOrEmpty,
  addOrUpdateArrayRecord,
  compareDates,
  unsubscribeSafely
} from '@app/utilities';
import {
  EventBusPropertyListenOn,
  EventBusDispatcherService
} from '@app/event-bus';
import { SwitchAccountService } from '../../shared';

const NOTIFICATIONS_COUNT_LIMIT = 3;
@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserPanelComponent implements OnInit, OnDestroy {
  public notifications: McsJob[];
  public hasConnectionError: boolean;
  public deviceType: Breakpoint;

  @ViewChild('notificationsPopover')
  public notificationsPopover: any;

  @ViewChild('userPopover')
  public userPopover: any;

  @EventBusPropertyListenOn(CoreEvent.userChange)
  public activeUser$: Observable<McsIdentity>;

  @EventBusPropertyListenOn(CoreEvent.accountChange)
  public activeAccount$: Observable<McsCompany>;

  private _currentUserJobHandler: Subscription;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _translateService: TranslateService,
    private _router: Router,
    private _eventDispatcher: EventBusDispatcherService,
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
    this._registerEvents();
    this._listenToBrowserResize();
    this._listenToSwitchAccount();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._currentUserJobHandler);
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
   * Returns 'View [totalNotificationsCount - countLimit] More'
   * if more than [countLimit] notifications are created else just returns 'View More'
   */
  public get viewMoreNotificationsText(): string {
    let showNotificationCount = this.displayedNotifications.length > NOTIFICATIONS_COUNT_LIMIT;
    let remainingNotificationCount = this.displayedNotifications.length - NOTIFICATIONS_COUNT_LIMIT;

    return showNotificationCount ? this._translateService.instant(
      'header.userPanel.notifications.viewMoreCount', { count: remainingNotificationCount }
    ) : this._translateService.instant('header.userPanel.notifications.viewMore');
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
   * Event that emits when the current user job has been received
   */
  private _onCurrentUserJob(job: McsJob): void {
    if (isNullOrEmpty(job)) { return; }

    this.notifications = addOrUpdateArrayRecord(
      this.notifications,
      job,
      false,
      (_existingJob: McsJob) => {
        return _existingJob.id === job.id;
      });
    this._sortNotifications();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listener for browser resize
   */
  private _listenToBrowserResize(): void {
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
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }

  /**
   * Registers the events
   */
  private _registerEvents(): void {
    this._currentUserJobHandler = this._eventDispatcher.addEventListener(
      CoreEvent.jobCurrentUser, this._onCurrentUserJob.bind(this));
    this._eventDispatcher.dispatch(CoreEvent.jobCurrentUser);
  }
}
