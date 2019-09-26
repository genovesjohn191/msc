import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityStateBase } from './mcs-entity-state.base';

export abstract class McsEntityBase extends McsEntityStateBase {
  @JsonProperty()
  public id: string = '';
}
