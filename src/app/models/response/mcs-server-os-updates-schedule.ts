import { McsEntityBase } from '../common/mcs-entity.base';
import { McsServerOsUpdatesCategory } from './mcs-server-os-updates-category';

export class McsServerOsUpdatesSchedule extends McsEntityBase {
  public serverId: string;
  public categories: McsServerOsUpdatesCategory[];
  public updates: any[];
  public crontab: string;
  public runOnce: boolean;

  constructor() {
    super();
    this.serverId = undefined;
    this.categories = undefined;
    this.updates = undefined;
    this.crontab = undefined;
    this.runOnce = true;
  }
}
