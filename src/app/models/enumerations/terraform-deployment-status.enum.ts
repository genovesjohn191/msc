
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum TerraformDeploymentStatus {
  Unknown = 'Unknown',
  InProgress = 'InProgress',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unconfirmed = 'Unconfirmed',
  New = 'New'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class TerraformDeploymentStatusSerialization
  extends McsEnumSerializationBase<TerraformDeploymentStatus> {
  constructor() { super(TerraformDeploymentStatus); }
}
