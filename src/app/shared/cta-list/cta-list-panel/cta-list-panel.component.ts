import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { CtaLinkEvent } from '../cta-list.component';

@Component({
  selector: 'mcs-cta-list-panel',
  templateUrl: './cta-list-panel.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'cta-list-panel-wrapper',
  }
})

export class CtaListPanelComponent {
  @Input()
  public icon: string;

  @Input()
  public compact: boolean = false;

  public get hasIcon(): boolean {
    return !isNullOrEmpty(this.icon);
  }
}
