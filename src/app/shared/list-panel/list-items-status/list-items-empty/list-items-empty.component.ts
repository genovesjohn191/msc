import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-list-items-empty',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ListItemsEmptyComponent {

  public constructor() {
    // Add Implementation here
  }
}
