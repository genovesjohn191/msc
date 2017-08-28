import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2
} from '@angular/core';

@Component({
  selector: 'mcs-data-cell',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DataCellComponent {

  public constructor() {
    // Add Implementation here
  }
}
