import { JsonProperty } from '@app/utilities';
import { ProductType } from '../enumerations/product-type.enum';

export class McsObjectCrispElementServiceAttribute {
  @JsonProperty()
  public code: string = undefined;

  @JsonProperty()
  public value: string = undefined;

  @JsonProperty()
  public displayValue: string = undefined;
}

export class McsObjectCrispElement {
  @JsonProperty()
  public id: string = undefined;

  @JsonProperty()
  public companyId: string = undefined;

  @JsonProperty()
  public companyName: string = undefined;

  @JsonProperty()
  public productType: ProductType = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public orderId: string = undefined;

  @JsonProperty()
  public productId: string = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public status: string = undefined;

  @JsonProperty()
  public createdOn: string = undefined;

  @JsonProperty({ target: McsObjectCrispElementServiceAttribute })
  public serviceAttributes: McsObjectCrispElementServiceAttribute[] = undefined;
}
