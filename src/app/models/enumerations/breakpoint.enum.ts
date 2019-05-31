import { CacheKey } from 'json-object-mapper';
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum Breakpoint {
  XSmall = 1,
  Small = 2,
  Medium = 4,
  Large = 8
}

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('BreakpointSerialization')
export class BreakpointSerialization
  extends McsEnumSerializationBase<Breakpoint> {
  constructor() { super(Breakpoint); }
}
