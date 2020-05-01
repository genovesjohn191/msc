import { JsonProperty } from '@peerlancers/json-serialization';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsServerOsUpdatesCategory } from './mcs-server-os-updates-category';

export class McsServerOsUpdatesSchedule extends McsEntityBase {
  @JsonProperty()
  public serverId: string = undefined;

  @JsonProperty()
  public categories: McsServerOsUpdatesCategory[] = undefined;

  @JsonProperty()
  public updates: any[] = undefined;

  @JsonProperty()
  public crontab: string = undefined;

  @JsonProperty()
  public runOnce: boolean = undefined;

  @JsonProperty()
  public snapshot: boolean = undefined;
}
