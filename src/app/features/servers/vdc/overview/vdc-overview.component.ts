import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ServerResource,
  ServerStorage,
  ServerStorageStatus,
  serverStorageStatusText
} from '../../models';
import { ServersResourcesRepository } from '../../servers-resources.repository';
import { VdcService } from '../vdc.service';
import { VdcDetailsBase } from '../vdc-details.base';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../../core';
import {
  isNullOrEmpty,
  replacePlaceholder
} from '../../../../utilities';

const VDC_LOW_STORAGE_PERCENTAGE = 85;

@Component({
  selector: 'mcs-vdc-overview',
  templateUrl: './vdc-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VdcOverviewComponent extends VdcDetailsBase implements OnInit, OnDestroy {

  public textContent: any;
  public hasResources: boolean;

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  /**
   * Returns true if there is a storage with low available memory
   */
  public get hasLowStorage(): boolean {
    let lowStorageCount = this._getLowStorageCount();
    return lowStorageCount > 0;
  }

  /**
   * Returns a warning for each storage with low available memory
   */
  public get storageSummary(): string {
    if (!this.hasLowStorage) { return ''; }

    let status = this.textContent.storageProfiles.lowStorageSummary;

    let storageCount = this._getLowStorageCount();
    status = replacePlaceholder(status, 'storage_profile_number', `${storageCount}`);

    let verb = (storageCount === 1) ? 'is' : 'are';
    status = replacePlaceholder(status, 'verb', verb);

    return status;
  }

  constructor(
    _serversResourcesRespository: ServersResourcesRepository,
    _vdcService: VdcService,
    _changeDetectorRef: ChangeDetectorRef,
    _textContentProvider: McsTextContentProvider,
    private _router: Router
  ) {
    super(
      _serversResourcesRespository,
      _vdcService,
      _changeDetectorRef,
      _textContentProvider
    );
    this.selectedVdc = new ServerResource();
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.servers.vdc.overview;
    this.initialize();
    this._validateResources();
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  /**
   * Returns the icon key based on the current status
   * of the capacity of VDC storage.
   * Green Icon - If current storage is below 75%
   * Yellow Icon - If current storage is
   * greater than or equal to 75%
   * or less than or equal to 85%
   * Red Icon - If current storage is more than 85%
   * @param storage VDC Storage
   */
  public getStorageStatusIconKey(storage: ServerStorage): string {
    let iconKey = '';

    let percentage = this._computeStoragePercentage(storage);

    if (percentage <= 75) {
      iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
    } else if (percentage >= 75 && percentage <= 85) {
      iconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
    } else {
      iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
    }

    return iconKey;
  }

  /**
   * Returns true if the VDC storage is enabled.
   * @param storage VDC Storage
   */
  public getStorageStatus(storage: ServerStorage): string {
    return storage.enabled ?
      serverStorageStatusText[ServerStorageStatus.Enabled] :
      serverStorageStatusText[ServerStorageStatus.Disabled];
  }

  /**
   * Returns true if the storage has more than 85% used memory
   * @param storage VDC Storage
   */
  public isStorageProfileLow(storage: ServerStorage): boolean {
    if (isNullOrEmpty(storage)) { return false; }

    return this._computeStoragePercentage(storage) > 85;
  }

  /**
   * Redirects to create new server page
   */
  public createNewServer(): void {
    this._router.navigate(['/servers/create']);
  }

  /**
   * Computes the used memory percentage of the provided VDC storage
   * @param storage VDC Storage
   */
  private _computeStoragePercentage(storage: ServerStorage): number {
    if (isNullOrEmpty(storage)) { return 0; }
    let percentage = 100 * storage.usedMB / storage.limitMB;
    return Math.round(percentage);
  }

  /**
   * Get the number of storage that has low remaining memory
   */
  private _getLowStorageCount(): number {
    if (isNullOrEmpty(this.selectedVdc.storage)) { return 0; }

    let storages = this.selectedVdc.storage.filter((storage) => {
      let storagePercentage = this._computeStoragePercentage(storage);
      return storagePercentage >= VDC_LOW_STORAGE_PERCENTAGE;
    });
    return (!isNullOrEmpty(storages)) ? storages.length : 0;
  }

  /**
   * Initialize the server resources based on repository cache
   * and check whether the resource has self managed type
   */
  private _validateResources(): void {
    this._serversResourcesRespository.findAllRecords()
      .subscribe((resources) => {
        this.hasResources = !isNullOrEmpty(resources);
        this._changeDetectorRef.markForCheck();
      });
  }
}
