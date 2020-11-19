import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum WorkflowType {
  CreateManagedVm = 'launchpad.managedvm.create'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class WorkflowTypeSerialization
  extends McsEnumSerializationBase<WorkflowType> {
  constructor() { super(WorkflowType); }
}
