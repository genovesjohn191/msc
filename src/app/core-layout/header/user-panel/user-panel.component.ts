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
import { refreshView } from '../../../utilities';

@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styles: [require('./user-panel.component.scss')]
})

export class UserPanelComponent implements OnInit {
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
    return CoreDefinition.ASSETS_FONT_USER;
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_DOWN;
  }

  public get caretRightIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_RIGHT;
  }

  @ViewChild('popoverInstance')
  public popoverInstance: any;

  public constructor(
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
    this.notificationTextContent = this._textContent.content.header.userPanel.notifications;

    // Subscribe to notification changes
    this._notificationContextService.notificationsStream
      .subscribe((updatedNotifications) => {
        this.notifications = updatedNotifications;
        if (!this.hasNotification && this.popoverInstance) {
          this.popoverInstance.close();
        }
        refreshView(() => {
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
    this._browserService.deviceTypeStream.subscribe((deviceType: McsDeviceType) => {
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
    refreshView(() => {
      this._router.navigate(['./notifications']);
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }

  public onOpenNotificationPanel(): void {
    if (this.popoverInstance &&
      !this.hasNotification || this.deviceType !== McsDeviceType.Desktop) {
      this.viewNotificationsPage();
    }
  }

  public onCloseNotificationPanel(): void {
    this._notificationContextService.clearNonActiveNotifications();
  }
}
