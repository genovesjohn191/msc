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
  shareReplay,
  switchMap
} from 'rxjs/operators';
import {
  CoreValidators,
  IMcsNavigateAwayGuard,
  McsAuthenticationIdentity,
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
  McsTicketCreateAttachment,
  McsResource,
  McsServer
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

  public serversList$: Observable<McsServer[]>;
  public vdcList$: Observable<McsResource[]>;

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
    private _apiService: McsApiService,
    private _authenticationIdentity: McsAuthenticationIdentity,
  ) {
    this._registerFormGroup();
    this._setTicketType();
  }

  public ngOnInit() {
    this._subscribesToServersList();
    this._subscribesToVdcList();
    this._subscribesToSelectedService();
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

  public get hasPublicCloudAccess(): boolean {
    return this._authenticationIdentity.platformSettings.hasPublicCloud;
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
    this.vdcServices$ = this.vdcList$.pipe(
      map((response) => {
        let resources = response;
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
    this.serverServices$ = this.serversList$.pipe(
      map((response) => {
        let servers = response;
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
    if (!this.hasPublicCloudAccess) { return; }
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

  /**
   * Subscribes to colocation antennas
   */
  private _subscribesToColocationAntennas(): void {
    this.colocationAntennas$ = this._apiService.getColocationAntennas().pipe(
      map((response) => {
        let colocationAntennas = getSafeProperty(response, (obj) => obj.collection);
        return colocationAntennas.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(`${service.billingDescription} (${service.serviceId})`, service.serviceId));
      })
    );
  }

  /**
   * Subscribes to colocation custom services
   */
  private _subscribesToColocationCustomDevices(): void {
    this.colocationCustomDevices$ = this._apiService.getColocationCustomDevices().pipe(
      map((response) => {
        let colocationCustomDervices = getSafeProperty(response, (obj) => obj.collection);
        return colocationCustomDervices.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(`${service.billingDescription} (${service.serviceId})`, service.serviceId));
      })
    );
  }

  /**
   * Subscribes to colocation rooms
   */
  private _subscribesToColocationRooms(): void {
    this.colocationRooms$ = this._apiService.getColocationRooms().pipe(
      map((response) => {
        let colocationRooms = getSafeProperty(response, (obj) => obj.collection);
        return colocationRooms.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(`${service.billingDescription} (${service.serviceId})`, service.serviceId));
      })
    );
  }

  /**
   * Subscribes to colocation standard square metres
   */
  private _subscribesToColocationStandardSquareMetres(): void {
    this.colocationStandardSqms$ = this._apiService.getColocationStandardSqms().pipe(
      map((response) => {
        let colocationStandardSqms = getSafeProperty(response, (obj) => obj.collection);
        return colocationStandardSqms.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(`${service.billingDescription} (${service.serviceId})`, service.serviceId));
      })
    );
  }

  /**
   * Subscribes to colocation racks
   */
  private _subscribesToColocationRacks(): void {
    this.colocationRacks$ = this._apiService.getColocationRacks().pipe(
      map((response) => {
        let colocationRacks = getSafeProperty(response, (obj) => obj.collection);
        return colocationRacks.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(`${service.description} (${service.serviceId})`, service.serviceId));
      })
    );
  }

  /**
   * Subscribes to vdc storage
   */
  private _subscribesToVdcStorage(): void {
    this.vdcStorages$ = this.vdcList$.pipe(
      map((vdcCollection) => {
        let vdcStorageGroup: TicketService[] = [];
        let vdc = getSafeProperty(vdcCollection, (obj) => obj) || [];

        vdc.forEach((resource) => {
          this._apiService.getResource(resource.id).subscribe((vdcStorage) => {
            vdcStorage.storage.forEach((storage) => {
              if (isNullOrEmpty(storage?.serviceId)) { return; }
              vdcStorageGroup.push(
                new TicketService(`${storage.name} - for ${resource.serviceId} (${storage.serviceId})`
                  , storage.serviceId)
              );
            });
          })
        })
        return vdcStorageGroup;
      })
    );
  }

  /**
   * Subscribes to dedicated servers
   */
  private _subscribesToDedicatedServers(): void {
    this.dedicatedServers$ = this.serversList$.pipe(
      map((response) => {
        let servers = getSafeProperty(response, (obj) => obj)
        return servers.filter((server) => server.isDedicated && server.hardware?.type !== 'VM' )
          .map((service) => new TicketService(`${service.name} (${service.serviceId})`, service.serviceId));
      })
    );
  }

  /**
   * Subscribes to management services
   */
  private _subscribesToManagementServices(): void {
    if (!this.hasPublicCloudAccess) { return; }
    this.managementServices$ = this._apiService.getManagementServices().pipe(
      map((response) => {
        let managementServices = getSafeProperty(response, (obj) => obj.collection);
        return managementServices.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(`${service.description} (${service.serviceId})`, service.serviceId));
      })
    );
  }

  /**
   * Subscribes to server backup
   */
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
                  serverBackup.serviceId)
              );
            })
            return serverBackupGroup;
          })
        )
      }),
    );
  }

  /**
   * Subscribes to vm backup
   */
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
                  vmBackup.serviceId)
              );
            })
            return vmBackupGroup;
          })
        )
      }),
    );
  }

  /**
   * Subscribes to anti virus
   */
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
                  av.antiVirus.serviceId)
              );
            })
            return antiVirusGroup;
          })
        )
      }),
    );
  }

  /**
   * Subscribes to hids
   */
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
                  hidsDetails.hids.serviceId)
              );
            })
            return hidsGroup;
          })
        )
      }),
    );
  }

  private _getServerName(serviceServerId: string, servers: McsServer[]): string {
    let serverName = 'No server linked';
    servers.map((server) => {
      let serviceHasLinkedServer = serviceServerId === server.id;
      if (serviceHasLinkedServer) {
        serverName = `for ${server.name}`;
      };
    });

    return serverName;
  }

  /**
   * Subscribes to DNS
   */
  private _subscribesToDns(): void {
    this.dns$ = this._apiService.getNetworkDns().pipe(
      map((response) => {
        let dns = getSafeProperty(response, (obj) => obj.collection);
        return dns.filter((service) => getSafeProperty(service, (obj) => obj.serviceId))
          .map((service) => new TicketService(`${service.billingDescription} (${service.serviceId})`, service.serviceId));
      })
    );
  }
}
