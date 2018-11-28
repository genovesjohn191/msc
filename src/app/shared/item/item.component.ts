import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input
} from '@angular/core';

@Component({
  selector: 'mcs-item',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./item.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'item-wrapper',
    '[class.item-inline]': 'orientation === "inline"',
    '[class.item-block]': 'orientation === "block"',
    '[class.item-separated]': 'orientation === "separated"'
  }
})

export class ItemComponent {
  @Input()
  public orientation: 'inline' | 'block' | 'separated' = 'inline';
}
