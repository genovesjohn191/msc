import {
  throwError,
  Observable,
  Subject,
  Subscription
} from 'rxjs';
import {
  catchError,
  map,
  switchMap,
  takeUntil
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
  McsFormGroupService,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { OrderDetails } from '@app/features-shared';
import {
  HttpStatusCode,
  McsEntityProvision,
  McsOption,
  McsOptionGroup,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderWorkflow,
  McsServer,
  McsServerHostSecurityAntiVirus,
  OrderIdType,
  ServiceOrderState
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

import { AddAntiVirusService } from './add-anti-virus.service';

interface AntiVirusServers {
  provisioned: boolean;
  server: McsServer;
}

const SERVER_ADD_ANTI_VIRUS_REF_ID = Guid.newGuid().toString();
@Component({
  selector: 'mcs-order-add-anti-virus',
  templateUrl: 'add-anti-virus.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddAntiVirusService]
})

export class AddAntiVirusComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public serverGroups$: Observable<McsOptionGroup[]>;

  public fgAddAntiVirusDetails: FormGroup;
  public fcServer: FormControl;

  @ViewChild(McsFormGroupDirective)
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _selectedServerHandler: Subscription;
  private _avOrderStateMessageMap = new Map<ServiceOrderState, string>();
  private _errorStatus: number;
  private _avCount: number;

  constructor(
    _injector: Injector,
    private _elementRef: ElementRef,
    private _formBuilder: FormBuilder,
    private _formGroupService: McsFormGroupService,
    private _eventDispatcher: EventBusDispatcherService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _addAntiVirusService: AddAntiVirusService
  ) {
    super(
      _addAntiVirusService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'add-antivirus-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroups();
    this._registerProvisionStateBitmap();
    this._registerEvents();
  }

  public ngOnInit() {
    this._subscribeToManagedCloudServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._selectedServerHandler);
    unsubscribeSafely(this._destroySubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._avCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' :
      'orderAddAntiVirus.details.server.serverFallbackLabel';
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public isResourcesEmpty(resourcesMap: Map<string, AntiVirusServers[]>): boolean {
    return resourcesMap.size <= 0;
  }

  public onChangeServer(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this._addAntiVirusService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.AddAntiVirus,
            referenceId: SERVER_ADD_ANTI_VIRUS_REF_ID,
            parentServiceId: server.serviceId,
            properties: {}
          })
        ]
      })
    );
  }

  public onSubmitAntiVirusDetails(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this._changeDetectorRef.markForCheck();
  }

  public onSubmitOrder(submitDetails: OrderDetails, server: McsServer): void {
    if (!this._validateFormFields()) { return; }
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serverId: server.id,
      serviceId: server.serviceId
    };

    this.submitOrderWorkflow(workflow);
  }

  public onAddAntiVirusConfirmOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }
    this._addAntiVirusService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._addAntiVirusService.submitOrderRequest();
  }

  private _subscribeToManagedCloudServers(): void {
    this.serverGroups$ = this._apiService.getServerHostSecurityAntiVirus().pipe(
      switchMap((avCollection) => {

        return this._apiService.getServers().pipe(
          map((serversCollection) => {
            let serverGroups: McsOptionGroup[] = [];
            let avList = getSafeProperty(avCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj.collection) || [];

            servers.forEach((server) => {
              if (!server.isManagedVCloud) { return; }

              let platformName = getSafeProperty(server, (obj) => obj.platform.resourceName) || 'Others';
              let foundGroup = serverGroups.find((serverGroup) => serverGroup.groupName === platformName);
              let avDetails = this._createAvDetails(server, avList);

              if (!isNullOrEmpty(foundGroup)) {
                foundGroup.options.push(
                  createObject(McsOption, { text: server.name, value: avDetails })
                );
                return;
              }
              serverGroups.push(
                new McsOptionGroup(platformName,
                  createObject(McsOption, { text: server.name, value: avDetails })
                )
              );
            });
            this._avCount = serverGroups?.length;
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

  private _createAvDetails(
    server: McsServer,
    avList: McsServerHostSecurityAntiVirus[]
  ): McsEntityProvision<McsServer> {
    let avDetails = new McsEntityProvision<McsServer>();
    avDetails.entity = server;

    // Return immediately when server has been found
    let serverAvFound = avList && avList.find((av) => av.serverId === server.id);
    if (serverAvFound) {
      avDetails.disabled = true;
      avDetails.provisioned = true;
      return avDetails;
    }

    let serverProvisionMessage = this._avOrderStateMessageMap.get(server.getServiceOrderState());
    if (isNullOrEmpty(serverProvisionMessage)) { return avDetails; }

    avDetails.message = serverProvisionMessage;
    avDetails.disabled = true;
    avDetails.provisioned = false;
    return avDetails;
  }

  private _validateFormFields(): boolean {
    if (this.formIsValid) { return true; }
    this._touchInvalidFields();
    return false;
  }

  private _touchInvalidFields(): void {
    this._formGroupService.touchAllFormFields(this.fgAddAntiVirusDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
  }

  private _onSelectedServer(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this.fcServer.setValue(server);
  }

  private _registerFormGroups() {
    this.fgAddAntiVirusDetails = this._formBuilder.group([]);
    this.fcServer = new FormControl('', [CoreValidators.required]);

    this.fgAddAntiVirusDetails = new FormGroup({
      fcServer: this.fcServer
    });

    this.fgAddAntiVirusDetails.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe();
  }

  private _registerEvents(): void {
    this._selectedServerHandler = this._eventDispatcher.addEventListener(
      McsEvent.serverAddAvSelected, this._onSelectedServer.bind(this));

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.serverAddAvSelected);
  }

  private _registerProvisionStateBitmap(): void {
    this._avOrderStateMessageMap.set(
      ServiceOrderState.PoweredOff,
      this.translateService.instant('orderAddAntiVirus.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddAntiVirus.details.server.serverPoweredOff')
      })
    );

    this._avOrderStateMessageMap.set(
      ServiceOrderState.ChangeUnavailable,
      this.translateService.instant('orderAddAntiVirus.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddAntiVirus.details.server.serverChangeAvailableFalse')
      })
    );

    this._avOrderStateMessageMap.set(
      ServiceOrderState.OsAutomationNotReady,
      this.translateService.instant('orderAddAntiVirus.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddAntiVirus.details.server.serverOsAutomationFalse')
      })
    );

    this._avOrderStateMessageMap.set(
      ServiceOrderState.Busy,
      this.translateService.instant('orderAddAntiVirus.details.server.serverDisabled', {
        server_issue:  this.translateService.instant('orderAddAntiVirus.details.server.busy')
      })
    );
  }
}
