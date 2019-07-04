import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CoreConfig } from '@app/core';

@Component({
  selector: 'mcs-maintenance-page',
  templateUrl: './maintenance-page.component.html',
  styleUrls: ['./maintenance-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'maintenance-page-wrapper'
  }
})

export class MaintenancePageComponent {

  constructor(private _coreConfig: CoreConfig) { }

  /**
   * Returns the macquarie view url link
   */
  public get macviewUrl(): string {
    return this._coreConfig.macviewUrl;
  }
}
