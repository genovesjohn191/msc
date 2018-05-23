export class ServerStorage {
  public id: string;
  public name: string;
  public iops: number;
  public enabled: boolean;
  public limitMB: number;
  public usedMB: number;
  public availableMB: number;

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.iops = undefined;
    this.enabled = undefined;
    this.limitMB = undefined;
    this.usedMB = undefined;
    this.availableMB = undefined;
  }
}
