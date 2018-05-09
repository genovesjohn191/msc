import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum ServerStorageStatus {
  Disabled = 0,
  Enabled = 1
}

export const serverStorageStatusText = {
  [ServerStorageStatus.Disabled]: 'Disabled',
  [ServerStorageStatus.Enabled]: 'Enabled'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ServerStorageStatusSerialization')
export class ServerStorageStatusSerialization
  extends McsEnumSerializationBase<ServerStorageStatus> {
  constructor() { super(ServerStorageStatus); }
}
