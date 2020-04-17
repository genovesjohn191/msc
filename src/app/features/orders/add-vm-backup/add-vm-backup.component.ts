import {
  OnInit,
  OnDestroy,
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  Injector
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  Subject,
  Observable,
  zip
} from 'rxjs';
import {
  takeUntil,
  filter,
  tap,
  map,
  switchMap
} from 'rxjs/operators';
import {
  McsOrderWizardBase,
  OrderRequester,
  CoreValidators,
  IMcsFormGroup
} from '@app/core';
import {
  McsOptionGroup,
  McsOption,
  McsOrderCreate,
  McsOrderWorkflow,
  McsOrderItemCreate,
  OrderIdType,
  McsBackUpAggregationTarget,
  McsOrderVmBackupAdd,
  McsServer,
  McsServerBackupVm,
  McsEntityProvision,
  ServerProvisionState
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  Guid,
  CommonDefinition,
  getSafeProperty,
  createObject,
  getSafeFormValue
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';
import { AddVmBackupService } from './add-vm-backup.service';
import { TranslateService } from '@ngx-translate/core';

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

  public fgVmBackup: FormGroup;
  public fcServers: FormControl;

  private _vmBackup: McsOrderVmBackupAdd;
  private _valueChangesSubject = new Subject<void>();
  private _backupProvisionMessageBitMap = new Map<number, string>();

  @ViewChild('fgManageBackupVm', { static: false })
  public set fgManageBackupVm(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgVmBackup.contains('fgManageBackupVm');
    if (isRegistered) { return; }
    this.fgVmBackup.addControl('fgManageBackupVm',
      value.getFormGroup().formGroup
    );
  }

  @ViewChild(McsFormGroupDirective, { static: false })
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;

  constructor(
    _injector: Injector,
    private _formBuilder: FormBuilder,
    private _translate: TranslateService,
    private _vmBackupService: AddVmBackupService,
    private _apiService: McsApiService,
  ) {
    super(
      _injector,
      _vmBackupService,
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
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._valueChangesSubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
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

  private _registerFormGroup(): void {
    this.fcServers = new FormControl('', [CoreValidators.required]);
    this.fgVmBackup = this._formBuilder.group({
      fcServers: this.fcServers,
    });
  }

  private _registerProvisionStateBitmap(): void {
    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.PoweredOff,
      this._translate.instant('orderAddVmBackup.detailsStep.serverDisabled', {
        server_issue: this._translate.instant('orderAddVmBackup.detailsStep.serverPoweredOff')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.ServiceAvailableFalse,
      this._translate.instant('orderAddVmBackup.detailsStep.serverDisabled', {
        server_issue: this._translate.instant('orderAddVmBackup.detailsStep.serverChangeAvailableFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.OsAutomationFalse,
      this._translate.instant('orderAddVmBackup.detailsStep.serverDisabled', {
        server_issue: this._translate.instant('orderAddVmBackup.detailsStep.serverOsAutomationFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.PoweredOff | ServerProvisionState.OsAutomationFalse,
      this._translate.instant('orderAddVmBackup.detailsStep.serverDisabled', {
        server_issue: `
          ${this._translate.instant('orderAddVmBackup.detailsStep.serverPoweredOff')} and
          ${this._translate.instant('orderAddVmBackup.detailsStep.serverOsAutomationFalse')}
        `
      })
    );
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
    let server = getSafeFormValue(this.fcServers, (obj) => obj.value);

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
              if (!server.canProvision) { return; }

              let platformName = getSafeProperty(server, (obj) => obj.platform.resourceName) || 'Others';
              let foundGroup = serverGroups.find((serverGroup) => serverGroup.groupName === platformName);
              let serverBackupDetails = this._createServerBackupDetails(server, backups);

              if (!isNullOrEmpty(foundGroup)) {
                foundGroup.options.push(
                  createObject(McsOption, { text: server.name, value: serverBackupDetails })
                );
                return;
              }
              serverGroups.push(
                new McsOptionGroup(platformName,
                  createObject(McsOption, { text: server.name, value: serverBackupDetails })
                )
              );
            });
            return serverGroups;
          })
        );
      })
    );
  }

  private _createServerBackupDetails(
    server: McsServer,
    backups: McsServerBackupVm[]
  ): McsEntityProvision<McsServer> {
    let serverBackupDetails = new McsEntityProvision<McsServer>();
    serverBackupDetails.entity = server;

    // Return immediately when server has been found
    let serverHidsFound = backups && backups.find((backup) => backup.serverServiceId === server.serviceId);
    if (serverHidsFound) {
      serverBackupDetails.disabled = true;
      serverBackupDetails.provisioned = true;
      return serverBackupDetails;
    }

    let serverProvisionMessage = this._backupProvisionMessageBitMap.get(server.provisionStatusBit);
    if (isNullOrEmpty(serverProvisionMessage)) { return serverBackupDetails; }

    serverBackupDetails.message = serverProvisionMessage;
    serverBackupDetails.disabled = true;
    serverBackupDetails.provisioned = false;
    return serverBackupDetails;
  }

  private _subscribeToAggregationTargets(): void {
    this.aggregationTargets$ = this._apiService.getBackupAggregationTargets().pipe(
      map((response) => response && response.collection)
    );
  }
}
