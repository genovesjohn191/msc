import { McsEnumSerializationBase } from "../serialization/mcs-enum-serialization-base";

export enum Week {
  First = 1,
  Second = 2,
  Third = 3,
  Fourth = 4,
  Fifth = 5
}

export const weekText = {
  [Week.First]: '1st',
  [Week.Second]: '2nd',
  [Week.Third]: '3rd',
  [Week.Fourth]: '4th',
  [Week.Fifth]: '5th'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class WeekSerialization
  extends McsEnumSerializationBase<Week> {
  constructor() { super(Week); }
}

