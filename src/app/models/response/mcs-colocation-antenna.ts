import { JsonProperty } from '@app/utilities';
import { McsServiceBase } from '../common/mcs-service-base';

export class McsColocationAntenna extends McsServiceBase {
  @JsonProperty()
  public description: string = undefined;
}
