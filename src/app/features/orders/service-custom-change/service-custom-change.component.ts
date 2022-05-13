import {
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Injector,
  ViewChild,
  Component
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  takeUntil,
  map,
  filter,
  tap,
  shareReplay,
  switchMap
} from 'rxjs/operators';
import {
  Subject,
  Observable,
  zip,
  BehaviorSubject
} from 'rxjs';
import {
  Guid,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  unsubscribeSafely,
  formatStringToPhoneNumber,
  getCurrentDate,
  formatStringToText
} from '@app/utilities';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester,
  IMcsFormGroup,
  McsAccessControlService,
  McsAuthenticationIdentity
} from '@app/core';
import { McsApiService } from '@app/services';
import {
  serviceTypeText,
  McsOrderCreate,
  McsOrderWorkflow,
  McsOrderItemCreate,
  OrderIdType,
  McsOrderServiceCustomChange,
  McsOption,
  McsAccount,
  RouteKey,
  DeliveryType,
  McsServer,
  McsResource,
  McsFeatureFlag
} from '@app/models';
import {
  OrderDetails,
  SmacSharedDetails,
  SmacSharedFormConfig
} from '@app/features-shared';
import { McsFormGroupDirective } from '@app/shared';
import { ServiceCustomChangeService } from './service-custom-change.service';

const SERVICE_CUSTOM_CHANGE = Guid.newGuid().toString();
const TEXTAREA_MAXLENGTH_DEFAULT = 850;

// TODO: create a base class or an interface for all the services of portal
interface CustomChangeService {
  name: string;
  serviceId: string;
}

@Component({
  selector: 'mcs-order-service-custom-change',
  templateUrl: 'service-custom-change.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ServiceCustomChangeService]
})

