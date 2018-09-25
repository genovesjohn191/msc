import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-content-panel',
  template: `
  <div class="content-panel-wrapper"
    mcsSetFocus
    tabindex="-1"
    mcsScrollable mcsScrollbarId="page-content">
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
