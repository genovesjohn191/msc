import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../../common/mcs-entity.base';
import { McsDateSerialization } from '../../serialization/mcs-date-serialization';
import { McsReportBillingAvdDailyUserService } from './mcs-report-billing-avd-daily-user-service';

export class McsReportBillingAvdDailyUser extends McsEntityBase {
  @JsonProperty({
    serializer: McsDateSerialization,
    deserializer: McsDateSerialization
  })
  public date: Date = undefined;

  @JsonProperty({ target: McsReportBillingAvdDailyUserService })
  public services: McsReportBillingAvdDailyUserService[] = undefined;
}

