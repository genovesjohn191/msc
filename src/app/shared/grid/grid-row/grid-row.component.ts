import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'mcs-grid-row',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./grid-row.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'grid-row-wrapper'
  }
})

export class GridRowComponent { }
