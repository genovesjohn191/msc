import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Renderer2,
  ElementRef
} from '@angular/core';

@Component({
  selector: 'mcs-header-row',
  template: '<ng-container mcsCellOutlet></ng-container>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderRowComponent {

  public constructor() {
    // Add Implementation here
  }
}
