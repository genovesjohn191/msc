import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';
import {
  McsNavigationService,
  McsAccessControlService,
  McsTableDataSource2,
  McsTableEvents,
  McsMatTableContext
} from '@app/core';
import {
  isNullOrEmpty,
  CommonDefinition,
  createObject
} from '@app/utilities';
import {
  McsResourceStorage,
  RouteKey,
  McsExpandResourceStorage,
  McsResource,
  McsFeatureFlag,
  McsFilterInfo
} from '@app/models';
import { McsEvent } from '@app/events';
import { ColumnFilter } from '@app/shared';
import { VdcDetailsBase } from '../vdc-details.base';

@Component({
  selector: 'mcs-vdc-storage',
  templateUrl: './vdc-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class VdcStorageComponent extends VdcDetailsBase implements OnDestroy {
  public readonly dataSource: McsTableDataSource2<McsResourceStorage>;
  public readonly dataEvents: McsTableEvents<McsResourceStorage>;
  public readonly defaultColumnFilters: McsFilterInfo[];

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _accessControlService: McsAccessControlService,
  ) {
    super(_injector, _changeDetectorRef);
    this.dataSource = new McsTableDataSource2(this._getVdcStorage.bind(this));
    this.defaultColumnFilters = [
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'storageProfile' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'usage' }),
      createObject(McsFilterInfo, { value: true, exclude: false, id: 'tier' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'action' })
    ];
    this.dataSource.registerColumnsFilterInfo(this.defaultColumnFilters);
  }

  @ViewChild('columnFilter')
  public set columnFilter(value: ColumnFilter) {
    if (!isNullOrEmpty(value)) {
      this.dataSource.registerColumnFilter(value);
    }
  }

  public ngOnDestroy() {
    this.dispose();
  }

  public get storageIconKey(): string {
    return CommonDefinition.ASSETS_SVG_STORAGE;
  }

  public get cogIconKey(): string {
    return CommonDefinition.ASSETS_SVG_ELLIPSIS_HORIZONTAL;
  }

  public retryDatasource(): void {
    this.dataSource.refreshDataRecords();
  }

  public canRequestCustomChange(serviceId: string): boolean {
    const serviceCustomChangeFeatureFlag = this._accessControlService.hasAccessToFeature([McsFeatureFlag.OrderingServiceCustomChange]);

    return !isNullOrEmpty(serviceId) && serviceCustomChangeFeatureFlag &&
            this._accessControlService.hasPermission(['OrderEdit']);
  }

  public canCreateTicket(serviceId: string): boolean {
    return !isNullOrEmpty(serviceId) &&
      this._accessControlService.hasPermission([
        'TicketCreate'
      ]);
  }

  public canExpandVdcStorage(scaleable: boolean): boolean {
    return scaleable && this._accessControlService.hasPermission(['OrderEdit']);
  }

  public hasActionsEnabled(scaleable: boolean, resourceStorage: McsResourceStorage): boolean {
    let hasRequestChangeAccess = this.canRequestCustomChange(resourceStorage.serviceId);
    let hasTicketCreatePermission = this.canCreateTicket(resourceStorage.serviceId);
    let resourceIsScaleable = this.canExpandVdcStorage(scaleable);

    return resourceIsScaleable || hasTicketCreatePermission || hasRequestChangeAccess;
  }

  /**
   * Navigate to Ordering Expand Vdc Storage
   */
  public navigateToExpandVdcStorage(resourceDetails: McsResource, resourceStorage: McsResourceStorage): void {
    this.eventDispatcher.dispatch(
      McsEvent.vdcStorageExpandSelectedEvent,
      createObject(McsExpandResourceStorage, {
        resource: resourceDetails, storage: resourceStorage
      })
    );
    this._navigationService.navigateTo(RouteKey.OrderVdcStorageExpand);
  }

  /**
   * An abstract method that get notified when the vdc selection has been changed
   */
  protected resourceChange(): void {
    this._getVdcStorage();
  }

  private _getVdcStorage(): Observable<McsMatTableContext<McsResourceStorage>> {
    return this.resource$.pipe(
      switchMap((selectedResource) => {
        return this.apiService.getResourceStorages(selectedResource.id).pipe(
        map(response => new McsMatTableContext(response?.collection,
          response?.totalCollectionCount)
        )
      )
    }))
  }
}
