import { JsonProperty } from '@peerlancers/json-serialization';

export class McsApiError {
  @JsonProperty()
  public referenceId: string = undefined;

  @JsonProperty()
  public field: string = undefined;

  @JsonProperty()
  public code: string = undefined;

  @JsonProperty()
  public message: string = undefined;
}
