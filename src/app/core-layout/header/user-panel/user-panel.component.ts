import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Subject,
  Observable,
  Subscription
} from 'rxjs';
import {
  takeUntil,
  map,
  shareReplay,
} from 'rxjs/operators';
import {
  McsJob,
  Breakpoint,
  McsCompany,
  RouteKey,
  McsIdentity
} from '@app/models';
import {
  McsBrowserService,
  McsAuthenticationService,
  McsNavigationService
} from '@app/core';
import {
  refreshView,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { EventBusPropertyListenOn } from '@peerlancers/ngx-event-bus';
import { McsEvent } from '@app/events';
import { SwitchAccountService } from '../../shared';
import { UserPanelService } from './user-panel.service';

const NOTIFICATIONS_COUNT_LIMIT = 3;
@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserPanelComponent implements OnInit, OnDestroy {
  public notifications$: Observable<McsJob[]>;
  public hasConnectionError: boolean;
  public deviceType: Breakpoint;

  @ViewChild('notificationsPopover')
  public notificationsPopover: any;

  @ViewChild('userPopover')
  public userPopover: any;

  @EventBusPropertyListenOn(McsEvent.userChange)
  public activeUser$: Observable<McsIdentity>;

  @EventBusPropertyListenOn(McsEvent.accountChange)
  public activeAccount$: Observable<McsCompany>;
  public showPlatformButton: boolean = false;
  public isPublicRoute: boolean = false;

  private _routeHandler: Subscription;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _translateService: TranslateService,
    private _navigationService: McsNavigationService,
    private _browserService: McsBrowserService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authenticationService: McsAuthenticationService,
    private _switchAccountService: SwitchAccountService,
    private _userPanelService: UserPanelService
  ) {
    this.hasConnectionError = false;
    this.deviceType = Breakpoint.Large;
  }

  public ngOnInit(): void {
    this._subscribeToNotificationsChange();
    this._subscribeToBrowserResize();
    this._subscribeToSwitchAccount();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._routeHandler);
  }

  public get bellIconKey(): string {
    return CommonDefinition.ASSETS_SVG_NOTIFICATIONS;
  }

  public get userIconKey(): string {
    return CommonDefinition.ASSETS_SVG_USER_WHITE;
  }

  public get caretDownIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_DOWN;
  }

  public get logoutIconKey(): string {
    return CommonDefinition.ASSETS_SVG_LOGOUT_WHITE;
  }

  /**
   * Gets the view more text based on the job list
   * @param jobs Jobs to be checked for viewing the text
   */
  public getViewMoreText(jobs: McsJob[]): string {
    let showNotificationCount = jobs.length > NOTIFICATIONS_COUNT_LIMIT;
    let remainingNotificationCount = jobs.length - NOTIFICATIONS_COUNT_LIMIT;

    return showNotificationCount ? this._translateService.instant(
      'header.userPanel.notifications.viewMoreCount', { count: remainingNotificationCount }
    ) : this._translateService.instant('header.userPanel.notifications.viewMore');
  }

  /**
   * Navigate to notifications page to see all the jobs
   */
  public navigateToNotificationsPage(): void {
    this._navigationService.navigateTo(RouteKey.Notifications);
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
      if (!isNullOrEmpty(this.notificationsPopover)) {
        this.notificationsPopover.close();
      }
      this.userPopover.toggle();
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Event that emits when notification panel is opened
   */
  public onOpenNotificationPanel(jobs: McsJob[]): void {
    let hasOngoingJobs = (isNullOrEmpty(jobs) === false);
    let isOnlargeDevice = (this.deviceType === Breakpoint.Large || this.deviceType === Breakpoint.Wide);
    let shouldRedirectToNotifPage = (!hasOngoingJobs || !isOnlargeDevice);
    let isMobileMode = (!isOnlargeDevice && !isNullOrEmpty(this.notificationsPopover));

    if (shouldRedirectToNotifPage) {
      this.navigateToNotificationsPage();
    }

    if (isMobileMode) { this.notificationsPopover.close(); }
  }

  /**
   * Subscribe to notifications changes
   */
  private _subscribeToNotificationsChange(): void {
    this.notifications$ = this._userPanelService.notificationsChange().pipe(
      takeUntil(this._destroySubject),
      map((notifications) => notifications.filter((notification) => notification.inProgress)),
      shareReplay(1)
    );
  }

  /**
   * Listener for browser resize
   */
  private _subscribeToBrowserResize(): void {
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
  private _subscribeToSwitchAccount(): void {
    this._switchAccountService.activeAccountStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe(() => this._changeDetectorRef.markForCheck());
  }
}
