import {
  JsonProperty,
  isNullOrEmpty } from '@app/utilities';
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

  @JsonProperty()
  public standardLeadTimeHours: number = undefined;

  @JsonProperty()
  public acceleratedLeadTimeHours: number = undefined;

  @JsonProperty()
  public isSchedulable: boolean = undefined;

  @JsonProperty()
  public contractTermApplicable: boolean = undefined;

  @JsonProperty()
  public itemChangeType: string = undefined;

  /**
   * Returns whether the order item has lead time options
   */
  public get hasLeadTimeOptions(): boolean {
    return !isNullOrEmpty(this.standardLeadTimeHours) && !isNullOrEmpty(this.acceleratedLeadTimeHours);
  }
}
