import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-top-panel-item',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'top-panel-item-wrapper'
  }
})

export class TopPanelItemComponent { }
