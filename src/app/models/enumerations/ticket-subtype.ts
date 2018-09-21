import { McsEnumSerializationBase } from '@app/core';
import { CacheKey } from 'json-object-mapper';

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

export const ticketSubTypeText = {
  [TicketSubType.None]: 'Undefined',
  [TicketSubType.AdminTask]: 'Admin Task',
  [TicketSubType.Applications]: 'Applications',
  [TicketSubType.Backup]: 'Backup',
  [TicketSubType.Carrier]: 'Carrier',
  [TicketSubType.Colocation]: 'Colocation',
  [TicketSubType.Compute]: 'Compute',
  [TicketSubType.Enquiry]: 'Enquiry',
  [TicketSubType.Facilities]: 'Facilities',
  [TicketSubType.Fleetview]: 'Fleetview',
  [TicketSubType.Handover]: 'Handover',
  [TicketSubType.Inview]: 'Inview',
  [TicketSubType.Macquarieview]: 'Macquarieview',
  [TicketSubType.Networking]: 'Networking',
  [TicketSubType.PlannedOutage]: 'Planned Outage',
  [TicketSubType.PortalsMgmtTools]: 'Portals Management Tools',
  [TicketSubType.Provisioning]: 'Provisioning',
  [TicketSubType.RepetitiveBounce]: 'Repetitive Bounce',
  [TicketSubType.SecureInternetGateway]: 'Secure Internet Gateway',
  [TicketSubType.Security]: 'Security',
  [TicketSubType.SecurityFacilities]: 'Security Facilities',
  [TicketSubType.ServiceDegradation]: 'Service Degradation',
  [TicketSubType.ServiceDeliveryProvisioning]: 'Service Delivery Provisioning',
  [TicketSubType.ServiceOutage]: 'Service Outage',
  [TicketSubType.Storage]: 'Storage',
  [TicketSubType.System]: 'System',
  [TicketSubType.TroubleTicket]: 'Trouble Ticket'
};

/**
 * Enumeration serializer and deserializer methods
 */
@CacheKey('TicketSubTypeSerialization')
export class TicketSubTypeSerialization
  extends McsEnumSerializationBase<TicketSubType> {
  constructor() { super(TicketSubType); }
}
