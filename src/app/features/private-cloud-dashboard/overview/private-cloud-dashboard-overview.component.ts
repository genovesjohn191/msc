import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
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
  shareReplay
} from 'rxjs/operators';

import {
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsNavigationService
} from '@app/core';
import {
  McsApiCollection,
  McsContactUs,
  McsFeatureFlag,
  McsOrderItemType,
  McsPermission,
  McsPlannedWork,
  McsReportComputeResourceTotals,
  McsReportStorageResourceUtilisation,
  McsResource,
  McsTicket,
  PlatformType,
  RouteKey,
  ServiceType
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  CommonDefinition,
  getSafeProperty
} from '@app/utilities';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { DashboardExportDocumentManager } from '@app/features-shared/export-document-factory/dashboard-export-document-manager';
import { DashboardExportDocumentType } from '@app/features-shared/export-document-factory/dashboard-export-document-type';
import { PrivateCloudDashboardOverviewDocumentDetails } from '@app/features-shared/export-document-factory/models/private-cloud-dashboard-overview';

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

  private _isPdfDownloadInProgress: boolean;
  private _exportDocumentDetails = new PrivateCloudDashboardOverviewDocumentDetails();

  public constructor(
    private _accessControlService: McsAccessControlService,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _changeDetector: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _injector: Injector,
    private _navigationService: McsNavigationService,
  ) {
    this._registerEvents();
  }

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
    return this._accessControlService.hasPermission([
      McsPermission.ManagedCloudVmAccess, McsPermission.SelfManagedCloudVmAccess]);
  }

  public get hasAccessToFirewall(): boolean {
    return this._accessControlService.hasPermission([McsPermission.FirewallConfigurationView]);
  }

  public get hasOrganizationVdcViewAccess(): boolean {
    return this._accessControlService.hasPermission([McsPermission.OrganizationVdcView]);
  }

  public get hasAccessToPlannedWork(): boolean {
    return this._accessControlService.hasAccessToFeature([McsFeatureFlag.PlannedWork]);
  }

  public get plannedWorkAccess(): [McsPermission[], McsFeatureFlag[]] {
    return [[], [McsFeatureFlag.PlannedWork]];
  } 

  public showBackupSecurity(): boolean {
    return this.hasCloudVmAccess &&
      this._accessControlService.hasPermission([McsPermission.OrderEdit]);
  }

  public get showServiceOverview(): boolean {
    return this.hasCloudVmAccess || this.hasAccessToFirewall;
  }

  public get pdfDownloadInProgress(): boolean {
    return this._isPdfDownloadInProgress;
  }

  public onClickExportWord(): void {
    DashboardExportDocumentManager.initializeFactories()
      .getCreationFactory(DashboardExportDocumentType.MsWordPrivateCloudDashboard)
      .exportDocument(this._exportDocumentDetails, DashboardExportDocumentType.MsWordPrivateCloudDashboard, this._injector)
  }

  public onClickExportPdf(): void {
    this._isPdfDownloadInProgress = true;
    this._changeDetector.markForCheck();
    setTimeout(() => {
      DashboardExportDocumentManager.initializeFactories()
        .getCreationFactory(DashboardExportDocumentType.PdfPrivateCloudDashboard)
        .exportDocument(this._exportDocumentDetails, DashboardExportDocumentType.PdfPrivateCloudDashboard, this._injector)
    }, 100);
  }

  public widgetsLoading(): boolean {
    let serviceOverview = this.showServiceOverview ? this._exportDocumentDetails.servicesOverview : null;
    let storageUtilisation = this.hasOrganizationVdcViewAccess ? this._exportDocumentDetails.resourceStorageUtilisation : null;
    let plannedWorks = this.hasAccessToPlannedWork ? this._exportDocumentDetails.plannedWorks : null;

    return serviceOverview === undefined ||
      storageUtilisation === undefined ||
      this._exportDocumentDetails.tickets === undefined ||
      this._exportDocumentDetails.contactUs === undefined ||
      plannedWorks === undefined;
  }

  public onClickPublicCloud(): void {
    this._navigationService.navigateTo(RouteKey.ReportOverview);
  }

  public onClickPrivateCloud(): void {
    this._navigationService.navigateTo(RouteKey.PrivateCloudDashboardOverview);
  }

  public serviceOverviewDataChange(data: McsReportComputeResourceTotals): void {
    this._exportDocumentDetails.servicesOverview = data;
  }

  public contactUsDataChange(contactUs: McsContactUs[]): void {
    this._exportDocumentDetails.contactUs = contactUs;
  }

  public resourceStorageUtilisationDataChange(storage: McsReportStorageResourceUtilisation[]): void {
    this._exportDocumentDetails.resourceStorageUtilisation = storage;
  }

  public azureTicketsDataChange(tickets: McsTicket[]): void {
    this._exportDocumentDetails.tickets = tickets;
  }

  public plannedWorkDataChange(plannedWorks: McsPlannedWork[]): void {
    this._exportDocumentDetails.plannedWorks = plannedWorks;
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
      map((response) => {
        let resources = getSafeProperty(response, (obj) => obj.collection);
        if (resources?.length === 0) { return; }
        let managedVdcs = resources.filter((resource) => {
          return resource.serviceType === ServiceType.Managed && resource.platform === PlatformType.VCloud;
        })
        return managedVdcs;
      }),
      shareReplay(1));
  }

  private _registerEvents(): void {
    this._eventDispatcher.addEventListener(
      McsEvent.pdfDownloadEvent, this._pdfDownloadCompleted.bind(this));
  }

  private _pdfDownloadCompleted(): void {
    this._isPdfDownloadInProgress = false;
    this._changeDetector.markForCheck();
  }
}