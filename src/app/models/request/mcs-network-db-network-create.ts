import { JsonProperty } from '@app/utilities';

export class McsNetworkDbNetworkCreate {
  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public useCase: string = undefined;
}
