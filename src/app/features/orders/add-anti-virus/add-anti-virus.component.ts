import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ViewChild,
  Injector,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl
} from '@angular/forms';
import {
  Observable,
  Subject
} from 'rxjs';
import {
  takeUntil,
  map,
  switchMap
} from 'rxjs/operators';
import {
  McsOrderWizardBase,
  McsFormGroupService,
  CoreValidators,
  OrderRequester
} from '@app/core';
import {
  McsServer,
  McsOrderWorkflow,
  McsOrderCreate,
  McsOrderItemCreate,
  OrderIdType,
  ServerProvisionState,
  McsEntityProvision,
  McsServerHostSecurityAntiVirus,
  McsOptionGroup,
  McsOption,
  McsPermission
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';
import { McsApiService } from '@app/services';
import {
  unsubscribeSafely,
  CommonDefinition,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  Guid
} from '@app/utilities';
import { AddAntiVirusService } from './add-anti-virus.service';

interface AntiVirusServers {
  provisioned: boolean;
  server: McsServer;
}

const SERVER_ADD_ANTI_VIRUS_REF_ID = Guid.newGuid().toString();
@Component({
  selector: 'mcs-add-anti-virus',
  templateUrl: 'add-anti-virus.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddAntiVirusService]
})

export class AddAntiVirusComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public serverGroups$: Observable<McsOptionGroup[]>;

  public fgAddAntiVirusDetails: FormGroup;
  public fcServer: FormControl;

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();
  private _backupProvisionMessageBitMap = new Map<number, string>();

  constructor(
    _injector: Injector,
    private _elementRef: ElementRef,
    private _formBuilder: FormBuilder,
    private _formGroupService: McsFormGroupService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
    private _addAntiVirusService: AddAntiVirusService
  ) {
    super(
      _injector,
      _addAntiVirusService,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'add-antivirus-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroups();
    this._registerProvisionStateBitmap();
  }

  public ngOnInit() {
    this._subscribeToManagedCloudServers();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get hasAvPermission(): boolean {
    return getSafeProperty(this.accessControlService, (obj) => obj.hasPermission([McsPermission.AvView]), false);
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
      serverId: server.id
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
              if (!server.canProvision) { return; }

              let platformName = getSafeProperty(server, (obj) => obj.platform.resourceName) || 'Others';
              let foundGroup = serverGroups.find((serverGroup) => serverGroup.groupName === platformName);
              let serverBackupDetails = this._createServerBackupDetails(server, avList);

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
    avList: McsServerHostSecurityAntiVirus[]
  ): McsEntityProvision<McsServer> {
    let serverBackupDetails = new McsEntityProvision<McsServer>();
    serverBackupDetails.entity = server;

    // Return immediately when server has been found
    let serverHidsFound = avList && avList.find((av) => av.serverId === server.id);
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

  private _validateFormFields(): boolean {
    if (this.formIsValid) { return true; }
    this._touchInvalidFields();
    return false;
  }

  private _touchInvalidFields(): void {
    this._formGroupService.touchAllFormFields(this.fgAddAntiVirusDetails);
    this._formGroupService.scrollToFirstInvalidField(this._elementRef.nativeElement);
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

  private _registerProvisionStateBitmap(): void {
    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.PoweredOff,
      this.translateService.instant('orderAddAntiVirus.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddAntiVirus.details.server.serverPoweredOff')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.ServiceAvailableFalse,
      this.translateService.instant('orderAddAntiVirus.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddAntiVirus.details.server.serverChangeAvailableFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.OsAutomationFalse,
      this.translateService.instant('orderAddAntiVirus.details.server.serverDisabled', {
        server_issue: this.translateService.instant('orderAddAntiVirus.details.server.serverOsAutomationFalse')
      })
    );

    this._backupProvisionMessageBitMap.set(
      ServerProvisionState.PoweredOff | ServerProvisionState.OsAutomationFalse,
      this.translateService.instant('orderAddAntiVirus.details.server.serverDisabled', {
        server_issue: `
          ${this.translateService.instant('orderAddAntiVirus.details.server.serverPoweredOff')} and
          ${this.translateService.instant('orderAddAntiVirus.details.server.serverOsAutomationFalse')}
        `
      })
    );
  }
}
