import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonDefinition } from '@app/utilities';
import { BehaviorSubject, Observable } from 'rxjs';
import { CtaItem } from '@app/shared/cta-list/cta-list.component';

@Component({
  selector: 'mcs-change-requests-widget',
  templateUrl: './change-requests-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ChangeRequestWidgetComponent implements OnInit {
  public data$: Observable<CtaItem[]>;
  public dataBehavior: BehaviorSubject<CtaItem[]>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit() {
    let data = [
      {
        icon: CommonDefinition.ASSETS_SVG_NEW_SERVER,
        title: 'Azure Service Request',
        titleLink: '/servers/',
        description: 'Request a change to resources in a subscription in your Azure Environment.',
      },
      {
        icon: CommonDefinition.ASSETS_SVG_COG,
        title: 'Change License subscription count',
        titleLink: 'https://google.com',
        description: 'Change the number of licenses against a subscription.',
      },
      {
        icon: CommonDefinition.ASSETS_SVG_EJECT_BLACK,
        title: 'Change Macquarie-managed DNS zone',
        titleLink: 'https://google.com',
        description: 'Manage DNS zones in MacquarieView.',
      }
    ];

    this.dataBehavior = new BehaviorSubject<CtaItem[]>(null);
    this._changeDetectorRef.markForCheck();
    this.data$ = this.dataBehavior.asObservable();
    this.dataBehavior.next(data);
  }
}
