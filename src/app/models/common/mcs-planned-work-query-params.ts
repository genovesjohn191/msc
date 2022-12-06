import { JsonProperty } from '@app/utilities';
import { McsQueryParam } from './mcs-query-param';

export class McsPlannedWorkQueryParams extends McsQueryParam {
  @JsonProperty({ name: 'category' })
  public category?: Category;

  @JsonProperty({ name: 'affectedPlatform' })
  public affectedPlatform?: AffectedPlatform;
}

export type Category = 'currentfuture' | 'past' | '';
export type AffectedPlatform = 'private' | 'public' | '';