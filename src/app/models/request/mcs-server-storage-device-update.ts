import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerStorageDeviceUpdate {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public storageProfile: string = undefined;

  @JsonProperty()
  public sizeMB: number = undefined;

  @JsonProperty()
  public clientReferenceObject: any = undefined;
}
