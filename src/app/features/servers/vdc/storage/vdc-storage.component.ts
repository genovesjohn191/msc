import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  CoreDefinition,
  McsTextContentProvider
} from '@app/core';
import { isNullOrEmpty } from '@app/utilities';
import { McsResourceStorage } from '@app/models';
import { ResourcesRepository } from '@app/services';
import { TableDataSource } from '@app/shared';
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
  public textContent: any;
  public storageDatasource: TableDataSource<McsResourceStorage>;
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
    _resourcesRespository: ResourcesRepository,
    _vdcService: VdcService,
    _changeDetectorRef: ChangeDetectorRef,
    _textContentProvider: McsTextContentProvider
  ) {
    super(
      _resourcesRespository,
      _vdcService,
      _changeDetectorRef,
      _textContentProvider
    );
    this.storageColumns = new Array();
    this.storageDatasource = new TableDataSource<McsResourceStorage>([]);
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.servers.vdc.storage;
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
    this.storageColumns = Object.keys(this.textContent.columnHeaders);
    if (isNullOrEmpty(this.storageColumns)) {
      throw new Error('column definition for storage was not defined');
    }
  }

  /**
   * Initializes the data source of the nics table
   */
  private _initializeDataSource(): void {
    this.storageDatasource = new TableDataSource(
      this._resourcesRespository.findResourceStorage(this.selectedVdc)
    );
  }
}
