import { McsEnumSerializationBase } from '../../../../core';

export enum TicketSubType {
  None = 0,
  AdminTask,
  Applications,
  Backup,
  Carrier,
  Colocation,
  Compute,
  Enquiry,
  Facilities,
  Fleetview,
  Handover,
  Inview,
  Macquarieview,
  Networking,
  PlannedOutage,
  PortalsMgmtTools,
  Provisioning,
  RepetitiveBounce,
  SecureInternetGateway,
  Security,
  SecurityFacilities,
  ServiceDegradation,
  ServiceDeliveryProvisioning,
  ServiceOutage,
  Storage,
  System,
  TroubleTicket
}

/**
 * Enumeration serializer and deserializer methods
 */
export class TicketSubTypeSerialization
  extends McsEnumSerializationBase<TicketSubType> {
  constructor() { super(TicketSubType); }
}
