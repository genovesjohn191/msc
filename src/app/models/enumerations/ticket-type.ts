import { McsOption } from '../common/mcs-option';
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

export const ticketTypeOptions = [
  new McsOption(TicketType.AdminTask, ticketTypeText[TicketType.AdminTask]),
  new McsOption(TicketType.Applications, ticketTypeText[TicketType.Applications]),
  new McsOption(TicketType.Backup, ticketTypeText[TicketType.Backup]),
  new McsOption(TicketType.Carrier, ticketTypeText[TicketType.Carrier]),
  new McsOption(TicketType.Colocation, ticketTypeText[TicketType.Colocation]),
  new McsOption(TicketType.Compute, ticketTypeText[TicketType.Compute]),
  new McsOption(TicketType.Enquiry, ticketTypeText[TicketType.Enquiry]),
  new McsOption(TicketType.Facilities, ticketTypeText[TicketType.Facilities]),
  new McsOption(TicketType.Fleetview, ticketTypeText[TicketType.Fleetview]),
  new McsOption(TicketType.Handover, ticketTypeText[TicketType.Handover]),
  new McsOption(TicketType.Inview, ticketTypeText[TicketType.Inview]),
  new McsOption(TicketType.Macquarieview, ticketTypeText[TicketType.Macquarieview]),
  new McsOption(TicketType.Networking, ticketTypeText[TicketType.Networking]),
  new McsOption(TicketType.PlannedOutage, ticketTypeText[TicketType.PlannedOutage]),
  new McsOption(TicketType.PortalsMgmtTools, ticketTypeText[TicketType.PortalsMgmtTools]),
  new McsOption(TicketType.Provisioning, ticketTypeText[TicketType.Provisioning]),
  new McsOption(TicketType.RepetitiveBounce, ticketTypeText[TicketType.RepetitiveBounce]),
  new McsOption(TicketType.SecureInternetGateway, ticketTypeText[TicketType.SecureInternetGateway]),
  new McsOption(TicketType.Security, ticketTypeText[TicketType.Security]),
  new McsOption(TicketType.SecurityFacilities, ticketTypeText[TicketType.SecurityFacilities]),
  new McsOption(TicketType.ServiceDegradation, ticketTypeText[TicketType.ServiceDegradation]),
  new McsOption(TicketType.ServiceDeliveryProvisioning, ticketTypeText[TicketType.ServiceDeliveryProvisioning]),
  new McsOption(TicketType.ServiceOutage, ticketTypeText[TicketType.ServiceOutage]),
  new McsOption(TicketType.Storage, ticketTypeText[TicketType.Storage]),
  new McsOption(TicketType.System, ticketTypeText[TicketType.System]),
  new McsOption(TicketType.TroubleTicket, ticketTypeText[TicketType.TroubleTicket])
]

/**
 * Enumeration serializer and deserializer methods
 */
export class TicketTypeSerialization
  extends McsEnumSerializationBase<TicketType> {
  constructor() { super(TicketType); }
}
