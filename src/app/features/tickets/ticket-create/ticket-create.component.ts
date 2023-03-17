import {
  of,
  throwError,
  BehaviorSubject,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormControl,
  FormGroup
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  CoreValidators,
  IMcsNavigateAwayGuard,
  McsAccessControlService,
  McsAuthenticationIdentity,
  McsNavigationService
} from '@app/core';
import {
  serviceTypeText,
  ticketTypeText,
  HardwareType,
  HttpStatusCode,
  McsApiCollection,
  McsAzureResource,
  McsFeatureFlag,
  McsFileInfo,
  McsJob,
  McsOption,
  McsOptionGroup,
  McsPermission,
  McsResource,
  McsServer,
  McsTicketCreate,
  McsTicketCreateAttachment,
  RouteKey,
  TicketType
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  animateFactory,
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import {
  TicketService,
  TicketServiceType
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

  public ticketTypeList: McsOption[] = [];
  public selectedServiceId$: Observable<string>;
  public jobDetails$: Observable<McsJob>;
  public servicesSubscription: Subscription;

  public vdcServices$: Observable<TicketService[]>;
  public serverServices$: Observable<TicketService[]>;
  public firewallServices$: Observable<TicketService[]>;
  public internetPortServices$: Observable<TicketService[]>;
  public batServices$: Observable<TicketService[]>;
  public licenses$: Observable<TicketService[]>;
  public azureServices$: Observable<TicketService[]>;
  public colocationAntennas$: Observable<TicketService[]>;
  public colocationCustomDevices$: Observable<TicketService[]>;
  public colocationRooms$: Observable<TicketService[]>;
  public colocationStandardSqms$: Observable<TicketService[]>;
  public colocationRacks$: Observable<TicketService[]>;
  public vdcStorages$: Observable<TicketService[]>;
  public dedicatedServers$: Observable<TicketService[]>;
  public managementServices$: Observable<TicketService[]>;
  public serverBackup$: Observable<TicketService[]>;
  public vmBackup$: Observable<TicketService[]>;
  public antiVirus$: Observable<TicketService[]>;
  public hids$: Observable<TicketService[]>;
  public dns$: Observable<TicketService[]>;
  public reservations$: Observable<TicketService[]>;
  public softwareSubscriptions$: Observable<TicketService[]>;
  public extenders$: Observable<TicketService[]>;
  public applicationRecovery$: Observable<TicketService[]>;
  public veeamBackups$: Observable<TicketService[]>;
  public veeamDrs$: Observable<TicketService[]>;
  public saasBackups$: Observable<TicketService[]>;
  public nonStandardBundles$: Observable<TicketService[]>;
  public perpetualSoftware$: Observable<TicketService[]>;

  public serversList$: Observable<McsServer[]>;
  public vdcList$: Observable<McsResource[]>;
  public azureResources: McsOptionGroup[];

  // Form variables
  public fgCreateTicket: FormGroup<any>;
  public fcType: FormControl<TicketType>;
  public fcReference: FormControl<string>;
  public fcSummary: FormControl<string>;
  public fcDetails: FormControl<string>;
  public fcService: FormControl<any>;
  public fcAzureResource: FormControl<any>;

  private _fileAttachments: McsFileInfo[];
  private _creatingTicket$ = new BehaviorSubject<boolean>(false);
  private _resourcesSubject = new Subject<void>()

  private _errorStatus: number;
  private _apiCallInProgress: boolean;
  private _validToShowAzureResource: boolean;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  constructor(
    private _accessControlService: McsAccessControlService,
    private _activatedRoute: ActivatedRoute,
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
    private _changeDetectorRef: ChangeDetectorRef,
    private _navigateService: McsNavigationService,
    private _translate: TranslateService
  ) {
    this._registerFormGroup();
    this._setTicketType();
  }

  public ngOnInit() {
    this._subscribesToServersList();
    this._subscribesToVdcList();
    this._subscribedToQueryParams();
    this._subscribesToVdcServices();
    this._subscribesToServerServices();
    this._subscribesToFirewallServices();
    this._subscribesToInternetPortServices();
    this._subscribesToBatServices();
    this._subscribesToLicenses();
    this._subscribesToAzureServices();
    this._subscribesToColocationAntennas();
    this._subscribesToColocationCustomDevices();
    this._subscribesToColocationRooms();
    this._subscribesToColocationStandardSquareMetres();
    this._subscribesToColocationRacks();
    this._subscribesToVdcStorage();
    this._subscribesToDedicatedServers();
    this._subscribesToManagementServices();
    this._subscribesToServerBackup();
    this._subscribesToVmBackup();
    this._subscribesToAntiVirus();
    this._subscribesToHids();
    this._subscribesToDns();
    this._subscribesToAzureReservations();
    this._subscribesToAzureSoftwareSubscriptions();
    this._subscribesToExtenders();
    this._subscribesToApplicationRecovery();
    
    this._subscribesToVeeamBackups();
    this._subscribesToVeeamDrs();
    this._subscribesToSaasBackups();
    this._subscribesToNonStandardBundles();
    this._subscribesToPerpetualSoftware();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this.servicesSubscription);
    unsubscribeSafely(this._resourcesSubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get loadingInProgress(): boolean {
    return this._apiCallInProgress;
  }

  public get showAzureResource(): boolean {
    return this._validToShowAzureResource;
  }

  public get isTypeTroubleTicket(): boolean {
    return this.fcType.value === TicketType.TroubleTicket;
  }

  public get hasSelectedAzureResource(): boolean {
    return this.fcService.value.find((service) => service.service === TicketServiceType.MicrosoftSubscriptions);
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

  public hasPermissionToAzureResource(): boolean {
    let hasAzureViewPermission = this._accessControlService.hasPermission([McsPermission.AzureView]);

    return hasAzureViewPermission;
  }

  public onChangeTicketType(): void {
    this.isValidToSelectAzureResource();
  }

  public onChangeService(): void {
    this.isValidToSelectAzureResource();
  }

  public isValidToSelectAzureResource(): void {
    if (this.fcService.value?.length === 0) { this._validToShowAzureResource = false; }
    let isValidToSelectAzureResource = this.isTypeTroubleTicket && !isNullOrEmpty(this.hasSelectedAzureResource);
    if (!isValidToSelectAzureResource) {
      this._validToShowAzureResource = false;
    } else {
      this._getAzureResources();
      this._validToShowAzureResource = true;
    }
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

    // Set Azure Resources Azure ID
    if (!isNullOrEmpty(this.fcAzureResource.value)) {
      ticket.azureResources = new Array();
      this.fcAzureResource.value.forEach((resource: McsAzureResource) => {
        ticket.azureResources.push(resource.azureId);
      });
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

  public get hasPublicCloudAccess(): boolean {
    return this._authenticationIdentity.platformSettings.hasPublicCloud;
  }

  /**
   * Form groups and Form controls registration area
   */
  private _registerFormGroup(): void {
    // Register Form Controls
    this.fcType = new FormControl<TicketType>(null, [
      CoreValidators.required
    ]);

    this.fcReference = new FormControl<string>('', [
      CoreValidators.maxLength(15)
    ]);

    this.fcSummary = new FormControl<string>('', [
      CoreValidators.required
    ]);

    this.fcDetails = new FormControl<string>('', [
      CoreValidators.required
    ]);

    this.fcService = new FormControl<any>([], []);
    this.fcAzureResource = new FormControl<any>([], []);

    // Register Form Groups using binding
    this.fgCreateTicket = new FormGroup<any>({
      fcType: this.fcType,
      fcReference: this.fcReference,
      fcSummary: this.fcSummary,
      fcDetails: this.fcDetails,
      fcService: this.fcService,
      fcAzureResource: this.fcAzureResource
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
   * Subscribes to list of servers
   */
  private _subscribesToServersList(): void {
    this.serversList$ = this._apiService.getServers().pipe(
      map((response) => {
        let resources = getSafeProperty(response, (obj) => obj.collection);
        return resources
          .filter((resource) => getSafeProperty(resource, (obj) => obj.serviceId))
          .map((resource) => resource);
      }),
      shareReplay(1)
    );
  }

  /**
   * Subscribes to list of vdc resources
   */
  private _subscribesToVdcList(): void {
    this.vdcList$ = this._apiService.getResources().pipe(
      map((response) => {
        let resources = getSafeProperty(response, (obj) => obj.collection);
        return resources
          .filter((resource) => getSafeProperty(resource, (obj) => obj.serviceId))
          .map((resource) => resource);
      }),
      shareReplay(1)
    );
  }

  private _subscribedToQueryParams(): void {
    this.selectedServiceId$ = this._activatedRoute.queryParams.pipe(
      map((params) => getSafeProperty(params, (obj) => obj.serviceId)),
      shareReplay(1)
    );

    this.jobDetails$ = this._activatedRoute.queryParams.pipe(
      switchMap(params => {
        let jobId = params?.jobId;
        if (isNullOrEmpty(jobId)) { return of(null); }
        return this._apiService.getJob(jobId);
      })
    );
  }

  private _subscribesToVdcServices(): void {
    this.vdcServices$ = this.vdcList$.pipe(
      map((response) => {
        let resources = response;
        return resources
          .filter((resource) => getSafeProperty(resource, (obj) => obj.serviceId))
          .map((resource) => new TicketService(
            `${serviceTypeText[resource.serviceType]} VDC (${resource.name})`,
            resource.name,
            TicketServiceType.Vdcs
          ));
      })
    );
  }

  private _subscribesToServerServices(): void {
    this.serverServices$ = this.serversList$.pipe(
      map((response) => {
        let servers = response;
        return servers
          .filter((server) => getSafeProperty(server, (obj) => obj.serviceId))
          .map((server) => new TicketService(
            `${server.name} (${server.serviceId})`,
            server.serviceId,
            TicketServiceType.Servers
          ));
      })
    );
  }

  private _subscribesToFirewallServices(): void {
    this.firewallServices$ = this._apiService.getFirewalls().pipe(
      map((response) => {
        let firewalls = getSafeProperty(response, (obj) => obj.collection);
        return firewalls
          .filter((firewall) => getSafeProperty(firewall, (obj) => obj.serviceId))
          .map((firewall) => new TicketService(
            `${firewall.managementName} (${firewall.serviceId})`,
            firewall.serviceId,
            TicketServiceType.Firewalls
          ));
      })
    );
  }

  private _subscribesToInternetPortServices(): void {
    this.internetPortServices$ = this._apiService.getInternetPorts().pipe(
      map((response) => {
        let internetPorts = getSafeProperty(response, (obj) => obj.collection);
        return internetPorts
          .filter((internetPort) => getSafeProperty(internetPort, (obj) => obj.serviceId))
          .map((internetPort) => new TicketService(
            `${internetPort.description} (${internetPort.serviceId})`,
            internetPort.serviceId,
            TicketServiceType.Firewalls
          ));
      })
    );
  }

  private _subscribesToBatServices(): void {
    this.batServices$ = this._apiService.getBackupAggregationTargets().pipe(
      map((response) => {
        let bats = getSafeProperty(response, (obj) => obj.collection);
        return bats.filter((bat) => getSafeProperty(bat, (obj) => obj.serviceId))
          .map((bat) => new TicketService(
            `${bat.description} (${bat.serviceId})`,
            bat.serviceId,
            TicketServiceType.BackupAggregationTargets
          ));
      })
    );
  }

  private _subscribesToLicenses(): void {
    if (!this.hasPublicCloudAccess) { return; }
    this.licenses$ = this._apiService.getLicenses().pipe(
      map((response) => {
        let licenses = getSafeProperty(response, (obj) => obj.collection);
        return licenses.filter((license) => getSafeProperty(license, (obj) => obj.serviceId))
          .map((license) => new TicketService(
            `${license.name} (${license.serviceId})`,
            license.serviceId,
            TicketServiceType.Licenses
          ));
      })
    );
  }

  private _subscribesToAzureServices(): void {
    this.azureServices$ = this._apiService.getAzureServices().pipe(
      map((response) => {
        let azureServices = getSafeProperty(response, (obj) => obj.collection);
        return azureServices.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.friendlyName} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.MicrosoftSubscriptions
          ));
      })
    );
  }

  private _subscribesToColocationAntennas(): void {
    this.colocationAntennas$ = this._apiService.getColocationAntennas().pipe(
      map((response) => {
        let colocationAntennas = getSafeProperty(response, (obj) => obj.collection);
        return colocationAntennas.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.billingDescription} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.Antennas
          ));
      })
    );
  }

  private _subscribesToColocationCustomDevices(): void {
    this.colocationCustomDevices$ = this._apiService.getColocationCustomDevices().pipe(
      map((response) => {
        let colocationCustomDervices = getSafeProperty(response, (obj) => obj.collection);
        return colocationCustomDervices.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.billingDescription} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.CustomDevices
          ));
      })
    );
  }

  private _subscribesToColocationRooms(): void {
    this.colocationRooms$ = this._apiService.getColocationRooms().pipe(
      map((response) => {
        let colocationRooms = getSafeProperty(response, (obj) => obj.collection);
        return colocationRooms.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.billingDescription} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.Rooms
          ));
      })
    );
  }

  private _subscribesToColocationStandardSquareMetres(): void {
    this.colocationStandardSqms$ = this._apiService.getColocationStandardSqms().pipe(
      map((response) => {
        let colocationStandardSqms = getSafeProperty(response, (obj) => obj.collection);
        return colocationStandardSqms.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.billingDescription} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.StandarsSquareMetres
          ));
      })
    );
  }

  private _subscribesToColocationRacks(): void {
    this.colocationRacks$ = this._apiService.getColocationRacks().pipe(
      map((response) => {
        let colocationRacks = getSafeProperty(response, (obj) => obj.collection);
        return colocationRacks.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.description} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.Racks
          ));
      })
    );
  }

  private _subscribesToVdcStorage(): void {
    this.vdcStorages$ = this.vdcList$.pipe(
      map((vdcCollection) => {
        let vdcStorageGroup: TicketService[] = [];
        let vdc = getSafeProperty(vdcCollection, (obj) => obj) || [];

        vdc.forEach((resource) => {
          this._apiService.getResource(resource.id).subscribe((vdcStorage) => {
            vdcStorage.storage.forEach((storage) => {
              if (isNullOrEmpty(storage?.serviceId)) { return; }
              vdcStorageGroup.push(new TicketService(
                `${storage.name} - for ${resource.serviceId} (${storage.serviceId})`,
                storage.serviceId,
                TicketServiceType.VdcStorage
              )
              );
            });
          })
        })
        return vdcStorageGroup;
      })
    );
  }

  private _subscribesToDedicatedServers(): void {
    this.dedicatedServers$ = this.serversList$.pipe(
      map((response) => {
        let servers = getSafeProperty(response, (obj) => obj)
        return servers.filter((server) => server.isDedicated && server.hardware?.type !== HardwareType.VM )
          .map((service) => new TicketService(
            `${service.name} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.DedicatedServers
          ));
      })
    );
  }

  private _subscribesToManagementServices(): void {
    if (!this.hasPublicCloudAccess) { return; }
    this.managementServices$ = this._apiService.getManagementServices().pipe(
      map((response) => {
        let managementServices = getSafeProperty(response, (obj) => obj.collection);
        return managementServices.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.description} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.MicrosoftManagementServices
          ));
      })
    );
  }

  private _subscribesToServerBackup(): void {
    this.serverBackup$ = this._apiService.getServerBackupServers().pipe(
      switchMap((serverBackupsCollection) => {
        return this.serversList$.pipe(
          map((serversCollection) => {
            let serverBackupGroup: TicketService[] = [];
            let serverBackups = getSafeProperty(serverBackupsCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj) || [];

            serverBackups.forEach((serverBackup) => {
              let serverBackupInvalidToCreateTicket = isNullOrEmpty(serverBackup.serviceId);
              if (serverBackupInvalidToCreateTicket) { return; }
              let serverName = this._getServerName(serverBackup.id, servers);
              serverBackupGroup.push(
                new TicketService(`Server Backup - ${serverName} (${serverBackup.serviceId})`,
                  serverBackup.serviceId,
                  TicketServiceType.ServerBackup
                )
              );
            })
            return serverBackupGroup;
          })
        )
      }),
    );
  }

  private _subscribesToVmBackup(): void {
    this.vmBackup$ = this._apiService.getServerBackupVms().pipe(
      switchMap((backupsCollection) => {
        return this.serversList$.pipe(
          map((serversCollection) => {
            let vmBackupGroup: TicketService[] = [];
            let vmBackups = getSafeProperty(backupsCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj) || [];

            vmBackups.forEach((vmBackup) => {
              let vmBackupInvalidToCreateTicket = isNullOrEmpty(vmBackup.serviceId);
              if (vmBackupInvalidToCreateTicket) { return; }
              let serverName = this._getServerName(vmBackup.id, servers);
              vmBackupGroup.push(
                new TicketService(`VM Backup - ${serverName} (${vmBackup.serviceId})`,
                  vmBackup.serviceId,
                  TicketServiceType.VmBackup
                )
              );
            })
            return vmBackupGroup;
          })
        )
      }),
    );
  }

  private _subscribesToAntiVirus(): void {
    this.antiVirus$ = this._apiService.getServerHostSecurityAntiVirus().pipe(
      switchMap((antiVirusCollection) => {
        return this.serversList$.pipe(
          map((serversCollection) => {
            let antiVirusGroup: TicketService[] = [];
            let antiVirus = getSafeProperty(antiVirusCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj) || [];

            antiVirus.forEach((av) => {
              let antiVirusInvalidToCreateTicket = isNullOrEmpty(av?.antiVirus?.serviceId);
              if (antiVirusInvalidToCreateTicket) { return; }
              let serverName = this._getServerName(av.serverId, servers);
              antiVirusGroup.push(
                new TicketService(`${av.antiVirus.billingDescription} - ${serverName} (${av.antiVirus.serviceId})`,
                  av.antiVirus.serviceId,
                  TicketServiceType.AntiVirus
                )
              );
            })
            return antiVirusGroup;
          })
        )
      }),
    );
  }

  private _subscribesToHids(): void {
    this.hids$ = this._apiService.getServerHostSecurityHids().pipe(
      switchMap((hidsCollection) => {
        return this.serversList$.pipe(
          map((serversCollection) => {
            let hidsGroup: TicketService[] = [];
            let hids = getSafeProperty(hidsCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj) || [];

            hids.forEach((hidsDetails) => {
              let hidsInvalidToCreateTicket = isNullOrEmpty(hidsDetails?.hids?.serviceId);
              if (hidsInvalidToCreateTicket) { return; }
              let serverName = this._getServerName(hidsDetails.serverId, servers);
              hidsGroup.push(
                new TicketService(`${hidsDetails.hids.billingDescription} - ${serverName} (${hidsDetails.hids.serviceId})`,
                  hidsDetails.hids.serviceId,
                  TicketServiceType.Hids
                )
              );
            })
            return hidsGroup;
          })
        )
      }),
    );
  }

  private _getServerName(serviceServerId: string, servers: McsServer[]): string {
    let serverName = this._translate.instant('ticketCreate.noServerLinked');
    servers.map((server) => {
      let serviceHasLinkedServer = serviceServerId === server.id;
      if (serviceHasLinkedServer) {
        serverName = `for ${server.name}`;
      };
    });

    return serverName;
  }

  private _subscribesToDns(): void {
    this.dns$ = this._apiService.getNetworkDnsServices().pipe(
      map((response) => {
        let dns = getSafeProperty(response, (obj) => obj.collection);
        return dns.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.billingDescription} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.Dns
          ));
      })
    );
  }

  private _subscribesToAzureReservations(): void {
    this.reservations$ = this._apiService.getAzureReservations().pipe(
      map((response) => {
        let reservations = getSafeProperty(response, (obj) => obj.collection);
        return reservations.filter((reservation) => getSafeProperty(reservation, (obj) => obj.serviceId))
          .map((reservation) => new TicketService(
            `${reservation.name} (${reservation.serviceId})`,
            reservation.serviceId,
            TicketServiceType.Reservations
          ));
      })
    );
  }

  private _subscribesToAzureSoftwareSubscriptions(): void {
    this.softwareSubscriptions$ = this._apiService.getAzureSoftwareSubscriptions().pipe(
      map((response) => {
        let subscriptions = getSafeProperty(response, (obj) => obj.collection);
        return subscriptions.filter((subscription) => getSafeProperty(subscription, (obj) => obj.serviceId))
          .map((subscription) => new TicketService(
            `${subscription.name} (${subscription.serviceId})`,
            subscription.serviceId,
            TicketServiceType.SoftwareSubscriptions
          ));
      })
    );
  }

  private _subscribesToExtenders(): void {
    if ((!this._accessControlService.hasAccessToFeature([McsFeatureFlag.ExtenderListing,McsFeatureFlag.HybridCloud], true)) ||
       (!this._authenticationIdentity.platformSettings.hasHybridCloud))  {
      return;
    }

    this.extenders$ = this._apiService.getExtenders().pipe(
      map((response) => {
        let extenders = getSafeProperty(response, (obj) => obj.collection);
        return extenders.filter((extender) => getSafeProperty(extender, (obj) => obj.serviceId))
          .map((extender) => new TicketService(
            `${extender.billingDescription} (${extender.serviceId})`,
            extender.serviceId,
            TicketServiceType.Extenders
          ));
      })
    );
  }

  private _subscribesToApplicationRecovery(): void {
    if ((!this._accessControlService.hasAccessToFeature([McsFeatureFlag.ApplicationRecoveryListing,McsFeatureFlag.HybridCloud], true)) ||
       (!this._authenticationIdentity.platformSettings.hasHybridCloud))  {
      return;
    }

    if (!this._accessControlService.hasAccessToFeature(
      [McsFeatureFlag.ApplicationRecoveryListing,McsFeatureFlag.HybridCloud], true)) { return; }

    this.applicationRecovery$ = this._apiService.getApplicationRecovery().pipe(
      map((response) => {
        let applicationRecovery = getSafeProperty(response, (obj) => obj.collection);
        return applicationRecovery.filter((applicationRecoveryItem) => getSafeProperty(applicationRecoveryItem, (obj) => obj.serviceId))
          .map((applicationRecoveryItem) => new TicketService(
            `${applicationRecoveryItem.billingDescription} (${applicationRecoveryItem.serviceId})`,
            applicationRecoveryItem.serviceId,
            TicketServiceType.ApplicationRecovery
          ));
      })
    );
  }

  private _subscribesToVeeamBackups(): void {
    this.veeamBackups$ = this._apiService.getVeeamBackups().pipe(
      map((response) => {
        let veeamBackups = getSafeProperty(response, (obj) => obj.collection);
        return veeamBackups.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.billingDescription} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.VeeamBackup
          ));
      })
    );
  }

  private _subscribesToSaasBackups(): void {

    if (!this._accessControlService.hasAccessToFeature([McsFeatureFlag.SaasBackup], true)) {
      return;
    }

    if (!this._accessControlService.hasPermission([
      McsPermission.SaasBackupView,
      McsPermission.SaasBackupEdit
    ])) {
      return;
    }

    this.saasBackups$ = this._apiService.getSaasBackups().pipe(
      map((response) => {
        let saasBackups = getSafeProperty(response, (obj) => obj.collection);
        return saasBackups.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.billingDescription} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.SaasBackup
          ));
      })
    );
  }

  private _subscribesToVeeamDrs(): void {
    this.veeamDrs$ = this._apiService.getVeeamCloudDrs().pipe(
      map((response) => {
        let veeamDrs = getSafeProperty(response, (obj) => obj.collection);
        return veeamDrs.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.billingDescription} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.VeeamDr
          ));
      })
    );
  }

  private _subscribesToNonStandardBundles(): void {
    if (!this._accessControlService.hasAccessToFeature([McsFeatureFlag.NonStandardBundlesListing])) {
      return;
    }

    this.nonStandardBundles$ = this._apiService.getAzureNonStandardBundles().pipe(
      map((response) => {
        let nonStandardBundles = getSafeProperty(response, (obj) => obj.collection);
        return nonStandardBundles.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.billingDescription} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.NonStandardBundles
          ));
      })
    );
  }

  private _subscribesToPerpetualSoftware(): void {
    if (!this._accessControlService.hasAccessToFeature([McsFeatureFlag.PerpetualSoftwareListing])) {
      return;
    }

    this.perpetualSoftware$ = this._apiService.getAzurePerpetualSoftware().pipe(
      map((response) => {
        let perpetualSoftware = getSafeProperty(response, (obj) => obj.collection);
        return perpetualSoftware.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(
            `${service.name} (${service.serviceId})`,
            service.serviceId,
            TicketServiceType.PerpetualSoftware
          ));
      })
    );
  }

  private _getAzureResources(): void {
    this._apiCallInProgress = true;
    this._apiService.getAzureResources()
      .pipe(
        catchError((error) => {
          this._apiCallInProgress = false;
          this._validToShowAzureResource = false;
          this._errorStatus = error?.details?.status;
          this._changeDetectorRef.markForCheck();
          return throwError(error);
        }),
        takeUntil(this._resourcesSubject),
        shareReplay(1)
      )
      .subscribe((resourcesCollection: McsApiCollection<McsAzureResource>) => {
        let resourceGroup: McsOptionGroup[] = [];
        let resources = getSafeProperty(resourcesCollection, (obj) => obj.collection) || [];
        let selectedResources = this.fcService.value;

        selectedResources.forEach((selectedResource: McsAzureResource) => {
          let filteredResources = this._mapResourcesToOptions(resources, selectedResource.id);
          resourceGroup.push(createObject(McsOptionGroup, { groupName: selectedResource.id, options: filteredResources}));
        });
        this._apiCallInProgress = false;
        this.azureResources = resourceGroup;
        this._changeDetectorRef.markForCheck();
      });
  }

  private _mapResourcesToOptions(resources: McsAzureResource[], selectedResource: string): McsOption[] {
    let options: McsOption[] = [];
    let filteredResource = resources.filter((resource) => resource.serviceId === selectedResource);
    filteredResource.forEach((resource) => {
      options.push(createObject(McsOption, { text: resource.name, value: resource }));
    });

    return options;
  }
}
