import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CoreDefinition } from '../../../core';

@Component({
  selector: 'mcs-data-status-error',
  templateUrl: './data-status-error.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'data-status-error-wrapper inline-items-xsmall centered'
  }
})

export class DataStatusErrorComponent {

  // Returns the error icon key
  public get errorIconKey(): string {
    return CoreDefinition.ASSETS_SVG_ERROR;
  }
}
