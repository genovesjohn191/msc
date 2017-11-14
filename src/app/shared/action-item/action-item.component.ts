import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

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
    'class': 'action-item-wrapper'
  }
})

export class ActionItemComponent { }
