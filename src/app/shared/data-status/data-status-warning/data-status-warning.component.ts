import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CommonDefinition } from '@app/utilities';

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
    return CommonDefinition.ASSETS_SVG_WARNING;
  }
}
