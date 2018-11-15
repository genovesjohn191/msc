import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'mcs-grid',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./grid.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'grid-wrapper'
  }
})

export class GridComponent { }
