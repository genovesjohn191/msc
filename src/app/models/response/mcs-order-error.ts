import { JsonProperty } from '@app/utilities';

export class McsOrderError {
  @JsonProperty()
  public referenceId: string = undefined;

  @JsonProperty()
  public errorCode: string = undefined;

  @JsonProperty()
  public message: string = undefined;
}
