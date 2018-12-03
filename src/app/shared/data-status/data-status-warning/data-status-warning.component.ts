import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CoreDefinition } from '@app/core';

@Component({
  selector: 'mcs-data-status-warning, mcs-data-status-empty',
  templateUrl: './data-status-warning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'data-status-warning-wrapper'
  }
})

export class DataStatusWarningComponent {

  // Returns the warning icon key
  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }
}
