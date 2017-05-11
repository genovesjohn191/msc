import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { Router } from '@angular/router';

/** Services/Providers */
import {
  McsAssetsProvider,
  McsNotification,
  McsNotificationContextService,
  CoreDefinition,
  McsBrowserService,
  McsDeviceType,
  McsConnectionStatus
} from '../../core';

const NOTIFICATION_MAX = 3;

@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styles: [require('./user-panel.component.scss')]
})

export class UserPanelComponent implements OnInit {
  public bellIcon: string;
  public userIcon: string;
  public caretRightIcon: string;
  public notifications: McsNotification[];
  public hasConnectionError: boolean;
  public statusIconClass: string;
  private _popoverInstance: any;

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _router: Router,
    private _notificationContext: McsNotificationContextService,
    private _browserService: McsBrowserService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ngZone: NgZone
  ) {
    this.hasConnectionError = false;
    this.statusIconClass = '';
    this.notifications = new Array();
  }

  public ngOnInit() {
    this.bellIcon = this._assetsProvider.getIcon('bell');
    this.userIcon = this._assetsProvider.getIcon('user');
    this.caretRightIcon = this._assetsProvider.getIcon('caret-right');

    // Subscribe to notification changes
    this._notificationContext.notificationsStream
      .subscribe((updatedNotifications) => {
        this.notifications = updatedNotifications;
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
        }, CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
      });

    // Subscribe to connection status stream
    this._notificationContext.connectionStatusStream
      .subscribe((status) => {
        if (status === McsConnectionStatus.Success) {
          this.hasConnectionError = false;
        } else if (status === McsConnectionStatus.Failed ||
          status === McsConnectionStatus.Fatal) {
          this.hasConnectionError = true;
        }
      });

    // Subscribe to browser service
    this._browserService.resizeWindowStream.subscribe((deviceType: McsDeviceType) => {
      if (this._popoverInstance) {
        switch (deviceType) {
          case McsDeviceType.MobilePortrait:
          case McsDeviceType.MobileLandscape:
            this._popoverInstance.orientation = 'left';
            break;

          case McsDeviceType.Desktop:
          case McsDeviceType.Tablet:
            this._popoverInstance.orientation = 'center';
          default:
            break;
        }
      }
    });
  }

  public viewNotificationsPage(): void {
    this._router.navigate(['./notifications']);
    if (this._popoverInstance) {
      this._popoverInstance.close();
    }
  }

  public onCloseNotificationPanel(): void {
    this._notificationContext.clearNonActiveNotifications();
  }

  public setPopoverInstance(popoverInstance: any) {
    this._popoverInstance = popoverInstance;
  }
}
