import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum AzureManagementServiceChildType {
  AzureProductConsumption = 0,
  AzureProductConsumptionEnterpriseAgreement,
  AzureReservation,
  AzureSoftwareSubscription
}

export const AzureManagementServiceChildTypeText = {
  [AzureManagementServiceChildType.AzureProductConsumption]: 'Azure Product Consumption',
  [AzureManagementServiceChildType.AzureProductConsumptionEnterpriseAgreement]: 'Azure Product Consumption Enterprise Agreement',
  [AzureManagementServiceChildType.AzureReservation]: 'Azure Reservation',
  [AzureManagementServiceChildType.AzureSoftwareSubscription]: 'Azure Software Subscription'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class AzureManagementServiceChildTypeSerialization
  extends McsEnumSerializationBase<AzureManagementServiceChildType> {
  constructor() { super(AzureManagementServiceChildType); }
}
