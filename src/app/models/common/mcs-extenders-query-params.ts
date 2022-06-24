import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsExtendersQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'service_end' })
  public serviceEnd?: string;
}