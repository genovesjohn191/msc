import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2
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
