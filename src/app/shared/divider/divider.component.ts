import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  HostBinding
} from '@angular/core';
import {
  McsOrientationType,
  McsColorType
} from '@app/utilities';

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

  @Input()
  public color: McsColorType = 'medium';

  @HostBinding('attr.text-color')
  public get hostColor(): string {
    return this.color;
  }
}
