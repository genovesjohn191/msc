import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum ModuleType {
  AzureSolution = 1,
  AzureResource
}

export const moduleTypeText = {
  [ModuleType.AzureSolution]: 'Azure Solution',
  [ModuleType.AzureResource]: 'Azure Resource'
}

export class ModuleTypeSerialization
  extends McsEnumSerializationBase<ModuleType> {
  constructor() { super(ModuleType); }
}