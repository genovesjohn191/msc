import { JsonProperty } from '@app/utilities';

export class McsSoftwareSubscriptionProductType {
  @JsonProperty()
  public catalogItemId: string = undefined;

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
}
