import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum BatLinkedServiceType {
  ServerBackup,
  VmBackup,
  RemoteServerBackup
}

export const batLinkedServiceTypeText = {
  [BatLinkedServiceType.ServerBackup]: 'Server Backup',
  [BatLinkedServiceType.VmBackup]: 'Vm Backup',
  [BatLinkedServiceType.RemoteServerBackup]: 'Remote Server Backup'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class BatLinkedServiceTypeSerialization
  extends McsEnumSerializationBase<BatLinkedServiceType> {
  constructor() { super(BatLinkedServiceType); }
}
