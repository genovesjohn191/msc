import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CoreDefinition } from '../../../core';
import { animateFactory } from '../../../utilities';

@Component({
  selector: 'mcs-data-status-in-progress',
  templateUrl: './data-status-in-progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.fadeInOut
  ],
  host: {
    'class': 'data-status-in-progress-wrapper inline-items-xsmall centered',
    '[@fadeInOut]': '"show"'
  }
})

export class DataStatusInProgressComponent {

  // Returns the spinner icon key
  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }
}
