import { McsEnumSerializationBase } from "../serialization/mcs-enum-serialization-base";

export enum Day {
  Sunday = 1,
  Monday = 2,
  Tuesday = 3,
  Wednesday = 4,
  Thursday = 5,
  Friday = 6,
  Saturday = 7
}


export const dayText = {
  [Day.Monday]: 'Monday',
  [Day.Tuesday]: 'Tuesday',
  [Day.Wednesday]: 'Wednesday',
  [Day.Thursday]: 'Thursday',
  [Day.Friday]: 'Friday',
  [Day.Saturday]: 'Saturday',
  [Day.Sunday]: 'Sunday'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class DaySerialization
  extends McsEnumSerializationBase<Day> {
  constructor() { super(Day); }
}
