import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector
} from '@angular/core';
import { map } from 'rxjs/operators';
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
  McsExpandResourceStorage
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

  public get storageIconKey(): string {
    return CommonDefinition.ASSETS_SVG_STORAGE;
  }

  /**
   * Returns all the resource storages
   */
  public get resourceStorages(): McsResourceStorage[] {
    return !isNullOrEmpty(this.selectedVdc.storage) ?
      this.selectedVdc.storage : new Array();
  }

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService
  ) {
    super(_injector, _changeDetectorRef);
    this.storageColumns = new Array();
  }

  public ngOnInit() {
    this.initialize();
    this._setDataColumns();
  }

  public ngOnDestroy() {
    this.dispose();
  }

  /**
   * Navigate to Ordering Expand Vdc Storage
   */
  public navigateToExpandVdcStorage(mcsResourceStorage: McsResourceStorage): void {
    this.eventDispatcher.dispatch(
      McsEvent.vdcStorageExpandSelectedEvent,
      createObject(McsExpandResourceStorage, { resource: this.selectedVdc, storage: mcsResourceStorage })
    );
    this._navigationService.navigateTo(RouteKey.OrderVdcStorageExpand);
  }

  /**
   * An abstract method that get notified when the vdc selection has been changed
   */
  protected vdcSelectionChange(): void {
    this._initializeDataSource();
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
   * Initializes the data source of the nics table
   */
  private _initializeDataSource(): void {
    this.storageDatasource = new McsTableDataSource(
      this.apiService.getResourceStorages(this.selectedVdc.id).pipe(
        map((response) => getSafeProperty(response, (obj) => obj.collection))
      )
    );
  }
}
