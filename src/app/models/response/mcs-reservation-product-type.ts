import { JsonProperty } from '@app/utilities';

export class McsReservationProductType {
  @JsonProperty()
  public skuName: string = undefined;

  @JsonProperty()
  public skuId: string = undefined;

  @JsonProperty()
  public productId: string = undefined;

  @JsonProperty()
  public productTerm: string = undefined;

  @JsonProperty()
  public segment: string = undefined;

  @JsonProperty()
  public catalogItemId: string = undefined;

  @JsonProperty()
  public cores: number = undefined;

  @JsonProperty()
  public diskSize: string = undefined;

  @JsonProperty()
  public ram: number = undefined;

  @JsonProperty()
  public vCpu: number = undefined;
}
