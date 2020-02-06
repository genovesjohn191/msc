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
  map
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
  McsStorageBackUpAggregationTarget,
  McsOrderVmBackupAdd
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  Guid,
  CommonDefinition,
  getSafeProperty,
  createObject
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';
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
  public aggregationTargets$: Observable<McsStorageBackUpAggregationTarget[]>;

  public fgVmBackup: FormGroup;
  public fcServers: FormControl;

  private _vmBackup: McsOrderVmBackupAdd;
  private _valueChangesSubject = new Subject<void>();

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
    private _vmBackupService: AddVmBackupService,
    private _apiService: McsApiService,
  ) {
    super(_injector, _vmBackupService);
    this._registerFormGroup();
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
    let server = getSafeProperty(this.fcServers, (obj) => obj.value);

    this._vmBackupService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.CreateAddOnVmBackup,
            referenceId: ADD_VM_BACKUP,
            parentServiceId: server.serviceId,
            properties: this._vmBackup
          })
        ]
      })
    );
  }

  private _subscribeToServers(): void {
    // TODO: map server vm backup provisioned with server list, call endpoint
    this.serverGroups$ = this._apiService.getServers().pipe(
      map((servers) => {
        let groups: McsOptionGroup[] = [];

        servers.collection.forEach((server) => {
          if (!server.canProvision) { return; }

          let platformName = getSafeProperty(server, (obj) => obj.platform.resourceName) || 'Others';
          let foundGroup = groups.find((serverGroup) => serverGroup.groupName === platformName);

          if (!isNullOrEmpty(foundGroup)) {
            foundGroup.options.push(
              createObject(McsOption, { text: server.name, value: server })
            );
            return;
          }
          groups.push(
            new McsOptionGroup(platformName,
              createObject(McsOption, { text: server.name, value: server })
            )
          );
        });
        return groups;
      })
    );
  }

  private _subscribeToAggregationTargets(): void {
    this.aggregationTargets$ = this._apiService.getStorageBackupAggregationTargets().pipe(
      map((response) => response && response.collection)
    );
  }
}
