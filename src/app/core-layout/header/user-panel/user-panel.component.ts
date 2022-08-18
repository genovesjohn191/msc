import {
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  map,
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  McsAuthenticationService,
  McsBrowserService,
  McsNavigationService,
  SwitchAccountService
} from '@app/core';
import { EventBusPropertyListenOn } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  Breakpoint,
  McsCompany,
  McsIdentity,
  McsJob,
  McsNotice,
  RouteKey
} from '@app/models';
import { SideSheetService } from '@app/shared/side-sheet';
import {
  isNullOrEmpty,
  refreshView,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import {
  ConsoleSheetComponent,
  FeedbackSheetComponent,
  FeedbackSheetConfig
} from '../../shared';
import { UserPanelService } from './user-panel.service';

export type Notifications = McsJob | McsNotice;

const NOTIFICATIONS_COUNT_LIMIT = 3;
@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UserPanelComponent implements OnInit, OnDestroy {
  public notifications$: Observable<Notifications[]>;
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
    private _userPanelService: UserPanelService,
    private _sidesheetService: SideSheetService
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
    this._navigationService.navigateTo(RouteKey.Activities);
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

  public onClickFeedbackWidget(): void {
    let sidesheetRef = this._sidesheetService.open(FeedbackSheetComponent, {
      title: 'Send feedback to Macquarie',
      data: {
        message: 'Test Message'
      } as FeedbackSheetConfig
    });

    sidesheetRef.afterClosed().subscribe();
  }

  public onClickConsoleWidget(): void {
    let sidesheetRef = this._sidesheetService.open(ConsoleSheetComponent, {
      title: this._translateService.instant('label.vm-console')
    });

    sidesheetRef.afterClosed().subscribe();
  }

  public hasOngoingJob(notifications: Notifications[]): boolean {
    let hasActiveJob = notifications.find((notification) => this.isNotificationJob(notification));
    return !isNullOrEmpty(hasActiveJob);
  }

  public isNotificationJob(notification: Notifications): boolean {
    return notification instanceof McsJob;
  }

  /**
   * Subscribe to notifications changes
   */
  private _subscribeToNotificationsChange(): void {
    this.notifications$ = this._userPanelService.notificationsChange().pipe(
      takeUntil(this._destroySubject),
      map((notifications) => {
        let notificationItems = notifications.filter((notification) => {
          return this.isNotificationJob(notification) ?
            notification.inProgress : !notification.acknowledged;
        });
        return notificationItems;
      }),
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
