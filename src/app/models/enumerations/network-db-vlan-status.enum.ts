import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum NetworkDbVlanStatus {
  Free,
  Reserved,
  Quarantined
}

export const networkDbVlanStatusText = {
  [NetworkDbVlanStatus.Free]: 'Free',
  [NetworkDbVlanStatus.Reserved]: 'Reserved',
  [NetworkDbVlanStatus.Quarantined]: 'Quarantined'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class NetworkDbVlanStatusSerialization
  extends McsEnumSerializationBase<NetworkDbVlanStatus> {
  constructor() { super(NetworkDbVlanStatus); }
}
