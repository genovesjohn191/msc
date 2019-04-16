import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

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
@CacheKey('VmPowerstateCommandSerialization')
export class VmPowerstateCommandSerialization
  extends McsEnumSerializationBase<VmPowerstateCommand> {
  constructor() { super(VmPowerstateCommand); }
}
