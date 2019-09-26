import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum VmPowerstateCommand {
  Start = 1,
  Restart = 2,
  Stop = 3,
  Suspend = 4,
  Resume = 5
}

/**
 * Enumeration serializer and deserializer methods
 */
export class VmPowerstateCommandSerialization
  extends McsEnumSerializationBase<VmPowerstateCommand> {
  constructor() { super(VmPowerstateCommand); }
}
