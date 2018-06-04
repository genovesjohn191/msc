import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { animateFactory } from '../../../utilities';

@Component({
  selector: 'mcs-data-status-success',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    animateFactory.fadeInOut
  ],
  host: {
    'class': 'data-status-success-wrapper',
    '[@fadeInOut]': '"show"'
  }
})

export class DataStatusSuccessComponent { }
