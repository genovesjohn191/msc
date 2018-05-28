import { McsEnumSerializationBase } from '../../../../core';
import { CacheKey } from 'json-object-mapper';

export enum MediaCommand {
  None = 0,
  Attach = 1,
  Delete = 2,
  Rename = 3
}

export const mediaCommandText = {
  [MediaCommand.Attach]: 'Attach',
  [MediaCommand.Delete]: 'Delete',
  [MediaCommand.Rename]: 'Rename'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('MediaCommandSerialization')
export class MediaCommandSerialization
  extends McsEnumSerializationBase<MediaCommand> {
  constructor() { super(MediaCommand); }
}
