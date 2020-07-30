import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CtaItem } from '@app/shared/cta-list/cta-list.component';
import { CommonDefinition } from '@app/utilities';

@Component({
  selector: 'mcs-report-overview',
  templateUrl: './report-overview.component.html',
  styleUrls: ['../report-pages.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'report-overview-wrapper'
  }
})

export class ReportOverviewComponent { }
