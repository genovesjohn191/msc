import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-action-item',
  template: `
    <div class="action-item-content" mcsRipple>
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['./action-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'action-item-wrapper',
    '[attr.id]': 'id'
  }
})

export class ActionItemComponent {

  @Input()
  public id: string = `mcs-action-item-${nextUniqueId++}`;
}
