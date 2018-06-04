import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CoreDefinition } from '../../../core';
import { animateFactory } from '../../../utilities';

@Component({
  selector: 'mcs-data-status-warning, mcs-data-status-empty',
  templateUrl: './data-status-warning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.fadeInOut
  ],
  host: {
    'class': 'data-status-warning-wrapper inline-items-xsmall centered',
    '[@fadeInOut]': '"show"'
  }
})

export class DataStatusWarningComponent {

  // Returns the warning icon key
  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }
}
