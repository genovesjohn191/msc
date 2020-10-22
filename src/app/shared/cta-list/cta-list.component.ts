import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

export interface CtaLinkEvent {
  tracker: string;
  category: string;
  label: string;
}

export interface CtaItem {
  icon?: string;
  title?: string;
  titleLink?: string;
  titleLinkEvent?: CtaLinkEvent;
  description?: string;
  ctaLabel?: string;
  ctaLink?: string;
  ctaLinkTooltip?: string;
  ctaLinkEvent?: CtaLinkEvent;
}

@Component({
  selector: 'mcs-cta-list',
  templateUrl: './cta-list.component.html',
  styleUrls: ['./cta-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'cta-list-wrapper'
  }
})

export class CtaListComponent {
  @Input()
  public data: CtaItem[];

  @Input()
  public isCompact: boolean = false;

  public hasValue(data: any): boolean {
    return !isNullOrEmpty(data);
  }

  public get iconSize(): string {
    return this.isCompact ? 'medium' : 'xxlarge';
  }
}
