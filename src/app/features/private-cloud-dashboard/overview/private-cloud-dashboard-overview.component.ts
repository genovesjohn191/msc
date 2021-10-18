import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  Observable,
  throwError
} from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import {
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsNavigationService
} from '@app/core';
import {
  McsApiCollection,
  McsContactUs,
  McsOrderItemType,
  McsPermission,
  McsReportComputeResourceTotals,
  McsResource,
  RouteKey
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  getSafeProperty
} from '@app/utilities';
import { PrivateCloudDashboardOverviewDocumentDetails } from './private-cloud-dashboard-overview.document';

@Component({
  selector: 'mcs-private-cloud-dashboard-overview',
  templateUrl: './private-cloud-dashboard-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class PrivateCloudDashboardOverviewComponent implements OnInit {
  public orderItemTypes$: Observable<McsOrderItemType[]>;
  public vdcList$: Observable<McsResource[]>;

  private _exportDocumentDetails = new PrivateCloudDashboardOverviewDocumentDetails();

  public constructor(
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _navigationService: McsNavigationService,
  ) { }

  public ngOnInit(): void {
    this.getOrderItemTypes();
    this._getVdcList();
  }

  public get arrowDropDownBlackIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ARROW_DROP_DOWN_BLACK;
  }

  public get hasPrivateAndPublicCloudAccess(): boolean {
    return this._authenticationIdentity.platformSettings.hasPublicCloud &&
      this._authenticationIdentity.platformSettings.hasPrivateCloud;
  }

  public get hasCloudVmAccess(): boolean {
    return this._accessControlService.hasPermission([McsPermission.CloudVmAccess]);
  }

  public onClickPublicCloud(): void {
    this._navigationService.navigateTo(RouteKey.ReportOverview);
  }

  public onClickPrivateCloud(): void {
    this._navigationService.navigateTo(RouteKey.PrivateCloudDashboardOverview);
  }

  public serviceOverviewData(data: McsReportComputeResourceTotals): void {
    this._exportDocumentDetails.servicesOverview = data;
  }

  public contactUs(contactUs: McsContactUs[]): void {
    this._exportDocumentDetails.contactUs = contactUs;
  }

  private getOrderItemTypes(): void {
    this.orderItemTypes$ = this._apiService.getOrderItemTypes().pipe(
      catchError((error) => {
        return throwError(error);
      }),
      map((response: McsApiCollection<McsOrderItemType>) => getSafeProperty(response, obj => obj.collection) || [])
    );
  }

  private _getVdcList(): void {
    this.vdcList$ = this._apiService.getResources().pipe(
      catchError((error) => {
        return throwError(error);
      }),
      map((response) => getSafeProperty(response, (obj) => obj.collection)),
      shareReplay(1));
  }
}