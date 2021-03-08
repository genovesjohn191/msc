import { JsonProperty } from '@app/utilities';
import { McsServiceBase } from '../common/mcs-service-base';
import {
  colocationTypeText,
  ColocationType
} from '../enumerations/colocation-type.enum';

export class McsColocationCustomDevice extends McsServiceBase {
  @JsonProperty()
  public description: string = undefined;

  @JsonProperty()
  public billingDescription: string = undefined;

  public get colocationGroup(): string {
    return colocationTypeText[ColocationType.CustomDevices];
  }
}
