import { ActivatedRoute } from '@angular/router';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  Observable,
  BehaviorSubject,
  Subscription
} from 'rxjs';
import {
  finalize,
  tap,
  map,
  shareReplay
} from 'rxjs/operators';
import {
  CoreValidators,
  IMcsNavigateAwayGuard,
  McsNavigationService
} from '@app/core';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  animateFactory,
  getSafeProperty,
  CommonDefinition
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import {
  TicketType,
  ticketTypeText,
  serviceTypeText,
  McsFileInfo,
  McsOption,
  RouteKey,
  McsTicketCreate,
  McsTicketCreateAttachment
} from '@app/models';
import { McsApiService } from '@app/services';
import { TicketService } from '../shared';

@Component({
  selector: 'mcs-ticket-create',
  templateUrl: './ticket-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.expansionVertical
  ]
})

export class TicketCreateComponent implements OnInit, OnDestroy, IMcsNavigateAwayGuard {

  public ticketTypeList: McsOption[] = [];
  public selectedServiceId$: Observable<string>;
  public servicesSubscription: Subscription;

  public vdcServices$: Observable<TicketService[]>;
  public serverServices$: Observable<TicketService[]>;
  public firewallServices$: Observable<TicketService[]>;
  public internetPortServices$: Observable<TicketService[]>;
  public batServices$: Observable<TicketService[]>;
  public licenses$: Observable<TicketService[]>;
  public azureServices$: Observable<TicketService[]>;

  // Form variables
  public fgCreateTicket: FormGroup;
  public fcType: FormControl;
  public fcReference: FormControl;
  public fcSummary: FormControl;
  public fcDetails: FormControl;
  public fcService: FormControl;

