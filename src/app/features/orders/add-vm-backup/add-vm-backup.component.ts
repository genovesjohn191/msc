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
  IMcsFormGroup,
  McsOrderWizardBase,
  OrderRequester
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import { OrderDetails } from '@app/features-shared';
import {
  HttpStatusCode,
  McsBackUpAggregationTarget,
  McsEntityProvision,
  McsOption,
  McsOptionGroup,
  McsOrderCreate,
  McsOrderItemCreate,
  McsOrderVmBackupAdd,
  McsOrderWorkflow,
  McsServer,
  McsServerBackupVm,
  OrderIdType,
  ServiceOrderState
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  createObject,
  getSafeFormValue,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely,
  CommonDefinition,
  Guid
} from '@app/utilities';

import { AddVmBackupService } from './add-vm-backup.service';

const ADD_VM_BACKUP = Guid.newGuid().toString();

@Component({
  selector: 'mcs-order-add-vm-backup',
  templateUrl: 'add-vm-backup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddVmBackupService],
})

export class AddVmBackupComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public serverGroups$: Observable<McsOptionGroup[]>;
  public aggregationTargets$: Observable<McsBackUpAggregationTarget[]>;

  public fgVmBackup: FormGroup<any>;
  public fcServer: FormControl<McsServer>;

  private _vmBackup: McsOrderVmBackupAdd;
  private _valueChangesSubject = new Subject<void>();
  private _selectedServerHandler: Subscription;
  private _backupProvisionMessageBitMap = new Map<ServiceOrderState, string>();
  private _errorStatus: number;
  private _serverGroupCount: number;

  @ViewChild('fgManageBackupVm')
  public set fgManageBackupVm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgVmBackup.contains('fgManageBackupVm');
    if (isRegistered) { return; }
    this.fgVmBackup.addControl('fgManageBackupVm',
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

  constructor(
    _injector: Injector,
    private _formBuilder: FormBuilder,
    private _eventDispatcher: EventBusDispatcherService,
    private _vmBackupService: AddVmBackupService,
    private _apiService: McsApiService,
  ) {
    super(
      _vmBackupService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'add-vm-backup-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroup();
    this._registerProvisionStateBitmap();
  }

  public ngOnInit() {
    this._subscribeToServers();
    this._subscribeToAggregationTargets();
    this._registerEvents();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._valueChangesSubject);
    unsubscribeSafely(this._selectedServerHandler);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get showPermissionErrorFallbackText(): boolean {
    return this._errorStatus === HttpStatusCode.Forbidden;
  }

  public get noServicesToDisplay(): boolean {
    return !isNullOrEmpty(this._errorStatus) || this._serverGroupCount === 0;
  }

  public get noServicesFallbackText(): string {
    if (!this.noServicesToDisplay) { return; }
    return this.showPermissionErrorFallbackText ? 'message.noPermissionFallbackText' : 'message.noServiceToDisplay';
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public onChangeVmBackUpDetails(vmBackUpDetails: McsOrderVmBackupAdd): void {
    this._vmBackup = vmBackUpDetails;
  }

  public onVmBackupOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }

    this._vmBackupService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._vmBackupService.submitOrderRequest();
  }

  public onSubmitOrder(submitDetails: OrderDetails, selectedServerId: string): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      serverId: selectedServerId
    };
    this.submitOrderWorkflow(workflow);
  }

  private _subscribeToValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._valueChangesSubject),
      filter(() => this.formIsValid),
      tap(() => this._onVmBackupChange())
    ).subscribe();
  }

  private _onVmBackupChange(): void {
    let server = getSafeFormValue(this.fcServer, (obj) => obj.value);

    this._vmBackupService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.AddVmBackup,
            referenceId: ADD_VM_BACKUP,
            parentServiceId: server.serviceId,
            properties: this._vmBackup
          })
        ]
      })
    );
  }

  private _subscribeToServers(): void {
    this.serverGroups$ = this._apiService.getServerBackupVms().pipe(
      switchMap((backupsCollection) => {

        return this._apiService.getServers().pipe(
          map((serversCollection) => {
            let serverGroups: McsOptionGroup[] = [];
            let backups = getSafeProperty(backupsCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj.collection) || [];

            servers.forEach((server) => {
              if (!server.isManagedVCloud) { return; }

              let platformName = getSafeProperty(server, (obj) => obj.platform.resourceName) || 'Others';
              let foundGroup = serverGroups.find((serverGroup) => serverGroup.groupName === platformName);
              let vmBackupDetails = this._createVmBackupDetails(server, backups);

              if (!isNullOrEmpty(foundGroup)) {
                foundGroup.options.push(
                  createObject(McsOption, { text: server.name, value: vmBackupDetails })
                );
                return;
              }
              serverGroups.push(
                new McsOptionGroup(platformName,
                  createObject(McsOption, { text: server.name, value: vmBackupDetails })
                )
              );
            });
            this._serverGroupCount = serverGroups?.length;
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

  public get serviceOrderStateOption(): typeof ServiceOrderState {
    return ServiceOrderState;
  }

  private _createVmBackupDetails(
    server: McsServer,
    backups: McsServerBackupVm[]
  ): McsEntityProvision<McsServer> {
    let vmBackupDetails = new McsEntityProvision<McsServer>();
    vmBackupDetails.entity = server;

    // Return immediately when server has been found
    let serverBackupFound = backups && backups.find((backup) => backup.serverServiceId === server.serviceId);
    if (serverBackupFound) {
      vmBackupDetails.disabled = true;
      vmBackupDetails.provisioned = true;
      return vmBackupDetails;
    }

    let serverOrderState = server.getServiceOrderState();
    let serverProvisionMessage = this._backupProvisionMessageBitMap.get(serverOrderState);
    let serverOSAutomationNotready = serverOrderState === this.serviceOrderStateOption.OsAutomationNotReady;
    if (isNullOrEmpty(serverProvisionMessage) || serverOSAutomationNotready) { return vmBackupDetails; }

    vmBackupDetails.message = serverProvisionMessage;
    vmBackupDetails.disabled = true;
    vmBackupDetails.provisioned = false;
    return vmBackupDetails;
  }

  private _subscribeToAggregationTargets(): void {
    this.aggregationTargets$ = this._apiService.getBackupAggregationTargets().pipe(
      map((response) => response && response.collection)
    );
  }

  private _onSelectedServer(server: McsServer): void {
    if (isNullOrEmpty(server)) { return; }
    this.fcServer.setValue(server);
  }

  private _registerFormGroup(): void {
    this.fcServer = new FormControl<McsServer>(null, [CoreValidators.required]);
    this.fgVmBackup = this._formBuilder.group({
      fcServer: this.fcServer,
    });
  }

  private _registerEvents(): void {
    this._selectedServerHandler = this._eventDispatcher.addEventListener(
      McsEvent.serverAddBackupVmSelected, this._onSelectedServer.bind(this));

    // Invoke the event initially
    this._eventDispatcher.dispatch(McsEvent.serverAddBackupVmSelected);
  }

  private _registerProvisionStateBitmap(): void {
    this._backupProvisionMessageBitMap.set(
      ServiceOrderState.PoweredOff,
      this.translateService.instant('orderAddVmBackup.detailsStep.serverDisabled', {
        server_issue: this.translateService.instant('orderAddVmBackup.detailsStep.serverPoweredOff')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServiceOrderState.ChangeUnavailable,
      this.translateService.instant('orderAddVmBackup.detailsStep.serverDisabled', {
        server_issue: this.translateService.instant('orderAddVmBackup.detailsStep.serverChangeAvailableFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServiceOrderState.OsAutomationNotReady,
      this.translateService.instant('orderAddVmBackup.detailsStep.serverDisabled', {
        server_issue: this.translateService.instant('orderAddVmBackup.detailsStep.serverOsAutomationFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServiceOrderState.Busy,
      this.translateService.instant('orderAddVmBackup.detailsStep.serverDisabled', {
        server_issue: this.translateService.instant('orderAddVmBackup.detailsStep.busy')
      })
    );
  }
}
