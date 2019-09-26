import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerHardware {
  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public vendor: string = undefined;

  @JsonProperty()
  public serialNumber: string = undefined;
}
