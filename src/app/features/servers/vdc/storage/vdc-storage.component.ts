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
  McsNavigationService
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
  McsResource
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
    private _navigationService: McsNavigationService
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
