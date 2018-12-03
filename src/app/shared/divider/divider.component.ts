import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input
} from '@angular/core';
import { McsOrientationType } from '@app/utilities';

@Component({
  selector: 'mcs-divider',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./divider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'role': 'separator',
    'class': 'divider-wrapper',
    '[attr.aria-orientation]': 'orientation',
    '[class.divider-horizontal]': 'orientation === "horizontal"',
    '[class.divider-vertical]': 'orientation === "vertical"'
  }
})

export class DividerComponent {
  @Input()
  public orientation: McsOrientationType = 'horizontal';
}
