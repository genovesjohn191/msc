import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldSelectMonthPeriod } from './field-select-month-period';

export interface PeriodOption {
  label: string;
  period: ReportPeriod;
}

export interface ReportPeriod {
  from: Date;
  until: Date;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

@Component({
  selector: 'mcs-field-select-month-period',
  templateUrl: './field-select-month-period.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-select-month-period'
  }
})
export class FieldSelectMonthPeriodComponent
  extends FormFieldBaseComponent2<any>
  implements IFieldSelectMonthPeriod, OnInit {

  public monthOptions: PeriodOption[];

  constructor(_injector: Injector) {
    super(_injector);
  }

  public ngOnInit(): void {
    this._createMonthOptions();
  }

  private _createMonthOptions(): void {
    this.monthOptions = Array<PeriodOption>();
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();

    for (let ctr = 0; ctr < 12; ctr++) {
      let from = new Date(new Date().setMonth(currentDate.getMonth() - ctr));
      let label = months[from.getMonth()];
      if (currentYear !== from.getFullYear()) {
        label += ` ${from.getFullYear()}`;
      }
      let period = { from, until: from };

      this.monthOptions.push({label, period});
    }

    this.ngControl.control.setValue(this.monthOptions[0]);
  }
}