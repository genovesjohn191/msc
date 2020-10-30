import { McsEnumSerializationBase } from '../serialization/mcs-enum-serialization-base';

export enum TicketType {
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

export const ticketTypeText = {
  [TicketType.None]: 'Undefined',
  [TicketType.AdminTask]: 'Admin Task',
  [TicketType.Applications]: 'Applications',
  [TicketType.Backup]: 'Backup',
  [TicketType.Carrier]: 'Carrier',
  [TicketType.Colocation]: 'Colocation',
  [TicketType.Compute]: 'Compute',
  [TicketType.Enquiry]: 'Enquiry',
  [TicketType.Facilities]: 'Facilities',
  [TicketType.Fleetview]: 'Fleetview',
  [TicketType.Handover]: 'Handover',
  [TicketType.Inview]: 'Inview',
  [TicketType.Macquarieview]: 'Macquarieview',
  [TicketType.Networking]: 'Networking',
  [TicketType.PlannedOutage]: 'Planned Outage',
  [TicketType.PortalsMgmtTools]: 'Portals Management Tools',
  [TicketType.Provisioning]: 'Provisioning',
  [TicketType.RepetitiveBounce]: 'Repetitive Bounce',
  [TicketType.SecureInternetGateway]: 'Secure Internet Gateway',
  [TicketType.Security]: 'Security',
  [TicketType.SecurityFacilities]: 'Security Facilities',
  [TicketType.ServiceDegradation]: 'Service Degradation',
  [TicketType.ServiceDeliveryProvisioning]: 'Service Delivery Provisioning',
  [TicketType.ServiceOutage]: 'Service Outage',
  [TicketType.Storage]: 'Storage',
  [TicketType.System]: 'System',
  [TicketType.TroubleTicket]: 'Trouble Ticket'
};

/**
 * Enumeration serializer and deserializer methods
 */
export class TicketTypeSerialization
  extends McsEnumSerializationBase<TicketType> {
  constructor() { super(TicketType); }
}
