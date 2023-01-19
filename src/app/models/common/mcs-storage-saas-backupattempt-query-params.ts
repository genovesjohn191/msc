import { JsonProperty } from '@app/utilities';

export class McsStorageSaasBackupAttemptQueryParams {
  
  @JsonProperty({ name: 'startTimeRangeAfter' })
  public periodStart?: string = undefined;

  @JsonProperty({ name: 'startTimeRangeBefore' })
  public periodEnd?: string = undefined;

}
