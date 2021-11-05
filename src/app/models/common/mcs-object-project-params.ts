import { JsonProperty } from '@app/utilities';

import { McsQueryParam } from './mcs-query-param';

export class McsObjectProjectParams extends McsQueryParam {
  @JsonProperty({ name: 'state' })
  public state: string = undefined;

  @JsonProperty({ name: 'assignee' })
  public assignee?: string = undefined;
}
