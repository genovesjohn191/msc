import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum NetworkDbPodType {
  Launch = 0,
  L2C = 1,
  NAS = 2
}

export const networkDbPodTypeText = {
  [NetworkDbPodType.Launch]: 'Launch',
  [NetworkDbPodType.L2C]: 'L2C',
  [NetworkDbPodType.NAS]: 'NAS'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class NetworkDbPodTypeSerialization
  extends McsEnumSerializationBase<NetworkDbPodType> {
  constructor() { super(NetworkDbPodType); }
}
