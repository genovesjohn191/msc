import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-page-description',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageDescriptionComponent {

  public constructor() {
    // Add Implementation here
  }
}
