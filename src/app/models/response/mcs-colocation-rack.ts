import { JsonProperty } from '@app/utilities';
import { McsServiceBase } from '../common/mcs-service-base';
import {
  colocationTypeText,
  ColocationType
} from '../enumerations/colocation-type.enum';

export class McsColocationRack extends McsServiceBase {

  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public rackIdentifier: string = undefined;

  public get colocationGroup(): string {
    return colocationTypeText[ColocationType.Racks];
  }
}