export class ServiceCustomChangeComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public fgCustomChangeDetails: FormGroup;
  public fcService: FormControl;
  public fcChangeDescription: FormControl;
  public fcChangeObjective: FormControl;

  public vdcServices$: Observable<CustomChangeService[]>;
  public serverServices$: Observable<CustomChangeService[]>;
  public firewallServices$: Observable<CustomChangeService[]>;
  public internetPortServices$: Observable<CustomChangeService[]>;
  public batServices$: Observable<CustomChangeService[]>;
  public vdcStorages$: Observable<CustomChangeService[]>;
  public dns$: Observable<CustomChangeService[]>;
  public serverBackup$: Observable<CustomChangeService[]>;
  public vmBackup$: Observable<CustomChangeService[]>;
  public antiVirus$: Observable<CustomChangeService[]>;
  public hids$: Observable<CustomChangeService[]>;
  public extenders$: Observable<CustomChangeService[]>;
  public applicationRecoveryServices$: Observable<CustomChangeService[]>;

  public serversList$: Observable<McsServer[]>;
  public vdcList$: Observable<McsResource[]>;
  public account$: Observable<McsAccount>;
  public smacSharedFormConfig$: BehaviorSubject<SmacSharedFormConfig>;

  public contactOptions$: Observable<McsOption[]>;
  public selectedServiceId$: Observable<string>;

  private _smacSharedDetails: SmacSharedDetails;

  @ViewChild('fgSmacSharedForm')
  public set fgSmacSharedForm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgCustomChangeDetails.contains('fgSmacSharedForm');
    if (isRegistered) { return; }
    this.fgCustomChangeDetails.addControl('fgSmacSharedForm',
      value.getFormGroup().formGroup
    );
  }

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _customChangeService: ServiceCustomChangeService,
    private _formBuilder: FormBuilder,
    private _apiService: McsApiService,
    private _activatedRoute: ActivatedRoute,
    private _accessControlService: McsAccessControlService,
    private _authenticationIdentity: McsAuthenticationIdentity
  ) {
    super(
      _customChangeService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'custom-change-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._smacSharedDetails = new SmacSharedDetails();
    this._registerFormGroups();
  }

  public ngOnInit(): void {
    this._subscribesToServersList();
    this._subscribesToVdcList();
    this._subscribesToSelectedService();
    this._subscribeToVdcServices();
    this._subscribeToServerServices();
    this._subscribeToFirewallServices();
    this._subscribeToInternetPortServices();
    this._subscribeToBatServices();
    this._subscribesToVdcStorage();
    this._subscribeToServerBackupServices();
    this._subscribeToVMBackupServices();
    this._subscribeToAntiVirusServices();
    this._subscribeToHidsServices();
    this._subscribeToDnsServices();
    this._subscribeToExtenderServices();
    this._subscribeToApplicationRecoveryServices();
    this._subscribeToSmacSharedFormConfig();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._formGroupSubject);
    unsubscribeSafely(this.smacSharedFormConfig$);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get routeKeyEnum(): typeof RouteKey {
    return RouteKey;
  }

  public get notesLabel(): string {
    return this.translateService.instant('orderServiceCustomChange.requestDetails.additionalNotes.label');
  }

  public get defaultMaxlength(): number {
    return TEXTAREA_MAXLENGTH_DEFAULT;
  }

  /**
   * Event listener when there is a change in Shared SMAC Form
   */
  public onChangeSharedForm(formDetails: SmacSharedDetails): void {
    this._smacSharedDetails = formDetails;
  }

  /**
   * Event listener when there is a change in Order Details
   */
  public onOrderDetailsDataChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }

    this._customChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing,
      orderDetails.deliveryType,
      orderDetails.schedule
    );
    this._customChangeService.submitOrderRequest();
  }

  /**
   * Event listener when Order is Submitted
   */
  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription
    };
    this.submitOrderWorkflow(workflow);
  }

  /**
   * Register all form groups
   */
  private _registerFormGroups() {
    this.fcService = new FormControl('', [CoreValidators.required]);
    this.fcChangeDescription = new FormControl('', [CoreValidators.required]);
    this.fcChangeObjective = new FormControl('', [CoreValidators.required]);

    this.fgCustomChangeDetails = this._formBuilder.group({
      fcService: this.fcService,
      fcChangeDescription: this.fcChangeDescription,
      fcChangeObjective: this.fcChangeObjective
    });
  }

  private _subscribesToSelectedService(): void {
    this.selectedServiceId$ = this._activatedRoute.queryParams.pipe(
      map((params) => getSafeProperty(params, (obj) => obj.serviceId)),
      tap((params) => {
        this.fcService.setValue(params);
      }),
      shareReplay(1)
    );
  }

  /**
   * Subscribe to form changes
   */
  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this._onCustomChangeDetailsFormChange())
    ).subscribe();
  }

  /**
   * Event listener whenever there is a change in the form
   */
  private _onCustomChangeDetailsFormChange(): void {
    this._customChangeService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            serviceId: this.fcService.value,
            itemOrderType: OrderIdType.ServiceCustomChange,
            referenceId: SERVICE_CUSTOM_CHANGE,
            deliveryType: DeliveryType.Standard, // set to Standard as default
            schedule: getCurrentDate().toISOString(),
            properties: createObject(McsOrderServiceCustomChange, {
              change: formatStringToText(this.fcChangeDescription.value),
              changeObjective: formatStringToText(this.fcChangeObjective.value),
              testCases: this._smacSharedDetails.testCases,
              phoneConfirmationRequired: this._smacSharedDetails.contactAfterChange,
              customerReferenceNumber: formatStringToText(this._smacSharedDetails.referenceNumber),
              notes: formatStringToText(this._smacSharedDetails.notes)
            })
          })
        ]
      })
    );
  }

  /**
   * Subscribes to servers list
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
   * Subscribe to vdc services
   */
  private _subscribeToVdcServices(): void {
    this.vdcServices$ = this.vdcList$.pipe(
      map((resources) => {
        return resources.map((resource) => {
            return {
              name: `${serviceTypeText[resource.serviceType]} VDC (${resource.name})`,
              serviceId: resource.name
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to servers services
   */
  private _subscribeToServerServices(): void {
    this.serverServices$ = this.serversList$.pipe(
      map((response) => {
        let servers = response;
        return servers.filter((server) => getSafeProperty(server, (obj) => obj.serviceChangeAvailable))
          .map((server) => {
            return {
              name: `${server.name} (${server.serviceId})`,
              serviceId: server.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to firewall services
   */
  private _subscribeToFirewallServices(): void {
    this.firewallServices$ = this._apiService.getFirewalls().pipe(
      map((response) => {
        let firewalls = getSafeProperty(response, (obj) => obj.collection);
        return firewalls.filter((firewall) => getSafeProperty(firewall, (obj) => obj.serviceId))
          .map((firewall) => {
            return {
              name: `${firewall.managementName} (${firewall.serviceId})`,
              serviceId: firewall.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to internet port services
   */
  private _subscribeToInternetPortServices(): void {
    this.internetPortServices$ = this._apiService.getInternetPorts().pipe(
      map((response) => {
        let internetPorts = getSafeProperty(response, (obj) => obj.collection);
        return internetPorts.filter((internetPort) => getSafeProperty(internetPort, (obj) => obj.serviceId))
          .map((internetPort) => {
            return {
              name: `${internetPort.description} (${internetPort.serviceId})`,
              serviceId: internetPort.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to backup aggregation target services
   */
  private _subscribeToBatServices(): void {
    this.batServices$ = this._apiService.getBackupAggregationTargets().pipe(
      map((response) => {
        let bats = getSafeProperty(response, (obj) => obj.collection);
        return bats.filter((bat) => getSafeProperty(bat, (obj) => obj.serviceId))
          .map((bat) => {
            return {
              name: `${bat.description} (${bat.serviceId})`,
              serviceId: bat.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribes to vdc storage
   */
  private _subscribesToVdcStorage(): void {
    this.vdcStorages$ = this.vdcList$.pipe(
      map((vdcCollection) => {
        let vdcStorageGroup: CustomChangeService[] = [];
        let vdc = getSafeProperty(vdcCollection, (obj) => obj) || [];

        vdc.forEach((resource) => {
          this._apiService.getResource(resource.id).subscribe((vdcStorage) => {
            vdcStorage.storage.forEach((storage) => {
              let vdcStorageInvalidToCustomChange = isNullOrEmpty(storage?.serviceId) || !storage?.serviceChangeAvailable;
              if (vdcStorageInvalidToCustomChange) { return; }

              vdcStorageGroup.push({
                name: `${storage.name} - for ${resource.serviceId} (${storage.serviceId})`,
                serviceId: storage.serviceId
              });
            });
          })
        })
        return vdcStorageGroup;
      })
    );
  }

  /**
   * Subscribe to server backup
   */
  private _subscribeToServerBackupServices(): void {
    this.serverBackup$ = this._apiService.getServerBackupServers().pipe(
      switchMap((serverBackupsCollection) => {
        return this.serversList$.pipe(
          map((serversCollection) => {
            let serverBackupGroup: CustomChangeService[] = [];
            let serverBackups = getSafeProperty(serverBackupsCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj) || [];

            serverBackups.forEach((serverBackup) => {
              let serverBackupInvalidForCustomChange = isNullOrEmpty(serverBackup.serviceId) || !serverBackup.serviceChangeAvailable;
              if (serverBackupInvalidForCustomChange) { return; }
              let serverName = this._getServerName(serverBackup.id, servers);
              serverBackupGroup.push({
                name: `Server Backup - ${serverName} (${serverBackup.serviceId})`,
                serviceId: serverBackup.serviceId
              });
            })
            return serverBackupGroup;
          })
        )
      }),
    );
  }

  /**
   * Subscribe to vm backup
   */
  private _subscribeToVMBackupServices(): void {
    this.vmBackup$ = this._apiService.getServerBackupVms().pipe(
      switchMap((vmBackupsCollection) => {
        return this.serversList$.pipe(
          map((serversCollection) => {
            let vmBackupGroup: CustomChangeService[] = [];
            let vmBackups = getSafeProperty(vmBackupsCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj) || [];

            vmBackups.forEach((vmBackup) => {
              let vmBackupInvalidForCustomChange = isNullOrEmpty(vmBackup.serviceId) || !vmBackup.serviceChangeAvailable;
              if (vmBackupInvalidForCustomChange) { return; }
              let serverName = this._getServerName(vmBackup.id, servers);
              vmBackupGroup.push({
                name: `VM Backup - ${serverName} (${vmBackup.serviceId})`,
                serviceId: vmBackup.serviceId
              });
            })
            return vmBackupGroup;
          })
        )
      }),
    );
  }

  private _subscribeToAntiVirusServices(): void {
    this.antiVirus$ = this._apiService.getServerHostSecurityAntiVirus().pipe(
      switchMap((antiVirusCollection) => {
        return this.serversList$.pipe(
          map((serversCollection) => {
            let antiVirusGroup: CustomChangeService[] = [];
            let antiVirus = getSafeProperty(antiVirusCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj) || [];

            antiVirus.forEach((av) => {
              let antiVirusInvalidForCustomChange = isNullOrEmpty(av?.antiVirus?.serviceId) || !av?.antiVirus?.serviceChangeAvailable;
              if (antiVirusInvalidForCustomChange) { return; }
              let serverName = this._getServerName(av.serverId, servers);
              antiVirusGroup.push({
                name: `${av.antiVirus.billingDescription} - ${serverName} (${av.antiVirus.serviceId})`,
                serviceId: av.antiVirus.serviceId
              });
            })
            return antiVirusGroup;
          })
        )
      }),
    );
  }

  private _subscribeToHidsServices(): void {
    this.hids$ = this._apiService.getServerHostSecurityHids().pipe(
      switchMap((hidsCollection) => {
        return this.serversList$.pipe(
          map((serversCollection) => {
            let hidsGroup: CustomChangeService[] = [];
            let hids = getSafeProperty(hidsCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj) || [];

            hids.forEach((hidsDetails) => {
              let hidsInvalidForCustomChange = isNullOrEmpty(hidsDetails?.hids?.serviceId) || !hidsDetails?.hids?.serviceChangeAvailable;
              if (hidsInvalidForCustomChange) { return; }
              let serverName = this._getServerName(hidsDetails.serverId, servers);
              hidsGroup.push({
                name: `${hidsDetails.hids.billingDescription} - ${serverName} (${hidsDetails.hids.serviceId})`,
                serviceId: hidsDetails.hids.serviceId
              });
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
   * Subscribe to DNS services
   */
  private _subscribeToDnsServices(): void {
    this.dns$ = this._apiService.getNetworkDns().pipe(
      map((response) => {
        let dnsService = getSafeProperty(response, (obj) => obj.collection);
        return dnsService.filter((dns) => getSafeProperty(dns, (obj) => obj.serviceId && obj.serviceChangeAvailable))
          .map((dns) => {
            return {
              name: `${dns.billingDescription} (${dns.serviceId})`,
              serviceId: dns.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to Extender services
   */
  private _subscribeToExtenderServices(): void {
    if ((!this._accessControlService.hasAccessToFeature([McsFeatureFlag.ExtenderListing,McsFeatureFlag.HybridCloud], true)) ||
       (!this._authenticationIdentity.platformSettings.hasHybridCloud))  {
         return;
       }

    if (!this._accessControlService.hasAccessToFeature([McsFeatureFlag.ExtenderListing,McsFeatureFlag.HybridCloud], true)) { return; }
    this.extenders$ = this._apiService.getExtenders().pipe(
      map((response) => {
        let extenders = getSafeProperty(response, (obj) => obj.collection);
        return extenders.filter((extender) => getSafeProperty(extender, (obj) => obj.serviceId))
          .map((extender) => {
            return {
              name: `${extender.billingDescription} (${extender.serviceId})`,
              serviceId: extender.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to Application Recovery services
   */
  private _subscribeToApplicationRecoveryServices(): void {
    if ((!this._accessControlService.hasAccessToFeature([McsFeatureFlag.ApplicationRecoveryListing,McsFeatureFlag.HybridCloud], true)) ||
       (!this._authenticationIdentity.platformSettings.hasHybridCloud))  {
         return;
       }

    if (!this._accessControlService.hasAccessToFeature(
      [McsFeatureFlag.ApplicationRecoveryListing,McsFeatureFlag.HybridCloud], true)
    ) { return; }
    this.applicationRecoveryServices$ = this._apiService.getApplicationRecovery().pipe(
      map((response) => {
        let applicationRecoveryServices = getSafeProperty(response, (obj) => obj.collection);
        return applicationRecoveryServices.filter(
          (applicationRecoveryService) => getSafeProperty(applicationRecoveryService, (obj) => obj.serviceId))
          .map((applicationRecoveryService) => {
            return {
              name: `${applicationRecoveryService.billingDescription} (${applicationRecoveryService.serviceId})`,
              serviceId: applicationRecoveryService.serviceId
            } as CustomChangeService;
          });
      })
    );
  }

  /**
   * Subscribe to Smac Shared Form Config
   */
  private _subscribeToSmacSharedFormConfig(): void {
    let testCaseConfig = { isIncluded: true };
    let notesConfig = { isIncluded: true, label: this.notesLabel};
    let contactConfig = { isIncluded: true };
    let config = new SmacSharedFormConfig(this._injector, testCaseConfig, notesConfig, contactConfig);
    this.smacSharedFormConfig$ = new BehaviorSubject<SmacSharedFormConfig>(config);
  }
}
