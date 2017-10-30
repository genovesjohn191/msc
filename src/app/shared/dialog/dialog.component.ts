import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-dialog',
  template: `
    <ng-content></ng-content>
  `,
  styleUrls: ['./dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'dialog-wrapper',
  }
})

export class DialogComponent { }
