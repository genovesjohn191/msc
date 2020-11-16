import { JsonProperty } from '@app/utilities';
import { ProductType } from '../enumerations/product-type.enum';

export class McsObjectInstalledService {
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
  public description: string = undefined;

  @JsonProperty()
  public createdOn: string = undefined;
}