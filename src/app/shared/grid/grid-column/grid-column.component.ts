import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'mcs-grid-column',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./grid-column.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'grid-column-wrapper'
  }
})

export class GridColumnComponent { }
