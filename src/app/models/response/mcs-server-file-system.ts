export class McsServerFileSystem {
  public path: string;
  public capacityGB: number;
  public freeSpaceGB: number;

  constructor() {
    this.path = undefined;
    this.capacityGB = undefined;
    this.freeSpaceGB = undefined;
  }
}
