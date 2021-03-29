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
  public productId: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public properties: any;
}
