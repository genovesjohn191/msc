import {
  Component,
  OnInit
} from '@angular/core';

/** Services */
import { McsAssetsProvider } from '../../core';

@Component({
  selector: 'mcs-notifications',
  templateUrl: './notifications.component.html',
  styles: [require('./notifications.component.scss')]
})

export class NotificationsComponent implements OnInit {
  public totalNotificationsCount: number;
  public spinnerIcon: string;
  public checkIcon: string;

  public constructor(private _assetsProvider: McsAssetsProvider) {}

  public ngOnInit() {
    this.totalNotificationsCount = 134;
    this.spinnerIcon = this._assetsProvider.getIcon('spinner');
    this.checkIcon = this._assetsProvider.getIcon('check');
  }
}
