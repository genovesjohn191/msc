import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ElementRef,
  Renderer2
} from '@angular/core';

@Component({
  selector: 'mcs-header-cell',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderCellComponent {

  public constructor() {
    // Add Implementation here
  }
}
