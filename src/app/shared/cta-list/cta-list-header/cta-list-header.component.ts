import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { CtaLinkEvent } from '../cta-list.component';

@Component({
  selector: 'mcs-cta-list-header',
  templateUrl: './cta-list-header.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'cta-list-header-wrapper',
  }
})

export class CtaListHeaderComponent {
  @Input()
  public link?: string;

  @Input()
  public linkEvent?: CtaLinkEvent;

  public get hasLink(): boolean {
    console.log(this.link);
    return !isNullOrEmpty(this.link);
  }
}
