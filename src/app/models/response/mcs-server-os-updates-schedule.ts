import { JsonProperty } from '@app/utilities';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsServerOsUpdatesCategory } from './mcs-server-os-updates-category';
import { McsServerOsUpdatesScheduleDetails } from './mcs-server-os-updates-schedule-details';
import { McsServerOsUpdatesJob } from './mcs-server-os-updates-job';

export class McsServerOsUpdatesSchedule extends McsEntityBase {
  @JsonProperty()
  public serverId?: string = undefined;

  @JsonProperty({ target: McsServerOsUpdatesCategory })
  public categories: McsServerOsUpdatesCategory[] = undefined;

  @JsonProperty()
  public updates?: any[] = undefined;

  @JsonProperty({ target: McsServerOsUpdatesJob })
  public job: McsServerOsUpdatesJob = undefined;

  @JsonProperty()
  public restart: boolean = undefined;

  @JsonProperty()
  public snapshot: boolean = undefined;
}
