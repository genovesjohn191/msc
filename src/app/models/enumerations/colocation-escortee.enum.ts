import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ColocationEscortee {
  MySelf = 0,
  SomeoneElse
}

export const colocationEscorteeText = {
  [ColocationEscortee.MySelf]: 'Myself',
  [ColocationEscortee.SomeoneElse]: 'Someone else'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ColocationEscorteeSerialization
  extends McsEnumSerializationBase<ColocationEscortee> {
  constructor() { super(ColocationEscortee); }
}
