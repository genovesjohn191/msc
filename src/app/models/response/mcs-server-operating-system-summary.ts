export class McsServerOperatingSystemSummary {
  public vendor: string;
  public release: string;
  public version: string;
  public type: string;
  public edition: string;
  public guestOs: string;

  constructor() {
    this.vendor = undefined;
    this.release = undefined;
    this.version = undefined;
    this.type = undefined;
    this.edition = undefined;
    this.guestOs = undefined;
  }
}
