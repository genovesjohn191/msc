import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum StorageProfileIops {
  Superior = 'Superior',
  Premium = 'Premium',
  Premium2 = 'Premium2',
  Performance700 = 'PERFORMANCE-700',
  Performance2000 = 'PERFORMANCE-2000',
  Performance8000 = 'PERFORMANCE-8000'
}

export const storageProfileIopsText = {
  [StorageProfileIops.Superior]: '700',
  [StorageProfileIops.Premium]: '2000',
  [StorageProfileIops.Premium2]: '8000',
  [StorageProfileIops.Performance700]: '700',
  [StorageProfileIops.Performance2000]: '2000',
  [StorageProfileIops.Performance8000]: '8000'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class StorageProfileIopsSerialization
  extends McsEnumSerializationBase<StorageProfileIops> {
  constructor() { super(StorageProfileIops); }
}