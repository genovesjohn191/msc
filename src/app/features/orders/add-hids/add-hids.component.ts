import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  Injector,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl
} from '@angular/forms';
import {
  takeUntil,
  map,
  filter,
  tap,
  switchMap
} from 'rxjs/operators';
import {
  Observable,
  Subject,
  zip
} from 'rxjs';
import {
  McsOrderWizardBase,
  CoreValidators,
  OrderRequester
} from '@app/core';
import {
  McsServer,
  McsOrderWorkflow,
  McsOrderCreate,
  McsOption,
  HidsProtectionLevel,
  hidsProtectionLevelText,
  McsOrderItemCreate,
  OrderIdType,
  McsOrderServerHidsAdd,
  McsOptionGroup,
  McsEntityProvision,
  ServerProvisionState,
  McsServerHostSecurityHids,
  McsPermission
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { McsApiService } from '@app/services';
import {
  unsubscribeSafely,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  Guid
} from '@app/utilities';
import { OrderDetails } from '@app/features-shared';
import { AddHidsService } from './add-hids.service';

interface HidsServers {
  provisioned: boolean;
  server: McsServer;
}

const SERVER_ADD_HIDS_REF_ID = Guid.newGuid().toString();
@Component({
  selector: 'mcs-add-hids',
  templateUrl: 'add-hids.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddHidsService]
})

export class AddHidsComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public serverGroups$: Observable<McsOptionGroup[]>;

  public fgAddHidsDetails: FormGroup;
  public fcServer: FormControl;
  public fcProtectionLevel: FormControl;
  public protectionLevelOptions: McsOption[] = [];

  @ViewChild(McsFormGroupDirective, { static: false })
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;

  private _valueChangesSubject = new Subject<void>();
  private _backupProvisionMessageBitMap = new Map<number, string>();

  constructor(
    _injector: Injector,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _addHidsService: AddHidsService
  ) {
    super(
      _injector,
      _addHidsService,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'add-hids-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroups();
    this._registerProvisionStateBitmap();
  }

  public ngOnInit() {
    this._initializeProtectionLevelOptions();
    this._subscribeToManagedCloudServers();
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

  public get hasHidsPermission(): boolean {
    return getSafeProperty(this.accessControlService, (obj) => obj.hasPermission([McsPermission.HidsView]), false);
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

        return this._apiService.getServers().pipe(
          map((serversCollection) => {
            let serverGroups: McsOptionGroup[] = [];
            let hids = getSafeProperty(hidsCollection, (obj) => obj.collection) || [];
            let servers = getSafeProperty(serversCollection, (obj) => obj.collection) || [];

            servers.forEach((server) => {
              if (!server.canProvision) { return; }

              let platformName = getSafeProperty(server, (obj) => obj.platform.resourceName) || 'Others';
              let foundGroup = serverGroups.find((serverGroup) => serverGroup.groupName === platformName);
              let serverBackupDetails = this._createServerBackupDetails(server, hids);

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
    hids: McsServerHostSecurityHids[]
  ): McsEntityProvision<McsServer> {
    let serverBackupDetails = new McsEntityProvision<McsServer>();
    serverBackupDetails.entity = server;

    // Return immediately when server has been found
    let serverHidsFound = hids && hids.find((hid) => hid.serverId === server.id);
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

  private _initializeProtectionLevelOptions(): void {
    this.protectionLevelOptions.push(new McsOption(HidsProtectionLevel.Protect, hidsProtectionLevelText[HidsProtectionLevel.Protect]));
    this.protectionLevelOptions.push(new McsOption(HidsProtectionLevel.Detect, hidsProtectionLevelText[HidsProtectionLevel.Detect]));
  }

  private _registerFormGroups() {
    this.fcServer = new FormControl('', [CoreValidators.required]);
    this.fcProtectionLevel = new FormControl(HidsProtectionLevel.Detect, [CoreValidators.required]);

    this.fgAddHidsDetails = this._formBuilder.group({
      fcServer: this.fcServer,
      fcProtectionLevel: this.fcProtectionLevel,
    });
  }

  private _registerProvisionStateBitmap(): void {
    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.PoweredOff,
      this.translateService.instant('orderAddHids.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddHids.details.server.serverPoweredOff')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.ServiceAvailableFalse,
      this.translateService.instant('orderAddHids.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddHids.details.server.serverChangeAvailableFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.OsAutomationFalse,
      this.translateService.instant('orderAddHids.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddHids.details.server.serverOsAutomationFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.PoweredOff | ServerProvisionState.OsAutomationFalse,
      this.translateService.instant('orderAddHids.details.server.serverDisabled', {
        server_issue: `
          ${this.translateService.instant('orderAddHids.details.server.serverPoweredOff')} and
          ${this.translateService.instant('orderAddHids.details.server.serverOsAutomationFalse')}
        `
      })
    );
  }
}
