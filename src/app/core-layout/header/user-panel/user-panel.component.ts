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
  McsTextContentProvider,
  McsApiJob,
  McsNotificationContextService,
  CoreDefinition,
  McsBrowserService,
  McsDeviceType,
  McsConnectionStatus,
  McsAuthenticationIdentity,
  McsAuthenticationService,
  McsApiCompany
} from '../../../core';
import { AppState } from '../../../app.service';
import { SwitchAccountService } from '../../shared';
import {
  refreshView,
  isNullOrEmpty
} from '../../../utilities';

@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserPanelComponent implements OnInit, OnDestroy {
  public notifications: McsApiJob[];
  public hasConnectionError: boolean;
  public statusIconClass: string;
  public notificationTextContent: any;
  public deviceType: McsDeviceType;

  public get hasNotification(): boolean {
    return this.notifications && this.notifications.length > 0;
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

  public get firstName(): string {
    return this._authenticationIdentity.firstName;
  }

  public get lastName(): string {
    return this._authenticationIdentity.lastName;
  }

  @ViewChild('notificationsPopover')
  public notificationsPopover: any;

  @ViewChild('userPopover')
  public userPopover: any;

  private _notificationsStreamSubscription: any;
  private _notificationsConnectionSubscription: any;
  private _browserSubscription: any;
  private _activeAccountSubscription: any;

  public constructor(
    private _textContent: McsTextContentProvider,
    private _router: Router,
    private _notificationContextService: McsNotificationContextService,
    private _browserService: McsBrowserService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _authenticationService: McsAuthenticationService,
    private _appState: AppState,
    private _switchAccountService: SwitchAccountService
  ) {
    this.hasConnectionError = false;
    this.statusIconClass = '';
    this.notifications = new Array();
    this.deviceType = McsDeviceType.Desktop;
  }

  public ngOnInit(): void {
    this.notificationTextContent = this._textContent.content.header.userPanel.notifications;

    // Listen to events
    this._listenToNotificationsStatus();
    this._listenToBrowserResize();
    this._listenToSwitchAccount();
  }

  public ngOnDestroy(): void {
    if (!isNullOrEmpty(this._notificationsStreamSubscription)) {
      this._notificationsStreamSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._notificationsConnectionSubscription)) {
      this._notificationsConnectionSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._browserSubscription)) {
      this._browserSubscription.unsubscribe();
    }
    if (!isNullOrEmpty(this._activeAccountSubscription)) {
      this._activeAccountSubscription.unsubscribe();
    }
  }

  public viewNotificationsPage(): void {
    if (this.notificationsPopover) { this.notificationsPopover.close(); }
    refreshView(() => {
      this._router.navigate(['./notifications']);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  public onOpenNotificationPanel(): void {
    if (this.notificationsPopover &&
      !this.hasNotification || this.deviceType !== McsDeviceType.Desktop) {
      this.viewNotificationsPage();
    }
  }

  public onCloseNotificationPanel(): void {
    this._notificationContextService.clearNonActiveNotifications();
  }

  public logout(event): void {
    event.preventDefault();
    this._authenticationService.logOut();
  }

  public clickUser(_event: any): void {
    if (isNullOrEmpty(this.userPopover)) { return; }
    _event.stopPropagation();
    refreshView(() => {
      this.notificationsPopover.close();
      this.userPopover.toggle();
      this._changeDetectorRef.markForCheck();
    });
  }

  public clickNotifications(_event: any): void {
    if (isNullOrEmpty(this.notificationsPopover)) { return; }
    _event.stopPropagation();
    refreshView(() => {
      this.userPopover.close();
      this.notificationsPopover.toggle();
      this._changeDetectorRef.markForCheck();
    });
  }

  public getActiveAccount(): McsApiCompany {
    let activeAccount: McsApiCompany;
    activeAccount = this._appState.get(CoreDefinition.APPSTATE_ACTIVE_ACCOUNT) ?
      this._appState.get(CoreDefinition.APPSTATE_ACTIVE_ACCOUNT) :
      this._appState.get(CoreDefinition.APPSTATE_DEFAULT_ACCOUNT);
    return activeAccount;
  }

  /**
   * Track by function to help determine the view which data has beed modified
   * @param index Index of the current loop
   * @param _item Item of the loop
   */
  public trackByFn(index: any, _item: any) {
    return index;
  }

  private _listenToNotificationsStatus(): void {
    // Subscribe to notification changes
    this._notificationsStreamSubscription = this._notificationContextService
      .notificationsStream
      .subscribe((updatedNotifications) => {
        this.notifications = updatedNotifications;
        if (!this.hasNotification && this.notificationsPopover) {
          this.notificationsPopover.close();
        }
        this._changeDetectorRef.markForCheck();
      });

    // Subscribe to connection status stream to check for possible errors
    this._notificationsConnectionSubscription = this._notificationContextService
      .connectionStatusStream
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

  private _listenToBrowserResize(): void {
    // Subscribe to browser service
    this._browserSubscription = this._browserService.deviceTypeStream
      .subscribe((deviceType: McsDeviceType) => {
        this.deviceType = deviceType;
        this._changeDetectorRef.markForCheck();
      });
  }

  private _listenToSwitchAccount(): void {
    this._activeAccountSubscription = this._switchAccountService.activeAccountStream
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
      });
  }
}
