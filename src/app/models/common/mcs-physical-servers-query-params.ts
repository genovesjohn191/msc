import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsPhysicalServersQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'associatedServiceId' })
  public associatedServiceId?: string = undefined;
}
