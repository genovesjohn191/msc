import { JsonProperty } from '@app/utilities';

export class McsOrderItemCreate {
  @JsonProperty()
  public serviceId?: string = undefined;

  @JsonProperty()
  public itemOrderType?: string = undefined;

  @JsonProperty()
  public referenceId?: string = undefined;

  @JsonProperty()
  public parentServiceId?: string = undefined;

  @JsonProperty()
  public parentReferenceId?: string = undefined;

  @JsonProperty()
  public properties?: any = undefined;
}
