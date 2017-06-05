import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Rx';

/** Services/Providers */
import {
  McsAssetsProvider,
  McsTextContentProvider,
  McsApiJob,
  McsNotificationContextService,
  CoreDefinition,
  McsBrowserService,
  McsDeviceType,
  McsConnectionStatus
} from '../../../core';

@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styles: [require('./user-panel.component.scss')]
})

export class UserPanelComponent implements OnInit {
  public bellIcon: string;
  public userIcon: string;
  public caretDown: string;
  public caretRightIcon: string;
  public notifications: McsApiJob[];
  public hasConnectionError: boolean;
  public statusIconClass: string;
  public notificationTextContent: any;
  public deviceType: McsDeviceType;

  @ViewChild('popoverInstance')
  public popoverInstance: any;

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _textContent: McsTextContentProvider,
    private _router: Router,
    private _notificationContextService: McsNotificationContextService,
    private _browserService: McsBrowserService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.hasConnectionError = false;
    this.statusIconClass = '';
    this.notifications = new Array();
    this.deviceType = McsDeviceType.Desktop;
  }

  public ngOnInit() {
    this.bellIcon = this._assetsProvider.getIcon('bell');
    this.userIcon = this._assetsProvider.getIcon('user');
    this.caretDown = this._assetsProvider.getIcon('caret-down');
    this.caretRightIcon = this._assetsProvider.getIcon('caret-right');
    this.notificationTextContent = this._textContent.content.header.userPanel.notifications;

    // Subscribe to notification changes
    this._notificationContextService.notificationsStream
      .subscribe((updatedNotifications) => {
        this.notifications = updatedNotifications;
        setTimeout(() => {
          this._changeDetectorRef.detectChanges();
        }, CoreDefinition.NOTIFICATION_ANIMATION_DELAY);
      });

    // Subscribe to connection status stream to check for possible errors
    this._notificationContextService.connectionStatusStream
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
      this.deviceType = deviceType;
      if (this.popoverInstance) {
        switch (deviceType) {
          case McsDeviceType.MobilePortrait:
          case McsDeviceType.MobileLandscape:
            this.popoverInstance.orientation = 'left';
            break;

          case McsDeviceType.Desktop:
          case McsDeviceType.Tablet:
            this.popoverInstance.orientation = 'center';
          default:
            break;
        }
      }
    });
  }

  public viewNotificationsPage(): void {
    if (this.popoverInstance) { this.popoverInstance.close(); }
    setTimeout(() => {
      this._router.navigate(['./notifications']);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  public onOpenNotificationPanel(): void {
    if (this.popoverInstance && this.deviceType !== McsDeviceType.Desktop) {
      this.viewNotificationsPage();
    }
  }

  public onCloseNotificationPanel(): void {
    this._notificationContextService.clearNonActiveNotifications();
  }
}
