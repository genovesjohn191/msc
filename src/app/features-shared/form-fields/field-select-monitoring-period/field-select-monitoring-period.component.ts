import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { ReportPeriod } from '@app/features-shared/report-widget';
import {
  MonitoringAlertingPeriod,
  monitoringAlertingPeriodText
} from '@app/models';
import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldSelectMonitoringPeriod } from './field-select-monitoring-period';

interface PeriodOption {
  label: string;
  period: ReportPeriod;
}

@Component({
  selector: 'mcs-field-select-monitoring-period',
  templateUrl: './field-select-monitoring-period.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-select-monitoring-period'
  }
})
export class FieldSelectMonitoringPeriodComponent
  extends FormFieldBaseComponent2<any>
  implements IFieldSelectMonitoringPeriod, OnInit {

  public periodOptions: PeriodOption[];

  public get monitoringAlertingPeriodEnum(): any {
    return MonitoringAlertingPeriod;
  }

  public ngOnInit(): void {
    this._createPeriodOptions();
  }

  private _createPeriodOptions(): void {
    this.periodOptions = Array<PeriodOption>();
    let monitoringAlertingPeriodRange = this._mapPeriodEnumToPeriodOptions(
      this.monitoringAlertingPeriodEnum, monitoringAlertingPeriodText);

    const periodLength = monitoringAlertingPeriodRange.length;
    for (let ctr = 0; ctr < periodLength; ctr++) {
      let label = monitoringAlertingPeriodRange[ctr];
      let period = this.setMonitoringAlertingPeriodRange(label);

      this.periodOptions.push({label, period});
    }
    this.ngControl.control.setValue(this.periodOptions[0]);
  }

  private _mapPeriodEnumToPeriodOptions(period: MonitoringAlertingPeriod, enumText: any): string[] {
    let periodOptions = [];
    Object.values(period)
      .filter((objValue) => (typeof objValue === 'number'))
      .map(objValue => periodOptions.push(enumText[objValue]));
    return periodOptions;
  }

  private setMonitoringAlertingPeriodRange(label: string): ReportPeriod {
    let currentDate = new Date();
    if (label === monitoringAlertingPeriodText[1]) {
      return {
        from: new Date(new Date().setMonth(currentDate.getMonth() - 1)),
        until: new Date(new Date())
      };
    } else if (label === monitoringAlertingPeriodText[2]) {
      return {
        from: new Date(new Date().setDate(currentDate.getDate() - 14)),
        until: new Date(new Date())
      };
    } else if (label === monitoringAlertingPeriodText[3]) {
      return {
        from: new Date(new Date().setDate(currentDate.getDate() - 7)),
        until: new Date(new Date())
      };
    } else if (label ===monitoringAlertingPeriodText[4]) {
      return {
        from:  new Date(new Date()),
        until:  new Date(new Date())
      };
    }
  }
}