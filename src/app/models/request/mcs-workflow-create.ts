import { JsonProperty } from '@app/utilities';

export class McsWorkflowCreate {
   @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public referenceId: string = undefined;

  @JsonProperty()
  public parentReferenceId: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public properties: any;
}
