import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsTableDataSource
} from '@app/core';
import { TranslateService } from '@ngx-translate/core';
import { isNullOrEmpty } from '@app/utilities';
import { McsResourceStorage } from '@app/models';
import { McsResourcesRepository } from '@app/services';
import { VdcService } from '../vdc.service';
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
    return CoreDefinition.ASSETS_SVG_STORAGE;
  }

  /**
   * Returns all the resource storages
   */
  public get resourceStorages(): McsResourceStorage[] {
    return !isNullOrEmpty(this.selectedVdc.storage) ?
      this.selectedVdc.storage : new Array();
  }

  constructor(
    _resourcesRespository: McsResourcesRepository,
    _vdcService: VdcService,
    _changeDetectorRef: ChangeDetectorRef,
    _translateService: TranslateService
  ) {
    super(
      _resourcesRespository,
      _vdcService,
      _changeDetectorRef,
      _translateService
    );
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
      this._translateService.instant('serversVdcStorage.columnHeaders')
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
      this._resourcesRespository.getResourceStorage(this.selectedVdc)
    );
  }
}
