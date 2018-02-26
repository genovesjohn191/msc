import {
  ServerIpAllocationMode,
  ServerIpAllocationModeSerialization
} from '../enumerations/server-ip-allocation-mode.enum';
import { JsonProperty } from 'json-object-mapper';

export class ServerNicSummary {
  public id: string;
  public name: string;
  public ipAddress: string[];
  public adminStatus: string;
  public operStatus: string;
  public maxSpeed: string;
  public mtu: number;
  public macAddress: string;
  public isSubInterface: boolean;
  public vlanId: number;
  public portgroup: string;
  public networkName: string;
  public index: number;
  public isPrimary: boolean;

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
    this.networkName = undefined;
    this.index = undefined;
    this.isPrimary = undefined;
    this.ipAllocationMode = undefined;
  }
}
