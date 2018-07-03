export class ServerStorageDevice {
  public id: string;
  public name: string;
  public sizeMB: number;
  public storageDeviceType: string;
  public storageDeviceInterfaceType: string;
  public backingVCenter: string;
  public backingId: string;
  public storageProfile: string;
  public wwn: string;
  public vendor: string;
  public remoteHost: string;
  public remotePath: string;

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.sizeMB = undefined;
    this.storageDeviceType = undefined;
    this.storageDeviceInterfaceType = undefined;
    this.backingVCenter = undefined;
    this.backingId = undefined;
    this.storageProfile = undefined;
    this.wwn = undefined;
    this.vendor = undefined;
    this.remoteHost = undefined;
    this.remotePath = undefined;
  }
}
