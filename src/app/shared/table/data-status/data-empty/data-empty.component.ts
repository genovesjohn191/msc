import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-data-empty',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DataEmptyComponent {

  public constructor() {
    // Add Implementation here
  }
}
