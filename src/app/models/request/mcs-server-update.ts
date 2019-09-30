import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerUpdate {
  @JsonProperty()
  public memoryMB: number = undefined;

  @JsonProperty()
  public cpuCount: number = undefined;

  @JsonProperty()
  public clientReferenceObject: any = undefined;
}
