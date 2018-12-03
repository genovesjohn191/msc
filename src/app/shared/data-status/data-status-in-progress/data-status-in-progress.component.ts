import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'mcs-data-status-in-progress',
  templateUrl: './data-status-in-progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'data-status-in-progress-wrapper'
  }
})

export class DataStatusInProgressComponent { }
