import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { animateFactory } from '@app/utilities';

@Component({
  selector: 'mcs-content-panel',
  templateUrl: './content-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeOut
  ],
  host: {
    'class': 'content-panel-wrapper'
  }
})

export class ContentPanelComponent { }
