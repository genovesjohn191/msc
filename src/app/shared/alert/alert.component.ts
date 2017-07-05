import {
  Component,
  OnInit,
  Input
} from '@angular/core';

import { CoreDefinition } from '../../core';

@Component({
  selector: 'mcs-alert',
  templateUrl: './alert.component.html',
  styles: [require('./alert.component.scss')],
})

export class AlertComponent {
  @Input()
  public type: 'success' | 'failed' | 'warning' | 'info';

  @Input()
  public title: string;

  public constructor() {
    this.type = 'success';
  }

  public getAlertIconKey(): string {
    let iconKey: string;

    switch (this.type) {
      case 'failed':
        iconKey = CoreDefinition.ASSETS_FONT_CLOSE;
        break;
      case 'warning':
        iconKey = CoreDefinition.ASSETS_FONT_WARNING;
        break;
      case 'info':
        iconKey = CoreDefinition.ASSETS_FONT_INFORMATION_2;
        break;
      case 'success':
      default:
        iconKey = CoreDefinition.ASSETS_FONT_CHECK;
        break;
    }
    return iconKey;
  }
}
