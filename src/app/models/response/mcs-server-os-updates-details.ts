export class McsServerOsUpdatesDetails {
  public id: string;
  public updateCount: number;
  public lastInspectDate: string;
  public crontab: string;
  public runOnce: boolean;

  constructor() {
    this.id = undefined;
    this.updateCount = undefined;
    this.lastInspectDate = undefined;
    this.crontab = undefined;
    this.runOnce = true;
  }
}
