import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-content-panel',
  template: `
  <div class="content-panel-wrapper" scrollable scrollbarId="page-content">
    <ng-content></ng-content>
  </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'display-flex-row flex-auto',
    'style': 'overflow: hidden'
  }
})

export class ContentPanelComponent { }
