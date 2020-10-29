import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChartItem } from '@app/shared';
import { coerceNumber, currencyFormat } from '@app/utilities';

@Component({
  selector: 'mcs-resource-changes-widget',
  templateUrl: './resource-changes-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ResourceChangesWidgetComponent implements OnInit {
  public data$: Observable<ChartItem[]>;
  public dataBehavior: BehaviorSubject<ChartItem[]>;

  public constructor(private _changeDetectorRef: ChangeDetectorRef) {
  }

  public ngOnInit() {
    let data = [
      {
        name: '1',
        xValue: 'Virtual machines|4201.33',
        yValue: 17,
      },
      {
        name: '1',
        xValue: 'SQL Managed Instance|944.20',
        yValue: 14,
      },
      {
        name: '1',
        xValue: 'Apps|500.00',
        yValue: 13,
      },
      {
        name: '1',
        xValue: 'Extensions|1201.33',
        yValue: 7,
      },
      {
        name: '1',
        xValue: 'Workspace|944.20',
        yValue: 3,
      },
      {
        name: '1',
        xValue: 'Networking|-500.00',
        yValue: -1,
      },
      {
        name: '1',
        xValue: 'Firewall|1201.33',
        yValue: -3,
      },
      {
        name: '1',
        xValue: 'Disks|-944.20',
        yValue: -4,
      },
      {
        name: '1',
        xValue: 'Memory|-500.00',
        yValue: -8,
      },
      {
        name: '1',
        xValue: 'Solutions|-1200.00',
        yValue: -11,
      }
    ];

    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this._changeDetectorRef.markForCheck();
    this.data$ = this.dataBehavior.asObservable();
    this.dataBehavior.next(data);
  }

  public dataLabelFormatter(val: number, opts?: any): string {
    let fullLabel = opts.w.globals.labels[opts.dataPointIndex];
    let items = fullLabel.split('|', 2);
    let amount = currencyFormat(items[1]);
    if ((items[1] as number) > 0) {
      amount = '+' + currencyFormat(items[1]);
    }

    return amount;
  }

  public legendLabelFormatter(val: string, opts?: any): string {
    let items = val.split('|', 2);

    return items[0];
  }

  public xAxisLabelFormatter(val: string, timestamp?: number): string {
    return (coerceNumber(val) > 0) ? `+${val}`: val;
  }

  public tooltipXValueFormatter(val: string, opts?: any): string {
    let fullLabel = opts.w.globals.labels[opts.dataPointIndex];
    let items = fullLabel.split('|', 2);
    let amount = currencyFormat(items[1]);
    if ((items[1] as number) > 0) {
      amount = '+' + currencyFormat(items[1]);
    }

    return `${items[0]} (${amount})`;
  }

  public tooltipYTitleFormatter(seriesName: string): string {
    return ':';
  }
}
