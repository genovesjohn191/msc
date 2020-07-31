import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonDefinition } from '@app/utilities';
import { BehaviorSubject, Observable } from 'rxjs';
import { CtaItem } from '@app/shared/cta-list/cta-list.component';

@Component({
  selector: 'mcs-contact-us-widget',
  templateUrl: './contact-us-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ContactUsWidgetComponent implements OnInit {
  public data$: Observable<CtaItem[]>;
  public dataBehavior: BehaviorSubject<CtaItem[]>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit() {
    let data = [
      {
        icon: CommonDefinition.ASSETS_SVG_PERSON_BLUE,
        description: 'Solution Delivery Manager<br />Jane Gee<br />0488 871 123',
        ctaLabel: 'jgee@macquariecloudservices.com',
        ctaLink: 'mailto:jgee@macquariecloudservices.com'
      },
      {
        icon: CommonDefinition.ASSETS_SVG_PERSON_RED,
        description: 'Account Manager<br />John Vicor<br />0488 871 123',
        ctaLabel: 'jvicor@macquariecloudservices.com',
        ctaLink: 'mailto:jvicor@macquariecloudservices.com'
      }
    ];

    this.dataBehavior = new BehaviorSubject<CtaItem[]>(null);
    this._changeDetectorRef.markForCheck();
    this.data$ = this.dataBehavior.asObservable();
    this.dataBehavior.next(data);
  }
}

