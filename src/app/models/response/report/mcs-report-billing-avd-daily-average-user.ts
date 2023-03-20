import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';
import { McsDateSerialization } from '../../serialization/mcs-date-serialization';
import { McsReportBillingAvdDailyAverageUserService } from './mcs-report-billing-avd-daily-average-user-service';

export class McsReportBillingAvdDailyAverageUser extends McsEntityBase {
  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public microsoftChargeMonth: Date = undefined;

  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public macquarieBillMonth: Date = undefined;

  public date: Date = undefined;

  @JsonProperty({ target: McsReportBillingAvdDailyAverageUserService })
  public services: McsReportBillingAvdDailyAverageUserService[] = undefined;
}
