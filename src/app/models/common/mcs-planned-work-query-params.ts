import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsPlannedWorkQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'category' })
  public category?: Category;
}

export type Category = 'currentfuture' | 'past' | '';