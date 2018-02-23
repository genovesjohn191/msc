export class ServerUpdate {
  public memoryMB: number;
  public storageMB: number;
  public cpuCount: number;
  public clientReferenceObject: any;

  constructor() {
    this.memoryMB = undefined;
    this.storageMB = undefined;
    this.cpuCount = undefined;
    this.clientReferenceObject = undefined;
  }
}
