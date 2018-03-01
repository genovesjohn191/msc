import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { Router } from '@angular/router';
/** Services/Providers */
import {
  CoreDefinition,
  McsTextContentProvider,
  McsApiJob,
  McsNotificationEventsService,
  McsBrowserService,
  McsDeviceType,
  McsConnectionStatus,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsApiCompany
} from '../../../core';
import { SwitchAccountService } from '../../shared';
import {
  refreshView,
  isNullOrEmpty,
  unsubscribeSafely,
  addOrUpdateArrayRecord
} from '../../../utilities';
import { Subscription } from 'rxjs';

@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserPanelComponent implements OnInit, OnDestroy {
  public notifications: McsApiJob[];
  public closedNotifications: McsApiJob[];
  public hasConnectionError: boolean;
  public textContent: any;
  public deviceType: McsDeviceType;

  @ViewChild('notificationsPopover')
  public notificationsPopover: any;

  @ViewChild('userPopover')
  public userPopover: any;

  private _notificationsSubscription: Subscription;
  private _notificationsConnectionSubscription: any;
  private _browserSubscription: any;
  private _activeAccountSubscription: any;

  /**
   * Returns the displayed notifications and ignore those who are already closed
   */
  public get displayedNotifications(): McsApiJob[] {
    return this.notifications.filter((job) => {
      let jobClosed = this.closedNotifications
        .find((closedJob) => job.id === closedJob.id);
      return !jobClosed;
    });
  }

  /**
   * Returns true when there are active job to be displayed, otherwise false
   */
  public get hasNotification(): boolean {
    return this.displayedNotifications && this.displayedNotifications.length > 0;
  }

  public get bellIconKey(): string {
    return CoreDefinition.ASSETS_FONT_BELL;
  }

  public get userIconKey(): string {
    return CoreDefinition.ASSETS_SVG_USER_WHITE;
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_DOWN;
  }

  public get logoutIconKey(): string {
    return CoreDefinition.ASSETS_SVG_LOGOUT_WHITE;
  }

  public get firstName(): string {
    return this._authenticationIdentity.firstName;
  }

  public get lastName(): string {
    return this._authenticationIdentity.lastName;
  }

  public get activeAccount(): McsApiCompany {
    return this._switchAccountService.activeAccount;
  }

  public get loadingAccount(): boolean {
    return this._switchAccountService.loadingAccount;
  }

  public constructor(
    private _textContent: McsTextContentProvider,
    private _router: Router,
    private _notificationEvents: McsNotificationEventsService,
    private _browserService: McsBrowserService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _authenticationService: McsAuthenticationService,
    private _switchAccountService: SwitchAccountService
  ) {
    this.hasConnectionError = false;
    this.notifications = new Array();
    this.closedNotifications = new Array();
    this.deviceType = McsDeviceType.Desktop;
  }

  public ngOnInit(): void {
    this.textContent = this._textContent.content.header.userPanel.notifications;

    // Listen to events
    this._listenToConnectionStatusChanged();
    this._listenToCurrentUserJob();
    this._listenToBrowserResize();
    this._listenToSwitchAccount();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._notificationsSubscription);
    unsubscribeSafely(this._notificationsConnectionSubscription);
    unsubscribeSafely(this._browserSubscription);
    unsubscribeSafely(this._activeAccountSubscription);
  }

  /**
   * Navigate to notifications page to see all the jobs
   */
  public viewNotificationsPage(): void {
    if (this.notificationsPopover) { this.notificationsPopover.close(); }
    refreshView(() => {
      this._router.navigate(['./notifications']);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
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
    if (this.notificationsPopover &&
      !this.hasNotification || this.deviceType !== McsDeviceType.Desktop) {
      this.viewNotificationsPage();
    }
  }

  /**
   * Event that emits when notification panel was closed
   */
  public onCloseNotificationPanel(): void {
    // Remove all non-active jobs
    this.notifications.forEach((notification) => {
      this.removeNotification(notification);
    });
  }

  /**
   * Event that emits when notification is removed
   * @param _job Job to be removed
   */
  public removeNotification(_job: McsApiJob): void {
    if (isNullOrEmpty(_job)) { return; }
    this.closedNotifications.push(_job);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Listen to current user job triggered
   */
  private _listenToCurrentUserJob(): void {
    this._notificationsSubscription = this._notificationEvents
      .currentUserJob
      .subscribe((notification) => {
        if (isNullOrEmpty(notification)) { return; }

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

  /**
   * Listen to connection status changed of the notifications
   */
  private _listenToConnectionStatusChanged(): void {
    this._notificationsConnectionSubscription = this._notificationEvents
      .connectionStatusChanged
      .subscribe((status) => {
        if (status === McsConnectionStatus.Success) {
          this.hasConnectionError = false;
        } else if (status === McsConnectionStatus.Failed ||
          status === McsConnectionStatus.Fatal) {
          this.hasConnectionError = true;
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listener for browser resize
   */
  private _listenToBrowserResize(): void {
    // Subscribe to browser service
    this._browserSubscription = this._browserService.deviceTypeStream
      .subscribe((deviceType: McsDeviceType) => {
        this.deviceType = deviceType;
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Listen when user switch account to update the company name under user name
   */
  private _listenToSwitchAccount(): void {
    this._activeAccountSubscription = this._switchAccountService
      .activeAccountStream
      .subscribe(() => {
        // Refresh the page when account is selected
        this._changeDetectorRef.markForCheck();
      });
  }
}
