import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonDefinition } from '@app/utilities';
import { BehaviorSubject, Observable } from 'rxjs';
import { CtaItem } from '@app/shared/cta-list/cta-list.component';

@Component({
  selector: 'mcs-services-overview-widget',
  templateUrl: './services-overview-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ServicesOverviewWidgetComponent implements OnInit {
  public data$: Observable<CtaItem[]>;
  public dataBehavior: BehaviorSubject<CtaItem[]>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit() {
    let data = [
      {
        icon: CommonDefinition.ASSETS_SVG_INFO,
        ctaLabel: '3 Azure subscriptions',
        ctaLink: 'https://www.google.com'
      },
      {
        icon: CommonDefinition.ASSETS_SVG_INFO,
        ctaLabel: '10 License subscription',
        ctaLink: 'https://www.google.com'
      },
      {
        icon: CommonDefinition.ASSETS_SVG_INFO,
        ctaLabel: '1 Software subscription',
        ctaLink: 'https://www.google.com'
      },
    ];

    this.dataBehavior = new BehaviorSubject<CtaItem[]>(null);
    this._changeDetectorRef.markForCheck();
    this.data$ = this.dataBehavior.asObservable();
    this.dataBehavior.next(data);
  }
}

