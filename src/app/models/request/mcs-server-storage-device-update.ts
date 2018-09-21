export class McsServerStorageDeviceUpdate {
  public name: string;
  public storageProfile: string;
  public sizeMB: number;
  public clientReferenceObject: any;

  constructor() {
    this.name = undefined;
    this.storageProfile = undefined;
    this.sizeMB = undefined;
    this.clientReferenceObject = undefined;
  }
}
