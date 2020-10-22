import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'mcs-cta-list-action',
  templateUrl: './cta-list-action.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'cta-list-action-wrapper',
  }
})

export class CtaListActionComponent {
}
