import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-page-subtitle',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageSubTitleComponent {

  public constructor() {
    // Add Implementation here
  }
}
