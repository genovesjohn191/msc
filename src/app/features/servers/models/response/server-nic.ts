import {
  ServerIpAllocationMode,
  ServerIpAllocationModeSerialization,
  serverIpAllocationModeText
} from '../enumerations/server-ip-allocation-mode.enum';
import { JsonProperty } from 'json-object-mapper';
import { isNullOrEmpty } from '../../../../utilities';
import {
  ServerNicDeviceType,
  ServerNicDeviceTypeSerialization,
  serverNicDeviceTypeText
} from '../enumerations/server-nic-device-type.enum';

export class ServerNic {
  public id: string;
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
    type: ServerNicDeviceType,
    serializer: ServerNicDeviceTypeSerialization,
    deserializer: ServerNicDeviceTypeSerialization
  })
  public deviceType: ServerNicDeviceType;

  @JsonProperty({
    type: ServerIpAllocationMode,
    serializer: ServerIpAllocationModeSerialization,
    deserializer: ServerIpAllocationModeSerialization
  })
  public ipAllocationMode: ServerIpAllocationMode;

  // Additional flag not related to API response
  public isProcessing: boolean;

  constructor() {
    this.id = undefined;
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
    return serverIpAllocationModeText[this.ipAllocationMode];
  }

  /**
   * Returns the device type label
   */
  public get deviceTypeLabel(): string {
    return serverNicDeviceTypeText[this.deviceType];
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
