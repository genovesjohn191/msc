import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { ReportPeriod } from '@app/features-shared/report-widget';

interface PeriodOption {
  label: string;
  period: ReportPeriod;
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
  selector: 'mcs-report-insights',
  templateUrl: './report-insights.component.html',
  styleUrls: ['../report-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'report-insights-wrapper'
  }
})

export class ReportInsightsComponent {
  public periodOptions: PeriodOption[];
  public monthOptions: PeriodOption[];
  private initialize: boolean = false;
  public set selectedPeriod(value: PeriodOption) {
    this._selectedPeriod = value;
    if (this.initialize) {
      this._createMonthOptions();
    }
    this._changeDetector.markForCheck();
    this.initialize = true;
  }
  public get selectedPeriod(): PeriodOption {
    return this._selectedPeriod;
  }

  public set selectedPerformanceMonth(value: PeriodOption) {
    this._selectedPerformanceMonth = value;
    this._changeDetector.markForCheck();
  }
  public get selectedPerformanceMonth(): PeriodOption {
    return this._selectedPerformanceMonth;
  }

  private _selectedPeriod: PeriodOption;
  private _selectedPerformanceMonth: PeriodOption;

  public constructor(private _changeDetector: ChangeDetectorRef) {
    this._createPeriodOptions();
    this._createMonthOptions();
  }

  private _createMonthOptions(): void {
    this.monthOptions = Array<PeriodOption>();
    let currentYear = new Date().getFullYear();
    let maxDate = this._selectedPeriod.period.until.toDateString();

    for (let ctr = 0; ctr < 12; ctr++) {

      let from = new Date(new Date(maxDate).setMonth(new Date(maxDate).getMonth() - ctr));
      let until = from;
      let label = months[until.getMonth()];
      if (currentYear !== until.getFullYear()) {
        label += ` ${until.getFullYear()}`;
      }
      let period = {from, until};

      this.monthOptions.push({label, period});
    }

    this.selectedPerformanceMonth = this.monthOptions[0];
  }

  private _createPeriodOptions(): void {
    this.periodOptions = Array<PeriodOption>();
    let currentYear = new Date().getFullYear();

    for (let ctr = 0; ctr < 4; ctr++) {

      let from = new Date(new Date().setMonth(new Date().getMonth() - (12 + ctr)));
      let until = new Date(new Date().setMonth(new Date().getMonth() - ctr));
      let label = ctr === 0 ? 'Current Month' : months[until.getMonth()];
      if (currentYear !== until.getFullYear()) {
        label += ` ${until.getFullYear()}`;
      }
      let period = {from, until};

      this.periodOptions.push({label, period});
    }

    this._selectedPeriod = this.periodOptions[0];
  }
}
