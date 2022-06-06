import { JsonProperty } from '@app/utilities';

export class McsNetworkDbNetworkCreateItem {
  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public useCaseId: number = undefined;

  @JsonProperty()
  public isMazaa: boolean = undefined;

  @JsonProperty()
  public pods: number[] = undefined;
}
