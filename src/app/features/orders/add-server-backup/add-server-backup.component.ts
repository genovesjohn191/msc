import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  Injector,
  OnInit
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder
} from '@angular/forms';
import {
  Observable,
  Subject,
  zip
} from 'rxjs';
import {
  takeUntil,
  map,
  filter,
  tap,
  switchMap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester,
  IMcsFormGroup
} from '@app/core';
import {
  McsOrderWorkflow,
  McsOrderCreate,
  McsOption,
  McsOrderItemCreate,
  OrderIdType,
  McsOptionGroup,
  McsOrderServerBackupAdd,
  McsBackUpAggregationTarget,
  ServerProvisionState,
  McsEntityProvision,
  McsServer,
  McsServerBackupServer
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  Guid,
  getSafeProperty,
  CommonDefinition,
  createObject,
  getSafeFormValue
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';
import { AddServerBackupService } from './add-server-backup.service';

const ADD_SERVER_BACKUP = Guid.newGuid().toString();

@Component({
  selector: 'mcs-order-add-server-backup',
  templateUrl: 'add-server-backup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddServerBackupService]
})

export class AddServerBackupComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public serverGroups$: Observable<McsOptionGroup[]>;
  public aggregationTargets$: Observable<McsBackUpAggregationTarget[]>;

  public fgServerBackup: FormGroup;
  public fcServers: FormControl;

  private _serverBackup: McsOrderServerBackupAdd;
  private _valueChangesSubject = new Subject<void>();
  private _backupProvisionMessageBitMap = new Map<number, string>();

  @ViewChild('fgManageBackupServer', { static: false })
  public set fgManageBackupServer(value: IMcsFormGroup) {
    if (isNullOrEmpty(value)) { return; }

    let isRegistered = this.fgServerBackup.contains('fgManageBackupServer');
    if (isRegistered) { return; }
    this.fgServerBackup.addControl('fgManageBackupServer',
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
    private _serverBackupService: AddServerBackupService,
    private _apiService: McsApiService,
  ) {
    super(
      _injector,
      _serverBackupService,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'add-server-backup-goto-provisioning-step',
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

  public onChangeServerBackUpDetails(serverBackUpDetails: McsOrderServerBackupAdd): void {
    this._serverBackup = serverBackUpDetails;
  }

  public onServerBackupOrderChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }

    this._serverBackupService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._serverBackupService.submitOrderRequest();
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

    this.fgServerBackup = this._formBuilder.group({
      fcServers: this.fcServers
    });
  }

  private _registerProvisionStateBitmap(): void {
    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.PoweredOff,
      this._translate.instant('orderAddServerBackup.detailsStep.serverDisabled', {
        server_issue: this._translate.instant('orderAddServerBackup.detailsStep.serverPoweredOff')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.ServiceAvailableFalse,
      this._translate.instant('orderAddServerBackup.detailsStep.serverDisabled', {
        server_issue: this._translate.instant('orderAddServerBackup.detailsStep.serverChangeAvailableFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.OsAutomationFalse,
      this._translate.instant('orderAddServerBackup.detailsStep.serverDisabled', {
        server_issue: this._translate.instant('orderAddServerBackup.detailsStep.serverOsAutomationFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.PoweredOff | ServerProvisionState.OsAutomationFalse,
      this._translate.instant('orderAddServerBackup.detailsStep.serverDisabled', {
        server_issue: `
          ${this._translate.instant('orderAddServerBackup.detailsStep.serverPoweredOff')} and
          ${this._translate.instant('orderAddServerBackup.detailsStep.serverOsAutomationFalse')}
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
      tap(() => this._onServerBackupChange())
    ).subscribe();
  }

  private _onServerBackupChange(): void {
    let server = getSafeFormValue(this.fcServers, (obj) => obj.value);

    this._serverBackupService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.AddServerBackup,
            referenceId: ADD_SERVER_BACKUP,
            parentServiceId: server.serviceId,
            properties: this._serverBackup
          })
        ]
      })
    );
  }

  private _subscribeToServers(): void {
    this.serverGroups$ = this._apiService.getServerBackupServers().pipe(
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
    backups: McsServerBackupServer[]
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
