import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum Complexity {
    Simple = 1,
    Complex = 2
}

export const complexityText = {
    [Complexity.Simple]: 'Simple',
    [Complexity.Complex]: 'Complex'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class DeliverySerialization
  extends McsEnumSerializationBase<Complexity> {
  constructor() { super(Complexity); }
}
