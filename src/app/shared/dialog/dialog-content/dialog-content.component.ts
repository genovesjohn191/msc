import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-dialog-content',
  template: `
    <div class="dialog-content" mcsScrollable>
      <ng-content></ng-content>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'dialog-content-wrapper',
    'style': 'overflow: hidden'
  }
})

export class DialogContentComponent { }
