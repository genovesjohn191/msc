import { ServerOperatingSystem } from './server-operating-system';

export class ServerGroupedOs {
  public platform: string;
  public os: ServerOperatingSystem[];

  constructor() {
    this.platform = undefined;
    this.os = undefined;
  }
}
