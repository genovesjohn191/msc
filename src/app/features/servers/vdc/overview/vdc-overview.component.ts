import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector,
} from '@angular/core';
import {
  CoreRoutes,
  McsNavigationService
} from '@app/core';
import {
  isNullOrEmpty,
  replacePlaceholder,
  getSafeProperty,
  CommonDefinition,
  createObject
} from '@app/utilities';
import {
  RouteKey,
  McsResource,
  McsResourceStorage,
  PlatformType,
  McsExpandResourceStorage
} from '@app/models';
import { McsEvent } from '@app/events';
import { VdcDetailsBase } from '../vdc-details.base';

const VDC_LOW_CAPACITY_STORAGE_PERCENTAGE = 85;
const VDC_HIGH_CAPACITY_STORAGE_PERCENTAGE = 75;

type ResourceDetailLabels = {
  propertyTitle: string;
  platformTitle: string;
  newServerButtonShown: boolean;
  platformLink: string;
  networkDescription: string;
};

@Component({
  selector: 'mcs-vdc-overview',
  templateUrl: './vdc-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VdcOverviewComponent extends VdcDetailsBase implements OnInit, OnDestroy {

  private resourceDetailLabelMap: Map<PlatformType, ResourceDetailLabels>;

  public get warningIconKey(): string {
    return CommonDefinition.ASSETS_SVG_WARNING;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  public get resourceDetailLabels(): ResourceDetailLabels {
    let platform = getSafeProperty(this.selectedVdc, (obj) => obj.platform, PlatformType.VCloud);
    return this.resourceDetailLabelMap.get(platform);
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

    let status = this.translateService.instant('serversVdcOverview.shared.storageProfiles.lowStorageSummary');
    let storageCount = this._getLowStorageCount();

    status = replacePlaceholder(status, 'storage_profile_number', `${storageCount}`);

    let verb = (storageCount === 1) ? 'is' : 'are';
    status = replacePlaceholder(status, 'verb', verb);

    return status;
  }

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _navigationService: McsNavigationService
  ) {
    super(_injector, _changeDetectorRef);
    this.selectedVdc = new McsResource();
    this._createResourceDetailLabelMap();
  }

  public ngOnInit(): void {
    this.initialize();
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  /**
   * Navigate details tab into given key route
   * @param keyRoute Keyroute where to navigate
   */
  public navigateVdcDetailTo(keyRoute: RouteKey): void {
    this._navigationService.navigateTo(RouteKey.VdcDetails,
      [this.selectedVdc.id, CoreRoutes.getNavigationPath(keyRoute)]
    );
  }

  /**
   * Navigate to Ordering Expand Vdc Storage
   */
  public navigateToExpandVdcStorage(selectedResource: McsResource): void {
    let selectedResourceStorage = getSafeProperty(selectedResource, (obj) => obj.storage[0]);
    this.eventDispatcher.dispatch(
      McsEvent.vdcStorageExpandSelectedEvent,
      createObject(McsExpandResourceStorage, { resource: selectedResource, storage: selectedResourceStorage })
    );
    this._navigationService.navigateTo(RouteKey.OrderVdcStorageExpand);
  }

  /**
   * Navigate to Scale VDC Ordering
   * @param selectedResource currently selected resource
   */
  public scaleVdc(selectedResource: McsResource): void {
    this.eventDispatcher.dispatch(McsEvent.vdcScaleSelectedEvent, selectedResource);
    this._navigationService.navigateTo(RouteKey.OrderVdcScale);
  }

  /**
   * Returns the icon key based on the current status of the capacity of VDC storage.
   * Green Icon - If current storage capacity is high
   * Yellow Icon - If current storage capacity is between low and high
   * Red Icon - If current storage capacity is low
   * @param storage VDC Storage
   */
  public getStorageStatusIconKey(storage: McsResourceStorage): string {
    let percentage = this._computeStoragePercentage(storage);
    if (percentage <= VDC_HIGH_CAPACITY_STORAGE_PERCENTAGE) {
      return CommonDefinition.ASSETS_SVG_STATE_RUNNING;
    }
    if (percentage >= VDC_HIGH_CAPACITY_STORAGE_PERCENTAGE && percentage <= VDC_LOW_CAPACITY_STORAGE_PERCENTAGE) {
      return CommonDefinition.ASSETS_SVG_STATE_RESTARTING;
    }
    return CommonDefinition.ASSETS_SVG_STATE_STOPPED;
  }

  /**
   * Returns true if the storage has more than 85% used memory
   * @param storage VDC Storage
   */
  public isStorageProfileLow(storage: McsResourceStorage): boolean {
    if (isNullOrEmpty(storage)) { return false; }

    return this._computeStoragePercentage(storage) > VDC_LOW_CAPACITY_STORAGE_PERCENTAGE;
  }

  /**
   * Redirects to create new server page
   */
  public createNewServer(): void {
    this._navigationService.navigateTo(RouteKey.ServerCreate);
  }

  /**
   * An abstract method that get notified when the vdc selection has been changed
   */
  protected vdcSelectionChange(): void {
    // Do the implementation here
  }

  /**
   * Initialize the content of resource detail label Map
   */
  private _createResourceDetailLabelMap(): void {

    let vcloudLabels: ResourceDetailLabels = {
      propertyTitle: this.translateService.instant('serversVdcOverview.vcloud.properties.title'),
      platformTitle: this.translateService.instant('serversVdcOverview.vcloud.platform.title'),
      newServerButtonShown: true,
      platformLink: this.translateService.instant('serversVdcOverview.vcloud.platform.linkLabel'),
      networkDescription: this.translateService.instant('serversVdcOverview.vcloud.network.itemDescription'),
    };
    let vcenterLabels: ResourceDetailLabels = {
      propertyTitle: this.translateService.instant('serversVdcOverview.vcenter.properties.title'),
      platformTitle: this.translateService.instant('serversVdcOverview.vcenter.platform.title'),
      newServerButtonShown: false,
      platformLink: this.translateService.instant('serversVdcOverview.vcenter.platform.linkLabel'),
      networkDescription: this.translateService.instant('serversVdcOverview.vcenter.network.itemDescription'),
    };
    this.resourceDetailLabelMap = new Map();
    this.resourceDetailLabelMap.set(PlatformType.VCloud, vcloudLabels);
    this.resourceDetailLabelMap.set(PlatformType.VCenter, vcenterLabels);
  }

  /**
   * Computes the used memory percentage of the provided VDC storage
   * @param storage VDC Storage
   */
  private _computeStoragePercentage(storage: McsResourceStorage): number {
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
      return storagePercentage >= VDC_LOW_CAPACITY_STORAGE_PERCENTAGE;
    });
    return (!isNullOrEmpty(storages)) ? storages.length : 0;
  }
}
