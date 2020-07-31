import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonDefinition } from '@app/utilities';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChartItem } from '@app/shared';

@Component({
  selector: 'mcs-azure-resources-widget',
  templateUrl: './azure-resources-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class AzureResourcesWidgetComponent implements OnInit {
  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit() {
    let data = [
      {
        name: 'Jul 2020',
        xValue: 'Virtual Machines',
        yValue: 4,
      },
      {
        name: 'Jul 2020',
        xValue: 'Virtual Networks',
        yValue: 2,
      },
      {
        name: 'Jul 2020',
        xValue: 'Managed Disks',
        yValue: 6,
      },
      {
        name: 'Jul 2020',
        xValue: 'IP Addresses',
        yValue: 4,
      }
    ];

    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this._changeDetectorRef.markForCheck();
    this.data$ = this.dataBehavior.asObservable();
    this.dataBehavior.next(data);
  }
}
