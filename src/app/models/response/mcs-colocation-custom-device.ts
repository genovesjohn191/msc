import { JsonProperty } from '@app/utilities';
import { McsServiceBase } from '../common/mcs-service-base';

export class McsColocationCustomDevice extends McsServiceBase {
  @JsonProperty()
  public description: string = undefined;
}
