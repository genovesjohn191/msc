import { JsonProperty } from '@app/utilities';

import { McsApiJobRequestBase } from '../../common/mcs-api-job-request-base';

export interface IMcsVCenterBaselineRemediateRef {
  baselineId: string;
}

export class McsVCenterBaselineRemediate extends McsApiJobRequestBase<IMcsVCenterBaselineRemediateRef> {
  @JsonProperty()
  public hostIds: string[] = undefined;
}
