import {
  zip,
  Observable,
  Subject,
  Subscription,
  throwError
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  CoreValidators,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { OrderDetails } from '@app/features-shared';
import {
  hidsProtectionLevelText,
  HidsProtectionLevel,
  McsEntityProvision,
  McsOption,
  McsOptionGroup,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderServerHidsAdd,
  McsOrderWorkflow,
  McsPermission,
  McsServer,
  McsServerHostSecurityHids,
  OrderIdType,
  ServiceOrderState,
  HttpStatusCode,
  McsServersQueryParams
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid
} from '@app/utilities';

import { AddHidsService } from './add-hids.service';

interface HidsServers {
  provisioned: boolean;
  server: McsServer;
}

const SERVER_ADD_HIDS_REF_ID = Guid.newGuid().toString();
@Component({
  selector: 'mcs-order-add-hids',
  templateUrl: 'add-hids.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddHidsService]
})

export class AddHidsComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public serverGroups$: Observable<McsOptionGroup[]>;

  public fgAddHidsDetails: FormGroup<any>;
  public fcServer: FormControl<McsServer>;
  public fcProtectionLevel: FormControl<HidsProtectionLevel>;
  public protectionLevelOptions: McsOption[] = [];

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;

  private _valueChangesSubject = new Subject<void>();
  private _selectedServerHandler: Subscription;
  private _hidsOrderStateMessageMap = new Map<ServiceOrderState, string>();
  private _errorStatus: number;
  private _hidsCount: number;

  constructor(
    _injector: Injector,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _eventDispatcher: EventBusDispatcherService,
    private _apiService: McsApiService,
    private _addHidsService: AddHidsService
  ) {
    super(
      _addHidsService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'add-hids-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroups();
    this._registerProvisionStateBitmap();
    this._registerEvents();
  }

  public ngOnInit() {
    this._initializeProtectionLevelOptions();
    this._subscribeToManagedCloudServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._selectedServerHandler);
    unsubscribeSafely(this._valueChangesSubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._hidsCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' :
      'orderAddHids.details.server.serverFallbackLabel';
  }

  public onSubmitHidsDetails(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  public onSubmitOrder(submitDetails: OrderDetails, server: McsServer): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serverId: server.id
    };
    this.submitOrderWorkflow(workflow);
  }

  public onAddHidsConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._addHidsService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._addHidsService.submitOrderRequest();
  }

  public isResourcesEmpty(resourcesMap: Map<string, HidsServers[]>): boolean {
    return resourcesMap.size <= 0;
  }

  private _subscribeToValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._valueChangesSubject),
      filter(() => this.formIsValid),
      tap(() => this._onServerHidsFormChange())
    ).subscribe();
  }

  private _onServerHidsFormChange(): void {
    let server = getSafeProperty(this.fcServer, (obj) => obj.value);
    let protectionLevelValue = getSafeProperty(this.fcProtectionLevel, (obj) => obj.value);

    this._addHidsService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.AddHids,
            referenceId: SERVER_ADD_HIDS_REF_ID,
            parentServiceId: server.serviceId,
            properties: createObject(McsOrderServerHidsAdd, {
              protectionLevel: protectionLevelValue,
            })
          })]
      })
    );
  }

  private _subscribeToManagedCloudServers(): void {
    this.serverGroups$ = this._apiService.getServerHostSecurityHids().pipe(
      switchMap((hidsCollection) => {
        let queryParam = new McsServersQueryParams();
        queryParam.platformType = 'VCloud';

        return this._apiService.getServers(queryParam).pipe(
          map((serversCollection) => {
            let serverGroups: McsOptionGroup[] = [];
            let hids = getSafeProperty(hidsCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj.collection) || [];

            servers.forEach((server) => {
              if (server.isSelfManaged) { return; }

              let platformName = getSafeProperty(server, (obj) => obj.platform.resourceName) || 'Others';
              let foundGroup = serverGroups.find((serverGroup) => serverGroup.groupName === platformName);
              let hidsDetails = this._createHidsDetails(server, hids);

              if (!isNullOrEmpty(foundGroup)) {
                foundGroup.options.push(
                  createObject(McsOption, { text: server.name, value: hidsDetails })
                );
                return;
              }
              serverGroups.push(
                new McsOptionGroup(platformName,
                  createObject(McsOption, { text: server.name, value: hidsDetails })
                )
              );
            });
            this._hidsCount = serverGroups?.length;
            return serverGroups;
          })
        );
      }),
      catchError((error) => {
        this._errorStatus = error?.details?.status;
        return throwError(error);
      })
    );
  }

  private _createHidsDetails(
    server: McsServer,
    hids: McsServerHostSecurityHids[]
  ): McsEntityProvision<McsServer> {
    let hidsDetails = new McsEntityProvision<McsServer>();
    hidsDetails.entity = server;

    // Return immediately when server has been found
    let serverHidsFound = hids && hids.find((hid) => hid.serverId === server.id);
    if (serverHidsFound) {
      hidsDetails.disabled = true;
      hidsDetails.provisioned = true;
      return hidsDetails;
    }

    let serverProvisionMessage = this._hidsOrderStateMessageMap.get(server.getServiceOrderState());
    if (isNullOrEmpty(serverProvisionMessage)) { return hidsDetails; }

    hidsDetails.message = serverProvisionMessage;
    hidsDetails.disabled = true;
    hidsDetails.provisioned = false;
    return hidsDetails;
  }

  private _onSelectedServer(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this.fcServer.setValue(server);
  }

  private _registerFormGroups() {
    this.fcServer = new FormControl<McsServer>(null, [CoreValidators.required]);
    this.fcProtectionLevel = new FormControl<HidsProtectionLevel>(HidsProtectionLevel.Detect, [CoreValidators.required]);

    this.fgAddHidsDetails = this._formBuilder.group({
      fcServer: this.fcServer,
      fcProtectionLevel: this.fcProtectionLevel,
    });
  }

  private _registerEvents(): void {
    this._selectedServerHandler = this._eventDispatcher.addEventListener(
      McsEvent.serverAddHidsSelected, this._onSelectedServer.bind(this));

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.serverAddHidsSelected);
  }

  private _initializeProtectionLevelOptions(): void {
    this.protectionLevelOptions.push(new McsOption(HidsProtectionLevel.Protect, hidsProtectionLevelText[HidsProtectionLevel.Protect]));
    this.protectionLevelOptions.push(new McsOption(HidsProtectionLevel.Detect, hidsProtectionLevelText[HidsProtectionLevel.Detect]));
  }

  private _registerProvisionStateBitmap(): void {
    this._hidsOrderStateMessageMap.set(
      ServiceOrderState.PoweredOff,
      this.translateService.instant('orderAddHids.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddHids.details.server.serverNotPoweredOn')
      })
    );

    this._hidsOrderStateMessageMap.set(
      ServiceOrderState.Suspended,
      this.translateService.instant('orderAddHids.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddHids.details.server.serverNotPoweredOn')
      })
    );

    this._hidsOrderStateMessageMap.set(
      ServiceOrderState.ChangeUnavailable,
      this.translateService.instant('orderAddHids.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddHids.details.server.serverChangeAvailableFalse')
      })
    );

    this._hidsOrderStateMessageMap.set(
      ServiceOrderState.OsAutomationNotReady,
      this.translateService.instant('orderAddHids.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddHids.details.server.serverOsAutomationFalse')
      })
    );

    this._hidsOrderStateMessageMap.set(
      ServiceOrderState.Busy,
      this.translateService.instant('orderAddHids.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddHids.details.server.busy')
      })
    );
  }
}
