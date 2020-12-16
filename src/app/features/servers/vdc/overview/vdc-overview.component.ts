import {
  Component,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Injector,
} from '@angular/core';
import {
  CoreRoutes,
  McsNavigationService,
  McsAccessControlService
} from '@app/core';
import {
  isNullOrEmpty,
  replacePlaceholder,
  getSafeProperty,
  CommonDefinition,
  createObject,
  pluck
} from '@app/utilities';
import {
  RouteKey,
  McsResource,
  McsResourceStorage,
  PlatformType,
  McsExpandResourceStorage,
  McsPermission
} from '@app/models';
import { McsEvent } from '@app/events';
import { VdcDetailsBase } from '../vdc-details.base';
import { map } from 'rxjs/operators';
import { McsResourceNetworkSubnet } from '@app/models/response/mcs-resource-network-subnet';

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

export class VdcOverviewComponent extends VdcDetailsBase implements OnDestroy {
  public resourceDetailLabels: ResourceDetailLabels;

  private _resourceDetailLabelMap: Map<PlatformType, ResourceDetailLabels>;
  private _lowestStorageCount: number = 0;

  constructor(
    _injector: Injector,
    _changeDetectorRef: ChangeDetectorRef,
    private _accessControlService: McsAccessControlService,
    private _navigationService: McsNavigationService
  ) {
    super(_injector, _changeDetectorRef);
    this._createResourceDetailLabelMap();
  }

  public ngOnDestroy(): void {
    this.dispose();
  }

  public get warningIconKey(): string {
    return CommonDefinition.ASSETS_SVG_WARNING;
  }

  public get routeKeyEnum(): any {
    return RouteKey;
  }

  /**
   * Returns true if there is a storage with low available memory
   */
  public get hasLowStorage(): boolean {
    let lowStorageCount = this._lowestStorageCount;
    return lowStorageCount > 0;
  }

  /**
   * Returns a warning for each storage with low available memory
   */
  public get storageSummary(): string {
    if (!this.hasLowStorage) { return ''; }

    let status = this.translateService.instant('serversVdcOverview.shared.storageProfiles.lowStorageSummary');
    let storageCount = this._lowestStorageCount;
    status = replacePlaceholder(status, 'storage_profile_number', `${storageCount}`);

    let verb = (storageCount === 1) ? 'is' : 'are';
    status = replacePlaceholder(status, 'verb', verb);
    return status;
  }

  public get networkGatewayLabel(): string {
    let result: Array<string> = new Array<string>();
    this.resource$.pipe(map((resource) => {
      let networks = getSafeProperty(resource, object => object.networks, []);
      let netWorkSubnets = pluck(networks, 'subnets') as McsResourceNetworkSubnet[];
      let gateways = pluck(netWorkSubnets, 'gateWay') as Array<string>;
      result.concat(gateways);
    }));
    return result.join(`\r\n`);
  }

  /**
   * Returns true when vdc can create new server
   * @param resource Resource to be checked
   */
  public canCreateNewServer(resource: McsResource): boolean {
    let isSelfManaged = getSafeProperty(resource, (obj) => obj.isSelfManaged);
    let requiredPermissions = isSelfManaged ?
      [McsPermission.CloudVmEdit] :
      [McsPermission.OrderEdit, McsPermission.OrderApprove];
    return this._accessControlService.hasPermission(requiredPermissions);
  }

  /**
   * Navigate details tab into given key route
   * @param keyRoute Keyroute where to navigate
   */
  public navigateVdcDetailTo(resource, keyRoute: RouteKey): void {
    this._navigationService.navigateTo(RouteKey.VdcDetails,
      [resource.id, CoreRoutes.getNavigationPath(keyRoute)]
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
  public createNewServer(resource: McsResource): void {
    this._navigationService.navigateTo(RouteKey.ServerCreate, [], { queryParams: { resource: resource.id } });
  }

  /**
   * An abstract method that get notified when the vdc selection has been changed
   */
  protected resourceChange(resource: McsResource): void {
    let platform = getSafeProperty(resource, (obj) => obj.platform, PlatformType.VCloud);
    this.resourceDetailLabels = this._resourceDetailLabelMap.get(platform);
    this._lowestStorageCount = this._getLowStorageCount(resource);
    this.changeDetectorRef.markForCheck();
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

    this._resourceDetailLabelMap = new Map();
    this._resourceDetailLabelMap.set(PlatformType.VCloud, vcloudLabels);
    this._resourceDetailLabelMap.set(PlatformType.VCenter, vcenterLabels);
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
  private _getLowStorageCount(resource: McsResource): number {
    let resourceStorages = getSafeProperty(resource, (obj) => obj.storage) || [];
    let lowestStorage = resourceStorages.filter((storage) => {
      let storagePercentage = this._computeStoragePercentage(storage);
      return storagePercentage >= VDC_LOW_CAPACITY_STORAGE_PERCENTAGE;
    });
    return (!isNullOrEmpty(lowestStorage)) ? lowestStorage.length : 0;
  }
}
