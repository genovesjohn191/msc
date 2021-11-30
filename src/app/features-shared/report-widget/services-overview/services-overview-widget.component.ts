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
  Subject,
  throwError
} from 'rxjs';

import {
  CommonDefinition,
  unsubscribeSafely
} from '@app/utilities';
import { CoreRoutes, McsReportingService } from '@app/core';
import { RouteKey } from '@app/models';

interface ServiceInfo {
  id: number;
  description: string;
  count: number;
  hasError: boolean;
  processing: boolean;
  link: string;
  icon: string;
  getData: (id: number) => void;
  eventId: string;
  eventTracker: string;
  eventLabel: string;
}

@Component({
  selector: 'mcs-services-overview-widget',
  templateUrl: './services-overview-widget.component.html',
  styleUrls: ['../report-widget.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})

export class ServicesOverviewWidgetComponent implements OnInit, OnDestroy {
  public servicesInfo: ServiceInfo[] = [
    {
      id: 0,
      icon: CommonDefinition.ASSETS_SVG_SMALL_NOT_VISIBLE_COPY_BLACK,
      description: 'Azure subscription',
      count: 0,
      processing: true,
      hasError: true,
      link: CoreRoutes.getNavigationPath(RouteKey.AzureSoftwareSubscriptions),
      getData: this.getAzureSubscriptionInfo.bind(this),
      eventId: 'services-overview-azure-sub',
      eventTracker: 'navigate-to-azure-subscription',
      eventLabel: 'azure-subscription-link'
    },
    {
      id: 1,
      icon: CommonDefinition.ASSETS_SVG_SMALL_CLOUD_BLACK,
      description: 'License subscription',
      count: 0,
      processing: true,
      hasError: true,
      link: CoreRoutes.getNavigationPath(RouteKey.Licenses),
      getData: this.getLicenseSubscriptionInfo.bind(this),
      eventId: 'services-overview-license-sub',
      eventTracker: 'navigate-to-license-subscription',
      eventLabel: 'license-subscription-link'
    }
  ];

  @Output()
  public licenseSubscriptionChange= new EventEmitter<number>();

  @Output()
  public azureSubscriptionChange= new EventEmitter<number>();

  private _baseDestroySubject = new Subject<void>();

  public constructor(private _changeDetector: ChangeDetectorRef, private _reportingService: McsReportingService) { }

  public ngOnInit(): void {
    for(let i = 0; i < this.servicesInfo.length; ++i) {
      this.servicesInfo[i].getData(i);
    }
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._baseDestroySubject);
  }

  public serviceDescription(serviceInfo: ServiceInfo): string {
    return serviceInfo.count === 1 ? serviceInfo.description : `${serviceInfo.description}s`;
  }

  public getAzureSubscriptionInfo(id: number): void {
    this.servicesInfo[id].count = 0;
    this.servicesInfo[id].processing = true;
    this.servicesInfo[id].hasError = false;
    this.azureSubscriptionChange.emit(undefined);
    this._changeDetector.markForCheck();

    this._reportingService.azureSubscriptionCount
    .pipe(
      takeUntil(this._baseDestroySubject),
      catchError(() => {
        this.servicesInfo[id].hasError = true;
        this.servicesInfo[id].processing = false;
        this.azureSubscriptionChange.emit(0);
        this._changeDetector.markForCheck();
        return throwError('Azure subscriptions endpoint failed.');
      }))
    .subscribe((count) => {
      this.azureSubscriptionChange.emit(count);
      this.servicesInfo[id].count = count;
      this.servicesInfo[id].processing = false;
      this._changeDetector.markForCheck();
    });
  }

  public getLicenseSubscriptionInfo(id: number): void {
    this.servicesInfo[id].count = 0;
    this.servicesInfo[id].processing = true;
    this.servicesInfo[id].hasError = false;
    this.licenseSubscriptionChange.emit(undefined);
    this._changeDetector.markForCheck();

    this._reportingService.licenseSubscriptionCount
    .pipe(
      takeUntil(this._baseDestroySubject),
      catchError(() => {
        this.servicesInfo[id].hasError = true;
        this.servicesInfo[id].processing = false;
        this.licenseSubscriptionChange.emit(0);
        this._changeDetector.markForCheck();
        return throwError('Licenses endpoint failed.');
      }))
    .subscribe((count) => {
      this.licenseSubscriptionChange.emit(count);
      this.servicesInfo[id].count = count;
      this.servicesInfo[id].processing = false;
      this._changeDetector.markForCheck();
    });
  }
}

