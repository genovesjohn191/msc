import { McsEnumSerializationBase } from "@app/models/serialization/mcs-enum-serialization-base";

export enum DedicatedProvider {
  DedicatedProviderVdc = 'Dedicated Provider VDC',
  HighPerformanceDedicatedProviderVdc = 'High-Performance Dedicated Provider VDC'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class DedicatedProviderSerialization
  extends McsEnumSerializationBase<DedicatedProvider> {
  constructor() { super(DedicatedProvider); }
}
