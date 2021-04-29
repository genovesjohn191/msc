import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum TerraformDeploymentActivityType {
  Plan = 'Plan',
  Apply = 'Apply',
  Destroy = 'Destroy'
}

/**
 * Enumeration serializer and deserializer methods
 */
export class TerraformDeploymentActivityTypeSerialization
  extends McsEnumSerializationBase<TerraformDeploymentActivityType> {
  constructor() { super(TerraformDeploymentActivityType); }
}
