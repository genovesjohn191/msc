import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { CoreDefinition } from '@app/core';

@Component({
  selector: 'mcs-data-status-in-progress',
  templateUrl: './data-status-in-progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'data-status-in-progress-wrapper inline-items-xsmall centered'
  }
})

export class DataStatusInProgressComponent {

  // Returns the spinner icon key
  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
  }
}
