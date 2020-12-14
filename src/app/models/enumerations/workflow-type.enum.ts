import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum WorkflowType {
  CreateManagedVm = 'launchpad.managedvm.create',
  AddHids = 'launchpad.hids.addon',
  AddToManagementToolsCvm = 'launchpad.managementtools.addcvm',
  RemoveFromManagementToolsCvm = 'launchpad.managementtools.deletecvm'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class WorkflowTypeSerialization
  extends McsEnumSerializationBase<WorkflowType> {
  constructor() { super(WorkflowType); }
}
