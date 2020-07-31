import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonDefinition } from '@app/utilities';
import { BehaviorSubject, Observable } from 'rxjs';
import { CtaItem } from '@app/shared/cta-list/cta-list.component';

@Component({
  selector: 'mcs-cost-recommendations-widget',
  templateUrl: './cost-recommendations-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class CostRecommendationsWidgetComponent implements OnInit {
  public data$: Observable<CtaItem[]>;
  public dataBehavior: BehaviorSubject<CtaItem[]>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit() {
    let data = [
      {
        icon: CommonDefinition.ASSETS_SVG_INFO,
        title: 'Operational Monthly Savings',
        titleLink: '/servers',
        titleLinkEvent: {
          tracker: 'test1',
          category: 'test2',
          label: 'test3',
        },
        description: 'Up to $2,907.77 could be saved by optimising underutilised resources.',
        ctaLabel: 'Optimize',
        ctaLink: 'https://www.google.com'
      },
      {
        description: 'Up to $520.05 could be saved by rightsizing virtual machines.',
        ctaLabel: 'Rightsize',
        ctaLink: '/tools'
      }
    ];

    this.dataBehavior = new BehaviorSubject<CtaItem[]>(null);
    this._changeDetectorRef.markForCheck();
    this.data$ = this.dataBehavior.asObservable();
    this.dataBehavior.next(data);
  }
}

