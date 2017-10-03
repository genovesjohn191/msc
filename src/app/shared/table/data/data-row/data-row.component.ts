import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-data-row',
  template: '<ng-container mcsCellOutlet></ng-container>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DataRowComponent {

  public constructor() {
    // Add Implementation here
  }
}
