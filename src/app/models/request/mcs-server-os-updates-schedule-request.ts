export class McsServerOsUpdatesScheduleRequest {
  public runOnce: boolean;
  public crontab: string;
  public categories: string[];
  public updates: string[];

  constructor() {
    this.runOnce = undefined;
    this.crontab = undefined;
    this.categories = undefined;
    this.updates = undefined;
  }
}
