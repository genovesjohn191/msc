
import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum TerraformDeploymentStatus {
  Unknown = 'Unknown',
  InProgress = 'InProgress',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  WaitingConfirmation = 'WaitingConfirmation',
  New = 'New'
}

export const terraformDeploymentStatusText = {
  [TerraformDeploymentStatus.Unknown]: 'Unknown',
  [TerraformDeploymentStatus.InProgress]: 'In-Progress',
  [TerraformDeploymentStatus.Succeeded]: 'Succeeded',
  [TerraformDeploymentStatus.Failed]: 'Failed',
  [TerraformDeploymentStatus.WaitingConfirmation]: 'Waiting for Confirmation',
  [TerraformDeploymentStatus.New]: 'New'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class TerraformDeploymentStatusSerialization
  extends McsEnumSerializationBase<TerraformDeploymentStatus> {
  constructor() { super(TerraformDeploymentStatus); }
}
