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
  ServerResourceStorage,
  ServerServiceType
} from '../../models';
import { VdcService } from '../vdc.service';
import {
  CoreDefinition,
  McsTextContentProvider
} from '../../../../core';
import {
  isNullOrEmpty,
  appendUnitSuffix,
  convertToGb,
  replacePlaceholder
} from '../../../../utilities';

const VDC_STORAGE_LOW_PERCENTAGE = 85;

@Component({
  selector: 'mcs-vdc-overview',
  templateUrl: './vdc-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VdcOverviewComponent implements OnInit, OnDestroy {

  public textContent: any;

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

  public get vdcMemoryValue(): string {
    return appendUnitSuffix(this.vdc.memoryLimitMB, 'megabyte');
  }

  public get vdcCpuValue(): string {
    return appendUnitSuffix(this.vdc.cpuLimit, 'cpu');
  }

  public get hasLowCapacityStorage(): boolean {
    return this.getLowCapacityStorage() > 0;
  }

  // TODO: Will remove once we have create server page for Managed
  public get isSelfManaged(): boolean {
    return this.vdc.serviceType === ServerServiceType.SelfManaged;
  }

  constructor(
    private _textContentProvider: McsTextContentProvider,
    private _changeDetectorRef: ChangeDetectorRef,
    private _vdcService: VdcService,
    private _router: Router
  ) {
    this.vdc = new ServerResource();
  }

  public ngOnInit(): void {
    this.textContent = this._textContentProvider.content.servers.vdc.overview;
    this._setVdcData();
  }

  public ngOnDestroy(): void {
    if (!isNullOrEmpty(this._vdcSubscription)) {
      this._vdcSubscription.unsubscribe();
    }
  }

  /**
   * Return the server type according to status
   * @param serviceType Service type of the server
   */
  public getServiceTypeText(serviceType: ServerServiceType): string {
    let serviceTypeText = '';

    switch (serviceType) {
      case ServerServiceType.SelfManaged:
        serviceTypeText = CoreDefinition.SERVER_SELF_MANAGED;
        break;

      case ServerServiceType.Managed:
      default:
        serviceTypeText = CoreDefinition.SERVER_MANAGED;
        break;
    }

    return serviceTypeText;
  }

  public getStorageStatusIconKey(storage: ServerResourceStorage): string {
    let iconKey = '';

    let percentage = this._computeStorageValuePercentage(storage);

    if (percentage <= 75) {
      iconKey = CoreDefinition.ASSETS_SVG_STATE_RUNNING;
    } else if (percentage >= 75 && percentage <= 85) {
      iconKey = CoreDefinition.ASSETS_SVG_STATE_RESTARTING;
    } else {
      iconKey = CoreDefinition.ASSETS_SVG_STATE_STOPPED;
    }

    return iconKey;
  }

  public getStorageStatus(enabled: boolean): string {
    let status = '';

    if (enabled) {
      status = 'Enabled';
    } else {
      status = 'Disabled';
    }

    return status;
  }

  public getCurrentStorageValues(usedMB: number, limitMB: number): string {
    if (isNullOrEmpty(usedMB) || isNullOrEmpty(limitMB)) { return ''; }

    let usedGB = appendUnitSuffix(Math.round(convertToGb(usedMB)), 'gigabyte');
    let limitGB = appendUnitSuffix(Math.round(convertToGb(limitMB)), 'gigabyte');

    return `(${usedGB} of ${limitGB})`;
  }

  public getLowCapacityStorage(): number {
    if (isNullOrEmpty(this.vdc.storage)) { return 0; }

    let storages = this.vdc.storage.filter((storage) => {
      return this._computeStorageValuePercentage(storage) >= VDC_STORAGE_LOW_PERCENTAGE;
    });

    return storages.length;
  }

  public isStorageProfileLow(storage: ServerResourceStorage): boolean {
    if (isNullOrEmpty(storage)) { return false; }

    return this._computeStorageValuePercentage(storage) > 85;
  }

  public displayStorageSummary(): string {
    if (!this.hasLowCapacityStorage) { return ''; }

    let status = this.textContent.storageProfiles.lowStorageSummary;

    let storageCount = this.getLowCapacityStorage();
    status = replacePlaceholder(status, 'storage_profile_number', `${storageCount}`);

    let verb = (storageCount === 1) ? 'is' : 'are' ;
    status = replacePlaceholder(status, 'verb', verb);

    return status;
  }

  // TODO: Will update once we have create server page for Managed
  public createNewServer(type: ServerServiceType): void {
    if (type === ServerServiceType.Managed) { return; }

    this._router.navigate(['/servers/create']);
  }

  private _setVdcData(): void {
    this._vdcSubscription = this._vdcService.selectedVdcStream
      .subscribe((vdc) => {
        if (!isNullOrEmpty(vdc)) {
          this.vdc = vdc;
        }
    });
  }

  private _computeStorageValuePercentage(storage: ServerResourceStorage): number {
    if (isNullOrEmpty(storage)) { return 0; }

    let percentage = 100 * storage.usedMB / storage.limitMB;

    return Math.round(percentage);
  }
}
