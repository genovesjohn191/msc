import { JsonProperty } from '@app/utilities';
import { StatusCode } from '../enumerations/status-code.enum';

export class McsValidation {
  @JsonProperty()
  public referenceId: string = undefined;

  @JsonProperty()
  public field: string = undefined;

  @JsonProperty()
  public code: StatusCode = undefined;

  @JsonProperty()
  public message: string = undefined;
}
