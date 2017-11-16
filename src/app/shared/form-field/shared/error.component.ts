import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-error',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'error-wrapper',
    'role': 'alert',
    '[attr.id]': 'id'
  }
})

export class ErrorComponent {
  @Input()
  public id: string = `mcs-error-item-${nextUniqueId++}`;
}
