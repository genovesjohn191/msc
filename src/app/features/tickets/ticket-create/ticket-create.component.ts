import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  QueryList,
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';
import {
  isNullOrEmpty,
  isFormControlValid,
  refreshView,
  replacePlaceholder
} from '../../../utilities';
import {
  McsTextContentProvider,
  McsList,
  McsListItem,
  CoreValidators,
  CoreDefinition
} from '../../../core';
import { ContextualHelpDirective } from '../../../shared';
import {
  TicketCreate,
  TicketType,
  TicketCreateAttachment,
  TicketService,
  TicketServiceData,
  TicketFileInfo
} from '../models';
import { TicketCreateService } from './ticket-create.service';
import { Server } from '../../servers';
import { Firewall } from '../../networking';
import { McsSafeToNavigateAway } from '../../../core';

const HEADLINE_MAX_CHAR = 80;
const DETAILS_MAX_CHAR = 4000;

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
  public ticketTypeList: McsList;

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
  private _fileAttachments: TicketFileInfo[];
  public get fileAttachments(): TicketFileInfo[] {
    return this._fileAttachments;
  }
  public set fileAttachments(value: TicketFileInfo[]) {
    if (this._fileAttachments !== value) {
      this._fileAttachments = value;
    }
  }

  constructor(
    private _router: Router,
    private _textContentProvider: McsTextContentProvider,
    private _ticketCreateService: TicketCreateService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.ticketTypeList = new McsList();
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

  public safeToNavigateAway(): boolean {
    return !this.fgCreateTicket.dirty;
  }

  public ngOnInit() {
    this.textContent = this._textContentProvider.content.tickets.createTicket;
    this.contextualContent = this.textContent.contextualHelp;

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

  public convertHeadlineText(text: string): string {
    return replacePlaceholder(text, 'max_char', HEADLINE_MAX_CHAR.toString());
  }

  public convertDetailsText(text: string): string {
    return replacePlaceholder(text, 'max_char', DETAILS_MAX_CHAR.toString());
  }

  /**
   * Set the flag of the service toggle if it is open or close
   */
  public openServices(): void {
    this.isServicesOpen = !this.isServicesOpen;
  }

  /**
   * Validate the control
   * @param control Control to be validate
   */
  public isControlValid(control: any): boolean {
    return isFormControlValid(control);
  }

  /**
   * Set the value of the service text tag when the services is selected
   * @param event Event that return ticket service data
   */
  public serviceItemSelectionChanged(event: TicketServiceData[]) {
    this.selectedServiceItems = event;
    this.fcService.setValue('');
    if (!isNullOrEmpty(this.selectedServiceItems)) {
      let servicesText: string = '';

      this.selectedServiceItems.forEach((serviceItem) => {
        servicesText += `${serviceItem.name}   `;
      });
      this.fcService.setValue(servicesText);
    }
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
    this.fcDetails.markAsTouched();
    this.fcHeadline.markAsTouched();
    if (!this.fgCreateTicket.valid) {
      return;
    }

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

        attachmentData.fileName = attachment.fileName;
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
      CoreValidators.required,
      CoreValidators.maxLength(HEADLINE_MAX_CHAR)
    ]);

    this.fcDetails = new FormControl('', [
      CoreValidators.required,
      CoreValidators.maxLength(DETAILS_MAX_CHAR)
    ]);

    this.fcService = new FormControl('', [
      // Add validators
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
      let serviceData = new TicketServiceData();

      serviceData.name = `${server.managementName} (${server.serviceId})`;
      serviceData.isChecked = false;
      serviceData.serviceId = server.serviceId;
      service.serviceItems.push(serviceData);
    });
    this.services.push(service);
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
      let serviceData = new TicketServiceData();

      serviceData.name = `${firewall.managementName} (${firewall.serviceId})`;
      serviceData.isChecked = false;
      serviceData.serviceId = firewall.serviceId;
      service.serviceItems.push(serviceData);
    });
    this.services.push(service);
  }

  /**
   * Set ticket type based on selection
   */
  private _setTicketType(): void {
    this.ticketTypeList.push('Ticket Type',
      new McsListItem(TicketType.Enquiry, 'Enquiry'));
    this.ticketTypeList.push('Ticket Type',
      new McsListItem(TicketType.TroubleTicket, 'Trouble Ticket'));

    // Select first element
    if (!isNullOrEmpty(this.ticketTypeList.getGroupNames())) {
      this.fcType.setValue(this.ticketTypeList.getGroup(
        this.ticketTypeList.getGroupNames()[0])[0].key);
    }
  }
}
