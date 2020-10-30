import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  BehaviorSubject,
  Observable
} from 'rxjs';

import { ChartItem } from '@app/shared';
import {
  coerceNumber,
  currencyFormat
} from '@app/utilities';

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
        name: 'Change',
        xValue: 'Virtual machines|4201.33',
        yValue: 17,
      },
      {
        name: 'Change',
        xValue: 'SQL Managed Instance|944.20',
        yValue: 14,
      },
      {
        name: 'Change',
        xValue: 'Apps|500.00',
        yValue: 13,
      },
      {
        name: 'Change',
        xValue: 'Extensions|1201.33',
        yValue: 7,
      },
      {
        name: 'Change',
        xValue: 'Workspace|944.20',
        yValue: 3,
      },
      {
        name: 'Change',
        xValue: 'Networking|-500.00',
        yValue: -1,
      },
      {
        name: 'Change',
        xValue: 'Firewall|1201.33',
        yValue: -3,
      },
      {
        name: 'Change',
        xValue: 'Disks|-944.20',
        yValue: -4,
      },
      {
        name: 'Change',
        xValue: 'Memory|-500.00',
        yValue: -8,
      },
      {
        name: 'Change',
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

  public tooltipYValueFormatter(val: number, opts?: any): string {
    return val > 0 ? `+${val}` : val.toString();
  }
}
