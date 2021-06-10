import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum NetworkDbVniStatus {
  Free = 0,
  Reserved = 1,
  Quarantined = 2
}

export const networkDbVniStatusText = {
  [NetworkDbVniStatus.Free]: 'Free',
  [NetworkDbVniStatus.Reserved]: 'Reserved',
  [NetworkDbVniStatus.Quarantined]: 'Quarantined'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class NetworkDbVniStatusSerialization
  extends McsEnumSerializationBase<NetworkDbVniStatus> {
  constructor() { super(NetworkDbVniStatus); }
}
