import { JsonProperty } from '@app/utilities';

import { McsQueryParam } from './mcs-query-param';

export class McsReportUpdateManagementParams extends McsQueryParam {
  @JsonProperty({ name: 'period' })
  public period?: string = undefined;
}
