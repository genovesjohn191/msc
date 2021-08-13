import { JsonProperty } from '@app/utilities';

import { McsIdSerialization } from '../serialization/mcs-id-serialization';
import { McsEntityStateBase } from './mcs-entity-state.base';

export abstract class McsEntityBase extends McsEntityStateBase {
  @JsonProperty({
    serializer: McsIdSerialization,
    deserializer: McsIdSerialization
  })
  public id: string = '';
}
