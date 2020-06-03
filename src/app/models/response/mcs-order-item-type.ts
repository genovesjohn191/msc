import { JsonProperty } from '@app/utilities';
import {
  ItemType,
  ItemTypeSerialization
} from '../enumerations/item-type.enum';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsOrderItemType extends McsEntityBase {
  @JsonProperty()
  public elementCode: string = undefined;

  @JsonProperty()
  public productCode: string = undefined;

  @JsonProperty({
    serializer: ItemTypeSerialization,
    deserializer: ItemTypeSerialization
  })
  public itemType: ItemType = undefined;

  @JsonProperty()
  public orderChangeType: string = undefined;

  @JsonProperty()
  public productId: string = undefined;

  @JsonProperty()
  public productOrderType: string = undefined;

  @JsonProperty()
  public automatedProvisioningAvailable: true = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public provisioningEndpoint: string = undefined;
}
