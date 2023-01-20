import { JsonProperty } from '@app/utilities';
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
  @JsonProperty()
  public vCloudNicId: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public ipAddresses: string[] = undefined;

  @JsonProperty()
  public vCloudIpAddress: string = undefined;

  @JsonProperty()
  public index: number = undefined;

  @JsonProperty()
  public isPrimary: boolean = undefined;

  @JsonProperty()
  public adminStatus: string = undefined;

  @JsonProperty()
  public operStatus: string = undefined;

  @JsonProperty()
  public maxSpeed: string = undefined;

  @JsonProperty()
  public mtu: number = undefined;

  @JsonProperty()
  public macAddress: string = undefined;

  @JsonProperty()
  public isSubInterface: boolean = undefined;

  @JsonProperty()
  public vlanId: number = undefined;

  @JsonProperty()
  public portgroup: string = undefined;

  @JsonProperty()
  public portgroupName: string = undefined;

  @JsonProperty()
  public logicalNetworkName: string = undefined;

  @JsonProperty()
  public networkName: string = undefined;

  @JsonProperty({
    serializer: DeviceTypeSerialization,
    deserializer: DeviceTypeSerialization
  })
  public deviceType: DeviceType = undefined;

  @JsonProperty({
    serializer: IpAllocationModeSerialization,
    deserializer: IpAllocationModeSerialization
  })
  public ipAllocationMode: IpAllocationMode = undefined;

  @JsonProperty()
  public vlanNumberRanges: string[] = undefined;

  @JsonProperty()
  public isESXVirtualKernelInterface: boolean = undefined;

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

  public get unpackedVlanNumberRanges(): number[] {
    if(isNullOrEmpty(this.vlanNumberRanges)) { return []; }
    let vlanIds: number[] = [];
    this.vlanNumberRanges.forEach(vlanNumberRange => {
      let dashIndex = vlanNumberRange.indexOf('-');
      if(dashIndex !== -1){
        let startingNumber = +vlanNumberRange.slice(0, dashIndex);
        let endingNumber = +vlanNumberRange.slice(dashIndex+1, vlanNumberRange.length);
        if(endingNumber > startingNumber){
          for (let currentVlanNumber = startingNumber; currentVlanNumber <= endingNumber; currentVlanNumber++) {
            vlanIds.push(currentVlanNumber);
          }
        }
      }
      else{
        vlanIds.push(+vlanNumberRange);
      }
    });
    return vlanIds;
  }
}
