import { McsEnumSerializationBase } from '../factory/serialization/mcs-enum-serialization-base';

export enum McsConnectionStatus {
  Success = 0,
  Retrying = 1,
  Failed = -1,
  Fatal = -2
}

/**
 * Enumeration serializer and deserializer methods
 */
export class McsConnectionStatusSerialization
  extends McsEnumSerializationBase<McsConnectionStatus> {
  constructor() { super(McsConnectionStatus); }
}
