import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  ViewEncapsulation
} from '@angular/core';

import { throwError } from 'rxjs';
import {
  catchError,
  map
} from 'rxjs/operators';

import {
  McsAccessControlService,
  McsMatTableContext,
  McsNavigationService,
  McsReportingService,
  McsTableDataSource2
} from '@app/core';
import {
  McsFilterInfo,
  McsPermission,
  McsReportStorageResourceUtilisation,
  PlatformType,
  RouteKey
} from '@app/models';
import {
  createObject,
  isNullOrEmpty
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mcs-storage-profile-utilisation-widget',
  templateUrl: './storage-profile-utilisation-widget.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'widget-box'
  }
})
export class StorageProfileUtilisationWidgetComponent {

  public readonly dataSource: McsTableDataSource2<McsReportStorageResourceUtilisation>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  @Output()
  public dataChange= new EventEmitter<McsReportStorageResourceUtilisation[]>(null);

  constructor(
    private _reportingService: McsReportingService,
    private _navigationService: McsNavigationService,
    private _translate: TranslateService,
    private _accessControlService: McsAccessControlService
  ) {
    this.dataSource = new McsTableDataSource2(this._getStorageProfiles.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'storageProfile' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'utilisation' }),
      createObject(McsFilterInfo, {
        value: this.hasOrderEditAccess ? true : false,
        exclude: true,
        id: 'action'
      }),
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  public get hasOrderEditAccess(): boolean {
    return this._accessControlService.hasPermission([McsPermission.OrderEdit]);
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public expandLinkFallBackText(storage: McsReportStorageResourceUtilisation): string {
    if (!this.disableExpandVdcStorage(storage) || !this.showExpandLink(storage.resourcePlatform)) { return; }
    if (isNullOrEmpty(storage.serviceId) || !storage.serviceChangeAvailable) {
      return this._translate.instant('privateCloudDashboard.storageUtilisationWidget.expandLinkProvision');
    } else if (storage.isStretched) {
      return this._translate.instant('privateCloudDashboard.storageUtilisationWidget.expandLinkStretched');
    }
  }

  public disableExpandVdcStorage(resourceStorage: McsReportStorageResourceUtilisation): boolean {
    return resourceStorage.isStretched ||
      isNullOrEmpty(resourceStorage.serviceId) ||
      !resourceStorage.serviceChangeAvailable;
  }

  public showExpandLink(resourcePlatform: any): boolean {
    return resourcePlatform === PlatformType.VCloud && this.hasOrderEditAccess;
  }

  public navigateToExpandVdcStorage(resourceStorage: McsReportStorageResourceUtilisation): void {
    this._navigationService.navigateTo(RouteKey.OrderVdcStorageExpand, [],
      { queryParams: {
        resourceId : resourceStorage.resourceId,
        storageId : resourceStorage.id
      }}
    );
  }

  public getColor(usedMb: number, limitMb: number): string {
    let usage = Number(this.getUtilisationPercentage(usedMb, limitMb));
    if (usage > 85) {
      return 'red';
    } else if(usage > 75 && usage <= 85) {
      return 'darkorange';
    }
    return 'green';
  }


  public getUtilisationPercentage(usedMb: number, limitMb: number): string {
    let firstValue = usedMb < 0 ? 0 : usedMb;
    let secondValue = limitMb < 0 ? 0 : limitMb;
    let percentage = 100 * firstValue / secondValue;
    let utilisationPercentage = isNaN(percentage) ? 0 : percentage;
    return utilisationPercentage.toFixed(1);
  }

  private _getStorageProfiles(): any {
    this.dataChange.emit(undefined);
    return this._reportingService.getResourcesStorages().pipe(
      map((response) => {
        let dataSourceContext = new McsMatTableContext(response, response?.length);
        this.dataChange.emit(dataSourceContext.dataRecords);
        return dataSourceContext;
      }),
      catchError((error) => {
        this.dataChange.emit([]);
        return throwError(error);
      })
    );
  }
}