  private _fileAttachments: McsFileInfo[];
  private _creatingTicket$ = new BehaviorSubject<boolean>(false);

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _navigateService: McsNavigationService,
    private _apiService: McsApiService
  ) {
    this._registerFormGroup();
    this._setTicketType();
  }

  public ngOnInit() {
    this._subscribesToSelectedService();
    this._subscribesToVdcServices();
    this._subscribesToServerServices();
    this._subscribesToFirewallServices();
    this._subscribesToInternetPortServices();
    this._subscribesToBatServices();
    this._subscribesToLicenses();
    this._subscribesToAzureServices();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.servicesSubscription);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  /**
   * Event that emits when creating a ticket
   */
  public creatingTicket(): Observable<boolean> {
    return this._creatingTicket$.asObservable();
  }

  /**
   * Event that emits when navigating away from this component page
   */
  public canNavigateAway(): boolean {
    return !getSafeProperty(this._formGroup, (obj) => obj.hasDirtyFormControls(), false);
  }

  /**
   * Set the file attachment when there is changes on the attachment
   * @param attachments Update File attachments
   */
  public onChangedAttachments(attachments: McsFileInfo[]): void {
    this._fileAttachments = attachments;
  }

  /**
   * Create ticket according to inputs
   */
  public onLogTicket(): void {
    this._formGroup.validateFormControls(true);
    if (!this._formGroup.isValid()) { return; }

    let ticket = new McsTicketCreate();

    // Set ticket data information
    ticket.type = this.fcType.value;
    ticket.shortDescription = this.fcSummary.value;
    ticket.description = this.fcDetails.value;
    if (!isNullOrEmpty(this.fcReference.value)) {
      ticket.customerReference = this.fcReference.value;
    }

    // Set Converted File Attachments
    if (!isNullOrEmpty(this._fileAttachments)) {
      ticket.attachments = new Array();
      this._fileAttachments.forEach((attachment) => {
        let attachmentData = new McsTicketCreateAttachment();

        attachmentData.fileName = attachment.filename;
        attachmentData.contents = attachment.base64Contents;
        ticket.attachments.push(attachmentData);
      });
    }

    // Set Service Id List
    if (!isNullOrEmpty(this.fcService.value)) {
      ticket.serviceId = new Array();
      this.fcService.value.forEach((serviceItem: TicketService) => {
        ticket.serviceId.push(serviceItem.id);
      });
    }

    // Create ticket
    this._creatingTicket$.next(true);
    this._apiService.createTicket(ticket).pipe(
      finalize(() => this._creatingTicket$.next(false)),
      tap(() => {
        this._formGroup.resetAllControls();
        this._navigateService.navigateTo(RouteKey.Tickets);
      })
    ).subscribe();
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcType = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcReference = new FormControl('', []);

    this.fcSummary = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcDetails = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcService = new FormControl('', []);

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
   * Set ticket type based on selection
   */
  private _setTicketType(): void {
    if (isNullOrEmpty(ticketTypeText)) { return; }

    this.ticketTypeList.push(new McsOption(TicketType.Enquiry,
      ticketTypeText[TicketType.Enquiry]));
    this.ticketTypeList.push(new McsOption(TicketType.TroubleTicket,
      ticketTypeText[TicketType.TroubleTicket]));
  }

  /**
   * Subscribes to selected serviceId
   */
  private _subscribesToSelectedService(): void {
    this.selectedServiceId$ = this._activatedRoute.queryParams.pipe(
      map((params) => getSafeProperty(params, (obj) => obj.serviceId)),
      shareReplay(1)
    );
  }

  /**
   * Subscribes to vdc services
   */
  private _subscribesToVdcServices(): void {
    this.vdcServices$ = this._apiService.getResources().pipe(
      map((response) => {
        let resources = getSafeProperty(response, (obj) => obj.collection);
        return resources
          .filter((resource) => getSafeProperty(resource, (obj) => obj.serviceId))
          .map((resource) => new TicketService(
            `${serviceTypeText[resource.serviceType]} VDC (${resource.name})`,
            resource.name
          ));
      })
    );
  }

  /**
   * Subscribes to servers services
   */
  private _subscribesToServerServices(): void {
    this.serverServices$ = this._apiService.getServers().pipe(
      map((response) => {
        let servers = getSafeProperty(response, (obj) => obj.collection);
        return servers
          .filter((server) => getSafeProperty(server, (obj) => obj.serviceId))
          .map((server) => new TicketService(
            `${server.name} (${server.serviceId})`,
            server.serviceId
          ));
      })
    );
  }

  /**
   * Subscribes to firewall services
   */
  private _subscribesToFirewallServices(): void {
    this.firewallServices$ = this._apiService.getFirewalls().pipe(
      map((response) => {
        let firewalls = getSafeProperty(response, (obj) => obj.collection);
        return firewalls
          .filter((firewall) => getSafeProperty(firewall, (obj) => obj.serviceId))
          .map((firewall) => new TicketService(
            `${firewall.managementName} (${firewall.serviceId})`,
            firewall.serviceId
          ));
      })
    );
  }

  /**
   * Subscribes to internet port services
   */
  private _subscribesToInternetPortServices(): void {
    this.internetPortServices$ = this._apiService.getInternetPorts().pipe(
      map((response) => {
        let internetPorts = getSafeProperty(response, (obj) => obj.collection);
        return internetPorts
          .filter((internetPort) => getSafeProperty(internetPort, (obj) => obj.serviceId))
          .map((internetPort) => new TicketService(
            `${internetPort.description} (${internetPort.serviceId})`,
            internetPort.serviceId
          ));
      })
    );
  }

  /**
   * Subscribes to backup aggregation target services
   */
  private _subscribesToBatServices(): void {
    this.batServices$ = this._apiService.getBackupAggregationTargets().pipe(
      map((response) => {
        let bats = getSafeProperty(response, (obj) => obj.collection);
        return bats.filter((bat) => getSafeProperty(bat, (obj) => obj.serviceId))
          .map((bat) => new TicketService(`${bat.description} (${bat.serviceId})`, bat.serviceId));
      })
    );
  }

  /**
   * Subscribes to licenses
   */
  private _subscribesToLicenses(): void {
    this.licenses$ = this._apiService.getLicenses().pipe(
      map((response) => {
        let licenses = getSafeProperty(response, (obj) => obj.collection);
        return licenses.filter((license) => getSafeProperty(license, (obj) => obj.serviceId))
          .map((license) => new TicketService(`${license.name} (${license.serviceId})`, license.serviceId));
      })
    );
  }

  /**
   * Subscribes to azure services
   */
  private _subscribesToAzureServices(): void {
    this.azureServices$ = this._apiService.getAzureServices().pipe(
      map((response) => {
        let azureServices = getSafeProperty(response, (obj) => obj.collection);
        return azureServices.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(`${service.friendlyName} (${service.serviceId})`, service.serviceId));
      })
    );
  }
}
