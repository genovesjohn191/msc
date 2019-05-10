import { McsEntityBase } from '../common/mcs-entity.base';

export class McsServerStorageDevice extends McsEntityBase {
  public name: string = undefined;
  public sizeMB: number = undefined;
  public storageDeviceType: string = undefined;
  public storageDeviceInterfaceType: string = undefined;
  public backingVCenter: string = undefined;
  public backingId: string = undefined;
  public storageProfile: string = undefined;
  public wwn: string = undefined;
  public vendor: string = undefined;
  public remoteHost: string = undefined;
  public remotePath: string = undefined;
  public isPrimary: boolean = undefined;
}
