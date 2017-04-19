import {
  Component,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

/** Providers */
import { AssetsProvider } from '../providers/assets.provider';

@Component({
  selector: 'mcs-user-panel',
  templateUrl: './user-panel.component.html',
  styles: [require('./user-panel.component.scss')]
})

export class UserPanelComponent implements OnInit {
  public bellIcon: string;
  public userIcon: string;
  public caretRightIcon: string;
  public notifications: number;

  public constructor(
    private _assetsProvider: AssetsProvider,
    private _router: Router
  ) {}

  public ngOnInit() {
    this.bellIcon = this._assetsProvider.getIcon('bell');
    this.userIcon = this._assetsProvider.getIcon('user');
    this.caretRightIcon = this._assetsProvider.getIcon('caret-right');

    this.notifications = 2;
  }

  public viewNotifications() {
    this._router.navigate(['./notifications']);
  }
}
