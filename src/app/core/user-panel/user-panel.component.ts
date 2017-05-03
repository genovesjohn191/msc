import {
  Component,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

/** Services/Providers */
import { AssetsProvider } from '../providers/assets.provider';
import { McsNotification } from '../models/mcs-notification';
import { McsNotificationContextService } from '../services/mcs-notification-context.service';

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

  public constructor(
    private _assetsProvider: AssetsProvider,
    private _router: Router,
    private _notificationContext: McsNotificationContextService
  ) {
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
      });
  }

  public viewNotifications() {
    this._router.navigate(['./notifications']);
  }
}
