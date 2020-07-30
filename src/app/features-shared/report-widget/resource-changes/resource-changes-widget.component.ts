import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonDefinition } from '@app/utilities';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChartItem } from '@app/shared';

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
        name: 'Jul 2020',
        xValue: 'Virtual machines (+$1201.33)',
        yValue: 8,
      },
      {
        name: 'Jul 2020',
        xValue: 'SQL Managed Instance (+$944.20)',
        yValue: 3,
      }
    ];

    this.dataBehavior = new BehaviorSubject<ChartItem[]>(null);
    this._changeDetectorRef.markForCheck();
    this.data$ = this.dataBehavior.asObservable();
    this.dataBehavior.next(data);
  }
}
