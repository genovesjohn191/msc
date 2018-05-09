import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import {
  ServerResource,
  ServerStorage,
  ServerStorageStatus,
  serverStorageStatusText,
  ServerServiceType,
  serverServiceTypeText
} from '../../models';
import { VdcService } from '../vdc.service';
import {
  CoreDefinition,
  McsTextContentProvider,
  McsUnitType,
  McsAccessControlService
} from '../../../../core';
import {
  isNullOrEmpty,
  appendUnitSuffix,
  convertMbToGb,
  replacePlaceholder,
  unsubscribeSafely
} from '../../../../utilities';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators/takeUntil';

const VDC_LOW_STORAGE_PERCENTAGE = 85;

@Component({
  selector: 'mcs-vdc-overview',
  templateUrl: './vdc-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VdcOverviewComponent implements OnInit, OnDestroy {

  public textContent: any;
  public enumDefinition: any;

  private _vdcSubscription: Subscription;

  private _vdc: ServerResource;
  public get vdc(): ServerResource {
    return this._vdc;
  }
  public set vdc(value: ServerResource) {
    this._vdc = value;
    this._changeDetectorRef.markForCheck();
  }

  public get warningIconKey(): string {
    return CoreDefinition.ASSETS_SVG_WARNING;
  }

  public get vdcServiceType(): string {
    return serverServiceTypeText[this.vdc.serviceType];
  }

  public get vdcMemoryValue(): string {
    return !isNullOrEmpty(this.vdc.compute) ?
      appendUnitSuffix(this.vdc.compute.memoryLimitMB, McsUnitType.Megabyte) : '';
  }

  public get vdcCpuValue(): string {
    return !isNullOrEmpty(this.vdc.compute) ?
      appendUnitSuffix(this.vdc.compute.cpuLimit, McsUnitType.CPU) : '';
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

  /**
   * Returns true for self-managed vdc and for the managed vdc
   * if the feature flag was enable for creating a managed server
   */
  public get hasResourceAccess(): boolean {
    if (this.vdc.serviceType === ServerServiceType.SelfManaged) { return true; }

    let hasAccessToCreateManagedServer = this._accessControlService
      .hasAccessToFeature('enableCreateManagedServer');

    return this.vdc.serviceType === ServerServiceType.Managed
      && hasAccessToCreateManagedServer;
  }

  private _destroySubject = new Subject<void>();

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _vdcService: VdcService,
    private _router: Router,
    private _accessControlService: McsAccessControlService,
  ) {
    this.vdc = new ServerResource();
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.servers.vdc.overview;
    this.enumDefinition = this._textContentProvider.content.enumerations;
    this._listenToSelectedVdc();
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
        this.vdc = response;
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
    if (isNullOrEmpty(this.vdc.storage)) { return 0; }

    let storages = this.vdc.storage.filter((storage) => {
      let storagePercentage = this._computeStoragePercentage(storage);
      return storagePercentage >= VDC_LOW_STORAGE_PERCENTAGE;
    });

    return (!isNullOrEmpty(storages)) ? storages.length : 0;
  }
}
