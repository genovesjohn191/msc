import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CoreRoutes } from '@app/core';
import { RouteKey } from '@app/models';
import { McsReportingService } from '@app/core/services/mcs-reporting.service';
import { NumberValueAccessor } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface ServiceInfo {
  description: string;
  count: number;
  hasError: boolean;
  processing: boolean;
  link: string;
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

export class ServicesOverviewWidgetComponent implements OnInit {
  public get hasError(): boolean {
    return this.azureSubscriptionInfo.hasError
      || this.licenseSubscriptionInfo.hasError
      || this.softwareSubscriptionInfo.hasError;
  }

  public azureSubscriptionInfo: ServiceInfo;

  public licenseSubscriptionInfo: ServiceInfo;

  public softwareSubscriptionInfo: ServiceInfo;

  public constructor(private _changeDetector: ChangeDetectorRef, private _reportingService: McsReportingService) { }

  public ngOnInit(): void {
    this.getAzureSubscriptionInfo();
    this.getLicenseSubscriptionInfo();
    this.getSoftwareSubscriptionInfo();
  }

  public getAzureSubscriptionInfo(): void {
    this.azureSubscriptionInfo = {
      description: 'Azure subscriptions',
      count: 0,
      processing: true,
      hasError: false,
      link: CoreRoutes.getNavigationPath(RouteKey.Licenses)
    };
    this._changeDetector.markForCheck();

    this._reportingService.azureSubscriptionCount
    .pipe(catchError(() => {
      this.azureSubscriptionInfo.hasError = true;
      this.azureSubscriptionInfo.processing = false;
      this._changeDetector.markForCheck();
      return throwError('Azure subscriptions endpoint failed.');
    }))
    .subscribe((count) => {
      this.azureSubscriptionInfo.count = count;
      this.azureSubscriptionInfo.processing = false;
      this._changeDetector.markForCheck();
    });
  }

  public getLicenseSubscriptionInfo(): void {
    this.licenseSubscriptionInfo = {
      description: 'License subscriptions',
      count: 0,
      processing: true,
      hasError: false,
      link: CoreRoutes.getNavigationPath(RouteKey.Licenses)
    };
    this._changeDetector.markForCheck();

    this._reportingService.licenseSubscriptionCount
    .pipe(catchError(() => {
      this.licenseSubscriptionInfo.hasError = true;
      this.licenseSubscriptionInfo.processing = false;
      this._changeDetector.markForCheck();
      return throwError('Licenses endpoint failed.');
    }))
    .subscribe((count) => {
      this.licenseSubscriptionInfo.count = count;
      this.licenseSubscriptionInfo.processing = false;
      this._changeDetector.markForCheck();
    });
  }

  public getSoftwareSubscriptionInfo(): void {
    this.softwareSubscriptionInfo = {
      description: 'Software subscriptions',
      count: 0,
      processing: false, // change to true if loading from actual data
      hasError: false,
      link: CoreRoutes.getNavigationPath(RouteKey.Licenses)
    };
    this._changeDetector.markForCheck();

    // TODO: get software subs
  }
}

