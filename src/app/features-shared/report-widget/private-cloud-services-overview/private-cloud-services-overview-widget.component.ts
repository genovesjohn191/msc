import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  EventEmitter,
  Output
} from '@angular/core';

import {
  catchError,
  takeUntil } from 'rxjs/operators';
import {
  Subject, throwError,
} from 'rxjs';

import {
  CommonDefinition,
  unsubscribeSafely
} from '@app/utilities';
import { McsReportingService } from '@app/core';
import {
  McsReportComputeResourceTotals,
  RouteKey
} from '@app/models';

@Component({
  selector: 'mcs-private-cloud-services-overview-widget',
  templateUrl: './private-cloud-services-overview-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class PrivateCloudServicesOverviewWidgetComponent implements OnInit, OnDestroy {

  @Output()
  public serviceOverviewDataChange= new EventEmitter<McsReportComputeResourceTotals>();

  public computeResourceTotals: McsReportComputeResourceTotals;
  public hasError: boolean = false;

  private _baseDestroySubject = new Subject<void>();

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _reportingService: McsReportingService
  ) { }

  public get notvisibleCopyBlackIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_NOT_VISIBLE_COPY_BLACK;
  }

  public get cloudBlackIcon(): string {
    return CommonDefinition.ASSETS_SVG_SMALL_CLOUD_BLACK;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public ngOnInit(): void {
    this.getComputeResourceTotals();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._baseDestroySubject);
  }

  public retry(): void {
    this.getComputeResourceTotals();
  }

  public resourceDescription(label: string, resourceCount: number = 0): string {
    let description = `${resourceCount} ${label}`;
    return resourceCount === 1 ? description : `${description}s`;
  }

  public getComputeResourceTotals(): void {
    this.serviceOverviewDataChange.emit(undefined);
    this.hasError = false;
    this._changeDetector.markForCheck();

    this._reportingService.getComputeResourceTotals()
    .pipe(
      takeUntil(this._baseDestroySubject),
      catchError((error) => {
        this.hasError = true;
        this.serviceOverviewDataChange.emit(null);
        this._changeDetector.markForCheck();
        return throwError(error);
      })
    ).subscribe((resourceTotals: McsReportComputeResourceTotals) => {
      this.hasError = false;
      this.computeResourceTotals = resourceTotals;
      this.serviceOverviewDataChange.emit(resourceTotals);
      this._changeDetector.markForCheck();
      return resourceTotals;
    });
  }
}

