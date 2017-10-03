import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-list-items-error',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListItemsErrorComponent {

  public constructor() {
    // Add Implementation here
  }
}
