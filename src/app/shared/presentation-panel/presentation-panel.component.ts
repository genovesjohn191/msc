import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'mcs-presentation-panel',
  templateUrl: './presentation-panel.component.html',
  styleUrls: ['./presentation-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'presentation-panel-wrapper'
  }
})

export class PresentationPanelComponent { }
