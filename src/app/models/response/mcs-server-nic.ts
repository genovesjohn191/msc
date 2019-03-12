import { JsonProperty } from 'json-object-mapper';
import { isNullOrEmpty } from '@app/utilities';
import {
  IpAllocationMode,
  IpAllocationModeSerialization,
  ipAllocationModeText
} from '../enumerations/ip-allocation-mode.enum';
import {
  DeviceType,
  DeviceTypeSerialization,
  deviceTypeText
} from '../enumerations/device-type.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerNic extends McsEntityBase {
  public vCloudNicId: string;
  public name: string;
  public ipAddresses: string[];
  public vCloudIpAddress: string;
  public index: number;
  public isPrimary: boolean;
  public adminStatus: string;
  public operStatus: string;
  public maxSpeed: string;
  public mtu: number;
  public macAddress: string;
  public isSubInterface: boolean;
  public vlanId: number;
  public portgroup: string;
  public portgroupName: string;
  public logicalNetworkName: string;

  @JsonProperty({
    type: DeviceType,
    serializer: DeviceTypeSerialization,
    deserializer: DeviceTypeSerialization
  })
  public deviceType: DeviceType;

  @JsonProperty({
    type: IpAllocationMode,
    serializer: IpAllocationModeSerialization,
    deserializer: IpAllocationModeSerialization
  })
  public ipAllocationMode: IpAllocationMode;

  constructor() {
    super();
    this.vCloudNicId = undefined;
    this.name = undefined;
    this.ipAddresses = undefined;
    this.vCloudIpAddress = undefined;
    this.adminStatus = undefined;
    this.operStatus = undefined;
    this.maxSpeed = undefined;
    this.mtu = undefined;
    this.macAddress = undefined;
    this.isSubInterface = undefined;
    this.vlanId = undefined;
    this.portgroup = undefined;
    this.portgroupName = undefined;
    this.logicalNetworkName = undefined;
    this.deviceType = undefined;
    this.index = undefined;
    this.isPrimary = undefined;
    this.ipAllocationMode = undefined;
  }

  /**
   * Returns the ip allocation mode label
   */
  public get ipAllocationModeLabel(): string {
    return ipAllocationModeText[this.ipAllocationMode];
  }

  /**
   * Returns the device type label
   */
  public get deviceTypeLabel(): string {
    return deviceTypeText[this.deviceType];
  }

  /**
   * Returns the logical ip addresses of the nic
   */
  public get logicalIpAddresses(): string[] {
    let noIpAddress = isNullOrEmpty(this.ipAddresses) && isNullOrEmpty(this.vCloudIpAddress);
    if (noIpAddress) { return undefined; }
    return isNullOrEmpty(this.ipAddresses) ? [this.vCloudIpAddress] : this.ipAddresses;
  }
}
