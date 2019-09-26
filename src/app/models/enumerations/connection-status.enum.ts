import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

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
export class ConnectionStatusSerialization
  extends McsEnumSerializationBase<ConnectionStatus> {
  constructor() { super(ConnectionStatus); }
}
