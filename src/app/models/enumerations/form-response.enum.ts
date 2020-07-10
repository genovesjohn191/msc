import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum FormResponse {
    Yes = 1,
    No = 2
}

export const formResponseText = {
    [FormResponse.Yes]: 'Yes',
    [FormResponse.No]: 'No'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class FormResponseSerialization
  extends McsEnumSerializationBase<FormResponse> {
  constructor() { super(FormResponse); }
}
