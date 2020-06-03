import { JsonProperty } from '@app/utilities';

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
