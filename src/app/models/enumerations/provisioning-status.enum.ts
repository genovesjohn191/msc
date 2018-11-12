import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum ProvisioningStatus {
  Error = -1,
  Unknown = 0,
  NotStarted = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ProvisioningStatusSerialization')
export class ProvisioningStatusSerialization
  extends McsEnumSerializationBase<ProvisioningStatus> {
  constructor() { super(ProvisioningStatus); }
}
