import {
JsonProperty,
isNullOrEmpty
} from '@app/utilities';
import {
  OrderItemStatus,
  OrderItemStatusSerialization,
  orderItemStatusText
} from '../enumerations/order-item-status.enum';
import {
  ProvisioningStatus,
  ProvisioningStatusSerialization,
  provisioningStatusText
} from '../enumerations/provisioning-status.enum';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsOrderCharge } from './mcs-order-charge';
import { McsDateSerialization } from '../serialization/mcs-date-serialization';

export class McsOrderItem extends McsEntityBase {
  @JsonProperty({
    serializer: ProvisioningStatusSerialization,
    deserializer: ProvisioningStatusSerialization
  })
  public itemProvisioningStatus: ProvisioningStatus = undefined;

  @JsonProperty()
  public automatedProvisioningAvailable: boolean = undefined;

  @JsonProperty()
  public referenceId: string = undefined;

  @JsonProperty()
  public parentReferenceId: string = undefined;

  @JsonProperty()
  public itemId: string = undefined;

  @JsonProperty()
  public itemOrderType: string = undefined;

  @JsonProperty()
  public parentServiceId: string = undefined;

  @JsonProperty()
  public billingSite: string = undefined;

  @JsonProperty()
  public costCentre: string = undefined;

  @JsonProperty({
    serializer: OrderItemStatusSerialization,
    deserializer: OrderItemStatusSerialization
  })
  public status: OrderItemStatus = undefined;

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public createdBy: string = undefined;

  @JsonProperty()
  public deliveryType: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public schedule: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public createdOn: Date = undefined;

  @JsonProperty()
  public modifiedBy: string = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public modifiedOn: Date = undefined;

  @JsonProperty({ target: McsOrderCharge })
  public charges: McsOrderCharge = undefined;

  @JsonProperty()
  public properties: any = undefined;

  @JsonProperty()
  public jobId: string = undefined;

  @JsonProperty()
  public taskId: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  /**
   * Returns the order status label
   */
  public get statusLabel(): string {
    return orderItemStatusText[this.status];
  }

  /**
   * Returns the item provisioning status label
   */
  public get itemProvisioningStatusLabel(): string {
    let result = (this.itemProvisioningStatus === ProvisioningStatus.Unknown) ?
                  orderItemStatusText[this.status] :
                  provisioningStatusText[this.itemProvisioningStatus];
    if (isNullOrEmpty(result)) {
      result = provisioningStatusText[ProvisioningStatus.Unknown];
    }
    return result;
  }
}
