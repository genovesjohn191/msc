import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsServersQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'storage_profile' })
  public storageProfile?: string = undefined;

  @JsonProperty({ name: 'expand' })
  public expand?: boolean = undefined;
}
