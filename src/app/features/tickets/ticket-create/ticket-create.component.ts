import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  forkJoin,
  throwError
} from 'rxjs';
import {
  finalize,
  catchError
} from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  CoreValidators,
  CoreDefinition,
  CoreRoutes,
  IMcsNavigateAwayGuard
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  animateFactory
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import {
  TicketSubType,
  ticketSubTypeText,
  serviceTypeText,
  McsFileInfo,
  McsOption,
  RouteKey,
  McsFirewall,
  McsResource,
  McsServer,
  McsTicketCreate,
  McsTicketCreateAttachment,
  McsApiCollection
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  TicketService,
  TicketServiceData,
} from '../shared';

@Component({
  selector: 'mcs-ticket-create',
  templateUrl: './ticket-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.expansionVertical
  ]
})

export class TicketCreateComponent implements OnInit, OnDestroy, IMcsNavigateAwayGuard {

  public services: TicketService[];
  public isServicesOpen: boolean;
  public textService: string;
  public servicePanelOpen: boolean;
  public creatingTicket: boolean;

  // Form variables
  public fgCreateTicket: FormGroup;
  public fcType: FormControl;
  public fcReference: FormControl;
  public fcSummary: FormControl;
  public fcDetails: FormControl;
  public fcService: FormControl;

  // Headline and details
  public headline: string;
  public details: string;

  // Ticket Type Dropdown
  public ticketTypeList: McsOption[];

  // others
  public servicesSubscription: any;
  public createTicketSubscription: any;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

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
  private _fileAttachments: McsFileInfo[];
  public get fileAttachments(): McsFileInfo[] {
    return this._fileAttachments;
  }
  public set fileAttachments(value: McsFileInfo[]) {
    if (this._fileAttachments !== value) {
      this._fileAttachments = value;
    }
  }

  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService
  ) {
    this.ticketTypeList = new Array();
    this.services = new Array();
    this.isServicesOpen = false;
    this.textService = '';
  }

  public ngOnInit() {
    this._registerFormGroup();
    this._setTicketType();
    this._getServices();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.servicesSubscription);
  }

  public get servicesIconKey(): string {
    return CoreDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  public get backIconKey(): string {
    return CoreDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get toggleIconKey(): string {
    return CoreDefinition.ASSETS_SVG_TOGGLE_NAV;
  }

  /**
   * Event that triggers when navigating away from the current page
   * and all the inputted setting on the form are checked
   */
  public canNavigateAway(): boolean {
    return this.creatingTicket || !this._formGroup.hasDirtyFormControls();
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
   * Create ticket according to inputs
   */
  public onLogTicket(): void {
    // Check all the controls and set the focus on the first invalid control
    this._formGroup.validateFormControls(true);
    if (!this._formGroup.isValid()) { return; }

    let ticket = new McsTicketCreate();

    // Set ticket data information
    ticket.subType = this.fcType.value;
    ticket.shortDescription = this.fcSummary.value;
    ticket.description = this.fcDetails.value;
    if (!isNullOrEmpty(this.fcReference.value)) {
      ticket.customerReference = this.fcReference.value;
    }

    // Set Converted File Attachments
    if (!isNullOrEmpty(this.fileAttachments)) {
      ticket.attachments = new Array();
      this.fileAttachments.forEach((attachment) => {
        let attachmentData = new McsTicketCreateAttachment();

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
    this.creatingTicket = true;
    this.createTicketSubscription = this._apiService.createTicket(ticket).pipe(
      finalize(() => {
        this._formGroup.resetAllControls();
      }),
      catchError((error) => {
        unsubscribeSafely(this.createTicketSubscription);
        this._changeDetectorRef.markForCheck();
        return throwError(error);
      })
    ).subscribe(() => this._router.navigate([CoreRoutes.getNavigationPath(RouteKey.Tickets)]));
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcType = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcReference = new FormControl('', [
      // No checking for reference since user can raise a ticket without reference
    ]);

    this.fcSummary = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcDetails = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcService = new FormControl('', [
      // No checking for services since user can raise a ticket without service
    ]);

    // Register Form Groups using binding
    this.fgCreateTicket = new FormGroup({
      fcType: this.fcType,
      fcReference: this.fcReference,
      fcSummary: this.fcSummary,
      fcDetails: this.fcDetails,
      fcService: this.fcService
    });
  }

  /**
   * Get the enumerable services in parallel
   */
  private _getServices(): void {
    // Get all the data from api in parallel
    this.servicesSubscription = forkJoin([
      this._apiService.getResources(),
      this._apiService.getServers(),
      this._apiService.getFirewalls()
    ]).subscribe((data) => {
      this._setVdcs(data[0]);
      this._setServers(data[1]);
      this._setFirewalls(data[2]);
    });
    this.servicesSubscription.add(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * Set the data of VDCs obtained from API
   */
  private _setVdcs(response: McsApiCollection<McsResource>): void {
    if (isNullOrEmpty(response)) { return; }
    let vdcs = response.collection || [];
    let service: TicketService = new TicketService();

    service.serviceName = 'VDCs';
    vdcs.forEach((vdc) => {
      // TODO: Waiting for Orch to add serviceId in server resource
      if (isNullOrEmpty(vdc.name)) { return; }
      let serviceData = new TicketServiceData();

      serviceData.name = `${serviceTypeText[vdc.serviceType]} VDC (${vdc.name})`;
      serviceData.isChecked = false;
      serviceData.serviceId = vdc.name;
      service.serviceItems.push(serviceData);
    });

    // Do not include in the services when there is no service item
    if (!isNullOrEmpty(service.serviceItems)) {
      this.services.push(service);
    }
  }

  /**
   * Set the data of servers obtained from API
   */
  private _setServers(response: McsApiCollection<McsServer>): void {
    if (isNullOrEmpty(response)) { return; }
    let servers = response.collection || [];
    let service: TicketService = new TicketService();

    service.serviceName = 'Servers';
    servers.forEach((server) => {
      if (isNullOrEmpty(server.serviceId)) { return; }
      let serviceData = new TicketServiceData();

      serviceData.name = `${server.name} (${server.serviceId})`;
      serviceData.isChecked = false;
      serviceData.serviceId = server.serviceId;
      service.serviceItems.push(serviceData);
    });

    // Do not include in the services when there is no service item
    if (!isNullOrEmpty(service.serviceItems)) {
      this.services.push(service);
    }
  }

  /**
   * Set the data of firewalls obtained from API
   */
  private _setFirewalls(response: McsApiCollection<McsFirewall>): void {
    if (isNullOrEmpty(response)) { return; }
    let firewalls = response.collection || [];
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

    // Do not include in the services when there is no service item
    if (!isNullOrEmpty(service.serviceItems)) {
      this.services.push(service);
    }
  }

  /**
   * Set ticket type based on selection
   */
  private _setTicketType(): void {
    if (isNullOrEmpty(ticketSubTypeText)) { return; }

    this.ticketTypeList.push(new McsOption(TicketSubType.Enquiry,
      ticketSubTypeText[TicketSubType.Enquiry]));
    this.ticketTypeList.push(new McsOption(TicketSubType.TroubleTicket,
      ticketSubTypeText[TicketSubType.TroubleTicket]));
  }
}
