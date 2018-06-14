import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Subscription,
  Subject
} from 'rxjs/Rx';
import { takeUntil } from 'rxjs/operators/takeUntil';
import {
  ServerResource,
  ServerStorage,
  ServerStorageStatus,
  serverStorageStatusText,
  serverServiceTypeText
} from '../../models';
import { VdcService } from '../vdc.service';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsUnitType
} from '../../../../core';
import {
  isNullOrEmpty,
  appendUnitSuffix,
  convertMbToGb,
  replacePlaceholder,
  unsubscribeSafely
} from '../../../../utilities';
import { ServersResourcesRepository } from '../../servers-resources.repository';

const VDC_LOW_STORAGE_PERCENTAGE = 85;

@Component({
  selector: 'mcs-vdc-overview',
  templateUrl: './vdc-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VdcOverviewComponent implements OnInit, OnDestroy {

  public textContent: any;
  public hasResources: boolean;

  private _vdcSubscription: Subscription;

  private _selectedVdc: ServerResource;
  public get selectedVdc(): ServerResource { return this._selectedVdc; }
  public set selectedVdc(value: ServerResource) {
    this._selectedVdc = value;
    this._changeDetectorRef.markForCheck();
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  public get vdcServiceType(): string {
    return serverServiceTypeText[this.selectedVdc.serviceType];
  }

  public get vdcMemoryValue(): string {
    return !isNullOrEmpty(this.selectedVdc.compute) ?
      appendUnitSuffix(this.selectedVdc.compute.memoryLimitMB, McsUnitType.Megabyte) : '';
  }

  public get vdcCpuValue(): string {
    return !isNullOrEmpty(this.selectedVdc.compute) ?
      appendUnitSuffix(this.selectedVdc.compute.cpuLimit, McsUnitType.CPU) : '';
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

  private _destroySubject = new Subject<void>();

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _vdcService: VdcService,
    private _textContentProvider: McsTextContentProvider,
    private _serversResourceRepository: ServersResourcesRepository
  ) {
    this.selectedVdc = new ServerResource();
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.servers.vdc.overview;
    this._listenToSelectedVdc();
    this._validateResources();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._vdcSubscription);
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
   * Returns the tier of the VDC storage.
   * @param storage VDC Storage
   */
  public getStorageTierText(storage: ServerStorage): string {
    return replacePlaceholder(this.textContent.storageProfiles.iops,
      'iops', `${storage.iops}`);
  }

  /**
   * Returns the current used and limit of storage in GB
   */
  public getCurrentStorageValues(usedMB: number, limitMB: number): string {
    if (isNullOrEmpty(usedMB) || isNullOrEmpty(limitMB)) { return ''; }

    let usedGB = appendUnitSuffix(Math.round(convertMbToGb(usedMB)), McsUnitType.Gigabyte);
    let limitGB = appendUnitSuffix(Math.round(convertMbToGb(limitMB)), McsUnitType.Gigabyte);

    return `(${usedGB} of ${limitGB})`;
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
   * Listens to the currently selected VDC stream
   */
  private _listenToSelectedVdc(): void {
    this._vdcSubscription = this._vdcService.selectedVdcStream
      .pipe(takeUntil(this._destroySubject))
      .subscribe((response) => {
        if (isNullOrEmpty(response)) { return; }
        this.selectedVdc = response;
      });
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
    this._serversResourceRepository.findAllRecords()
      .subscribe((resources) => {
        this.hasResources = !isNullOrEmpty(resources);
        this._changeDetectorRef.markForCheck();
      });
  }
}
