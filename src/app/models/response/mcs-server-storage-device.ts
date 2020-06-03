import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerStorageDevice extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public sizeMB: number = undefined;

  @JsonProperty()
  public storageDeviceType: string = undefined;

  @JsonProperty()
  public storageDeviceInterfaceType: string = undefined;

  @JsonProperty()
  public backingVCenter: string = undefined;

  @JsonProperty()
  public backingId: string = undefined;

  @JsonProperty()
  public storageProfile: string = undefined;

  @JsonProperty()
  public wwn: string = undefined;

  @JsonProperty()
  public vendor: string = undefined;

  @JsonProperty()
  public remoteHost: string = undefined;

  @JsonProperty()
  public remotePath: string = undefined;

  @JsonProperty()
  public isPrimary: boolean = undefined;
}
