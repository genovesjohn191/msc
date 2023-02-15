import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsResourceQueryParam extends McsQueryParam {
  @JsonProperty({ name: 'platform' })
  public platform?: string;
}
