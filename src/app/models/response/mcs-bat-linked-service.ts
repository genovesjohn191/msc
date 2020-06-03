import { JsonProperty } from '@app/utilities';
import { McsBatAssociatedServer } from './mcs-bat-associated-server';
import { McsEntityBase } from '../common/mcs-entity.base';
import {
  BatLinkedServiceType,
  BatLinkedServiceTypeSerialization,
  batLinkedServiceTypeText
} from '../enumerations/bat-linked-service-type.enum';

export class McsBatLinkedService extends McsEntityBase {

  @JsonProperty({ target: McsBatAssociatedServer })
  public associatedServer: McsBatAssociatedServer = undefined;

  @JsonProperty({
    serializer: BatLinkedServiceTypeSerialization,
    deserializer: BatLinkedServiceTypeSerialization
  })
  public serviceType: BatLinkedServiceType = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public dailySchedule: string = undefined;

  public get serviceTypeLabel(): string {
    return batLinkedServiceTypeText[this.serviceType];
  }
}
