import { McsEnumSerializationBase } from '@app/models';

export enum AzureResources {
  AddNewResources = 0
}

export const addNewResourcesText = {
  [AzureResources.AddNewResources]: 'Add new resource(s)'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class ColocationEscorteeSerialization
  extends McsEnumSerializationBase<AzureResources> {
  constructor() { super(AzureResources); }
}
