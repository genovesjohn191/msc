import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  HostListener
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import {
  isNullOrEmpty,
  refreshView,
  replacePlaceholder
} from '../../../utilities';
import {
  McsTextContentProvider,
  McsAttachment,
  CoreValidators,
  CoreDefinition
} from '../../../core';
import {
  ContextualHelpDirective,
  FormGroupDirective
} from '../../../shared';
import {
  TicketCreate,
  TicketCreateAttachment,
  TicketService,
  TicketServiceData,
  TicketSubType
} from '../models';
import { TicketsRepository } from '../tickets.repository';
import { TicketCreateService } from './ticket-create.service';
import { Server } from '../../servers';
import { Firewall } from '../../networking';
import { McsSafeToNavigateAway } from '../../../core';

@Component({
  selector: 'mcs-ticket-create',
  templateUrl: './ticket-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TicketCreateComponent implements
  OnInit,
  AfterViewInit,
  OnDestroy,
  McsSafeToNavigateAway {

  public textContent: any;
  public contextualContent: any;
  public services: TicketService[];
  public contextualHelp: ContextualHelpDirective[];
  public isServicesOpen: boolean;
  public textService: string;
  public subTypeEnumText: any;
  public servicePanelOpen: boolean;

  @ViewChild(FormGroupDirective)
  public fgCreateDirective: FormGroupDirective;

  @ViewChildren(ContextualHelpDirective)
  public contextualHelpDirectives: QueryList<ContextualHelpDirective>;

  // Form variables
  public fgCreateTicket: FormGroup;
  public fcType: FormControl;
  public fcHeadline: FormControl;
  public fcDetails: FormControl;
  public fcService: FormControl;

  // Headline and details
  public headline: string;
  public details: string;

  // Ticket Type Dropdown
  public ticketTypeValue: any;
  public ticketTypeList: any;

  // others
  public servicesSubscription: any;
  public createTicketSubscription: any;

  /**
   * Selected services items field
   */
  private _selectedServiceItems: TicketServiceData[];
  public get selectedServiceItems(): TicketServiceData[] {
    return this._selectedServiceItems;
  }
  public set selectedServiceItems(value: TicketServiceData[]) {
    if (this._selectedServiceItems !== value) {
      this._selectedServiceItems = value;
    }
  }

  /**
   * Attachment files list
   */
  private _fileAttachments: McsAttachment[];
  public get fileAttachments(): McsAttachment[] {
    return this._fileAttachments;
  }
  public set fileAttachments(value: McsAttachment[]) {
    if (this._fileAttachments !== value) {
      this._fileAttachments = value;
    }
  }

  constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _ticketCreateService: TicketCreateService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ticketsRepository: TicketsRepository
  ) {
    this.ticketTypeList = new Array();
    this.services = new Array();
    this.contextualHelp = new Array();
    this.isServicesOpen = false;
    this.textService = '';
  }

  public get servicesIconKey(): string {
    return CoreDefinition.ASSETS_FONT_NAVBAR;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CHEVRON_LEFT;
  }

  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public safeToNavigateAway(): boolean {
    return this.fgCreateDirective && !this.fgCreateDirective.hasDirtyFormControls();
  }

  @HostListener('window:beforeunload')
  public navigateAwayGuard() {
    return false;
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.tickets.createTicket;
    this.contextualContent = this.textContent.contextualHelp;
    this.subTypeEnumText = this._textContentProvider.content.tickets.enumerations.subType;

    this._registerFormGroup();
    this._setTicketType();
    this._getServices();
  }

  public ngAfterViewInit() {
    refreshView(() => {
      if (this.contextualHelpDirectives) {
        this.contextualHelp = this.contextualHelpDirectives
          .map((description) => {
            return description;
          });
      }
    });
  }

  public ngOnDestroy() {
    if (!isNullOrEmpty(this.servicesSubscription)) {
      this.servicesSubscription.unsubscribe();
    }
  }

  public convertMaxCharText(text: string, maxchar: number): string {
    return replacePlaceholder(text, 'max_char', maxchar.toString());
  }

  /**
   * Set the value of the service text tag when the services is selected
   * @param event Event that return ticket service data
   */
  public serviceItemSelectionChanged(_event: any[]) {
    if (isNullOrEmpty(_event)) { return; }

    this.selectedServiceItems = [];
    _event.forEach((service) => {
      this.selectedServiceItems.push(service.value);
    });
  }

  /**
   * Set the file attachment when there is changes on the attachment
   * @param attachments Update File attachments
   */
  public onChangedAttachments(attachments: any): void {
    this.fileAttachments = attachments;
  }

  /**
   * Navigate to ticket listing
   */
  public gotoTickets(): void {
    this._router.navigate(['/tickets']);
  }

  /**
   * Create ticket according to inputs
   */
  public onLogTicket(): void {
    // Check all the controls and set the focus on the first invalid control
    this.fgCreateDirective.validateFormControls(true);
    if (!this.fgCreateDirective.isValid()) { return; }

    let ticket = new TicketCreate();

    // Set ticket data information
    ticket.subType = this.fcType.value;
    ticket.shortDescription = this.fcHeadline.value;
    ticket.description = this.fcDetails.value;
    // Set Converted File Attachments
    if (!isNullOrEmpty(this.fileAttachments)) {
      ticket.attachments = new Array();
      this.fileAttachments.forEach((attachment) => {
        let attachmentData = new TicketCreateAttachment();

        attachmentData.fileName = attachment.filename;
        attachmentData.contents = attachment.base64Contents;
        ticket.attachments.push(attachmentData);
      });
    }

    // Set Service Id List
    if (!isNullOrEmpty(this.selectedServiceItems)) {
      ticket.serviceId = new Array();
      this.selectedServiceItems.forEach((serviceItem) => {
        ticket.serviceId.push(serviceItem.serviceId);
      });
    }

    // Create ticket
    this.createTicketSubscription = this._ticketCreateService
      .createTicket(ticket)
      .subscribe(() => {
        this.fgCreateDirective.resetAllControls();
        this._ticketsRepository.refreshRecords();
        this._router.navigate(['/tickets']);
      });
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcType = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcHeadline = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcDetails = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcService = new FormControl('', [
      CoreValidators.required
    ]);

    // Register Form Groups using binding
    this.fgCreateTicket = new FormGroup({
      fcType: this.fcType,
      fcHeadline: this.fcHeadline,
      fcDetails: this.fcDetails,
      fcService: this.fcService
    });
  }

  /**
   * Get the enumerable services in parallel
   */
  private _getServices(): void {
    // Get all the data from api in parallel
    this.servicesSubscription = Observable.forkJoin([
      this._ticketCreateService.getServers(),
      this._ticketCreateService.getFirewalls()
    ]).subscribe((data) => {
      this._setServers(data[0]);
      this._setFirewalls(data[1]);
    });
    this.servicesSubscription.add(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Set the data of servers obtained from API
   */
  private _setServers(response: any): void {
    if (isNullOrEmpty(response) || isNullOrEmpty(response.content)) { return; }
    let servers = response.content as Server[];
    let service: TicketService = new TicketService();

    service.serviceName = 'Servers';
    servers.forEach((server) => {
      if (isNullOrEmpty(server.serviceId)) { return; }
      let serviceData = new TicketServiceData();

      serviceData.name = `${server.managementName} (${server.serviceId})`;
      serviceData.isChecked = false;
      serviceData.serviceId = server.serviceId;
      service.serviceItems.push(serviceData);
    });

    // Do not include in the services when the service item is nothing
    if (!isNullOrEmpty(service.serviceItems)) {
      this.services.push(service);
    }
  }

  /**
   * Set the data of firewalls obtained from API
   */
  private _setFirewalls(response: any): void {
    if (isNullOrEmpty(response) || isNullOrEmpty(response.content)) { return; }
    let firewalls = response.content as Firewall[];
    let service: TicketService = new TicketService();

    service.serviceName = 'Firewalls';
    firewalls.forEach((firewall) => {
      if (isNullOrEmpty(firewall.serviceId)) { return; }
      let serviceData = new TicketServiceData();

      serviceData.name = `${firewall.managementName} (${firewall.serviceId})`;
      serviceData.isChecked = false;
      serviceData.serviceId = firewall.serviceId;
      service.serviceItems.push(serviceData);
    });

    // Do not include in the services when the service item is nothing
    if (!isNullOrEmpty(service.serviceItems)) {
      this.services.push(service);
    }
  }

  /**
   * Set ticket type based on selection
   */
  private _setTicketType(): void {
    if (isNullOrEmpty(this.subTypeEnumText)) { return; }

    this.ticketTypeList.push({
      'value': TicketSubType.Enquiry,
      'text': this.subTypeEnumText[TicketSubType.Enquiry]
    });
    this.ticketTypeList.push({
      'value': TicketSubType.TroubleTicket,
      'text': this.subTypeEnumText[TicketSubType.TroubleTicket]
    });
  }
}
