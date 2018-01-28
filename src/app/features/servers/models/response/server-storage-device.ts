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

  // Additional flag not related to API response
  public isProcessing: boolean;
  public processingText: string;
}
