import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector,
} from '@angular/core';
import { Router } from '@angular/router';
import { VdcDetailsBase } from '../vdc-details.base';
import {
  CoreRoutes,
  CoreDefinition
} from '@app/core';
import {
  isNullOrEmpty,
  replacePlaceholder,
  getSafeProperty
} from '@app/utilities';
import {
  RouteKey,
  McsResource,
  McsResourceStorage,
  PlatformType
} from '@app/models';

const VDC_LOW_STORAGE_PERCENTAGE = 85;

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
    return CoreDefinition.ASSETS_SVG_WARNING;
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
    private _router: Router
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
    this._router.navigate([
      CoreRoutes.getNavigationPath(RouteKey.VdcDetails),
      this.selectedVdc.id,
      CoreRoutes.getNavigationPath(keyRoute)
    ]);
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
  public getStorageStatusIconKey(storage: McsResourceStorage): string {
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
   * Returns true if the storage has more than 85% used memory
   * @param storage VDC Storage
   */
  public isStorageProfileLow(storage: McsResourceStorage): boolean {
    if (isNullOrEmpty(storage)) { return false; }

    return this._computeStoragePercentage(storage) > 85;
  }

  /**
   * Redirects to create new server page
   */
  public createNewServer(): void {
    this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.ServerCreate)]);
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
      return storagePercentage >= VDC_LOW_STORAGE_PERCENTAGE;
    });
    return (!isNullOrEmpty(storages)) ? storages.length : 0;
  }
}
