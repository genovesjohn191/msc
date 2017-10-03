import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-content-panel',
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'content-panel-wrapper'
  }
})

export class ContentPanelComponent { }
