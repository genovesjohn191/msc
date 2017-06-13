import {
  Component,
  OnInit,
  Input
} from '@angular/core';

import { McsAssetsProvider } from '../../core';

@Component({
  selector: 'mcs-alert',
  templateUrl: './alert.component.html',
  styles: [require('./alert.component.scss')],
})

export class AlertComponent implements OnInit {
  public icon: string;

  @Input()
  public type: 'success' | 'failed' | 'warning' | 'info';

  @Input()
  public title: string;

  public constructor(private _assetsProvider: McsAssetsProvider) {
    this.type = 'success';
  }

  public ngOnInit() {
    this.icon = this.getAlertIcon(this.type);
  }

  public getAlertIcon(alert: string): string {
    let key: string;

    switch (alert) {
      case 'failed':
        key = 'close';
        break;
      case 'warning':
        key = 'warning';
        break;
      case 'info':
        key = 'info-2';
        break;
      case 'success':
      default:
        key = 'check';
        break;
    }

    return this._assetsProvider.getIcon(key);
  }
}
