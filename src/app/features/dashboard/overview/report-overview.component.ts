import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'mcs-report-overview',
  templateUrl: './report-overview.component.html',
  styleUrls: ['../report-pages.scss', './report-overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'report-overview-wrapper'
  }
})

export class ReportOverviewComponent { }
