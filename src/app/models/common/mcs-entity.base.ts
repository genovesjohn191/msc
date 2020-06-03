import { JsonProperty } from '@app/utilities';
import { McsEntityStateBase } from './mcs-entity-state.base';

export abstract class McsEntityBase extends McsEntityStateBase {
  @JsonProperty()
  public id: string = '';
}
