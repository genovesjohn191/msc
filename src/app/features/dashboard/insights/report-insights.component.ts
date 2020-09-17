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

  public set selectedPeriod(value: PeriodOption) {
    this._selectedPeriod = value;
    this._changeDetector.markForCheck();
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
  }

  private _createPeriodOptions(): void {
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

    this.periodOptions = Array<PeriodOption>();
    this.monthOptions = Array<PeriodOption>();

    for (let ctr = 0; ctr < 13; ctr++) {

      let from = new Date(new Date().setMonth(new Date().getMonth() - (12 + ctr)));
      let until = new Date(new Date().setMonth(new Date().getMonth() - ctr));

      let label = ctr === 0 ? 'Current Month' : months[until.getMonth()];

      let period = {from, until};

      if (ctr < 4) {
        this.periodOptions.push({label, period});
      }
      this.monthOptions.push({label, period});
    }

    this.selectedPeriod = this.periodOptions[0];
    this.selectedPerformanceMonth = this.monthOptions[0];
  }
}
