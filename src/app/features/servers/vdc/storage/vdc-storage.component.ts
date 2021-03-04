import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import {
  Observable,
  of
} from 'rxjs';
import {
  map,
  tap
} from 'rxjs/operators';
import {
  McsTableDataSource,
  McsNavigationService,
  McsAccessControlService
} from '@app/core';
import {
  isNullOrEmpty,
  getSafeProperty,
  CommonDefinition,
  createObject
} from '@app/utilities';
import {
  McsResourceStorage,
  RouteKey,
  McsExpandResourceStorage,
  McsResource,
  McsFeatureFlag
} from '@app/models';
import { McsEvent } from '@app/events';
import { VdcDetailsBase } from '../vdc-details.base';

@Component({
  selector: 'mcs-vdc-storage',
  templateUrl: './vdc-storage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block'
  }
})

export class VdcStorageComponent extends VdcDetailsBase implements OnInit, OnDestroy {
  public storageDatasource: McsTableDataSource<McsResourceStorage>;
  public storageColumns: string[];

  private _storageCache: Observable<McsResourceStorage[]>;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService,
    private _accessControlService: McsAccessControlService,
  ) {
    super(_injector, _changeDetectorRef);
    this.storageColumns = [];
    this.storageDatasource = new McsTableDataSource();
  }

  public ngOnInit() {
    this._setDataColumns();
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
  protected resourceChange(resource: McsResource): void {
    this._updateTableDataSource(resource);
  }

  /**
   * Sets data column for the corresponding table
   */
  private _setDataColumns(): void {
    this.storageColumns = Object.keys(
      this.translateService.instant('serversVdcStorage.columnHeaders')
    );
    if (isNullOrEmpty(this.storageColumns)) {
      throw new Error('column definition for storage was not defined');
    }
  }

  /**
   * Initializes the data source of the resource storage table
   */
  private _updateTableDataSource(resource: McsResource): void {
    let storageApiSource: Observable<McsResourceStorage[]>;
    if (!isNullOrEmpty(resource)) {
      storageApiSource = this.apiService.getResourceStorages(resource.id).pipe(
        map((response) => getSafeProperty(response, (obj) => obj.collection)),
        tap((records) => this._storageCache = of(records))
      );
    }

    let tableDataSource = isNullOrEmpty(this._storageCache) ?
      storageApiSource : this._storageCache;
    this.storageDatasource.updateDatasource(tableDataSource);
  }
}
