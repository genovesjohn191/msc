import {
  ServerIpAllocationMode,
  ServerIpAllocationModeSerialization,
  serverIpAllocationModeText
} from '../enumerations/server-ip-allocation-mode.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerNic {
  public id: string;
  public vCloudNicId: string;
  public name: string;
  public ipAddress: string[];
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
  public deviceType: string;

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
    this.ipAddress = undefined;
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
}
