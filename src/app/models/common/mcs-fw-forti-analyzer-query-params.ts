import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsFwFortiAnalyzerQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'mode' })
  public mode?: string;
}
