import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '@app/core';

export enum ConnectionStatus {
  Unknown,
  Up,
  Down
}

export const connectionStatusText = {
  [ConnectionStatus.Unknown]: 'Unknown',
  [ConnectionStatus.Up]: 'Up',
  [ConnectionStatus.Down]: 'Down'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('ConnectionStatusSerialization')
export class ConnectionStatusSerialization
  extends McsEnumSerializationBase<ConnectionStatus> {
  constructor() { super(ConnectionStatus); }
}
