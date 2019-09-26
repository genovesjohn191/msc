import { JsonProperty } from '@peerlancers/json-serialization';

export class McsOrderError {
  @JsonProperty()
  public referenceId: string = undefined;

  @JsonProperty()
  public errorCode: string = undefined;

  @JsonProperty()
  public message: string = undefined;
}
