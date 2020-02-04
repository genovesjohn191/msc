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
  tap
} from 'rxjs/operators';
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
  McsStorageBackUpAggregationTarget
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
  public aggregationTargets$: Observable<McsStorageBackUpAggregationTarget[]>;

  public fgServerBackup: FormGroup;
  public fcServers: FormControl;

  private _serverBackup: McsOrderServerBackupAdd;
  private _valueChangesSubject = new Subject<void>();

  @ViewChild('fgManageBackupServer', { static: false })
  private _fgManageBackupServer: IMcsFormGroup;

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
    private _serverBackupService: AddServerBackupService,
    private _apiService: McsApiService,
  ) {
    super(_injector, _serverBackupService);
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
    return getSafeProperty(this._formGroup, (obj) => obj.isValid()) && getSafeProperty(this._fgManageBackupServer, (obj) => obj.isValid());
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

    if (!isNullOrEmpty(this._fgManageBackupServer)) {
      this.fgServerBackup.addControl('fgManageBackupServer',
        this._fgManageBackupServer.getFormGroup().formGroup);
    }

    this.fgServerBackup = this._formBuilder.group({
      fcServers: this.fcServers
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
      tap(() => this._onServerBackupChange())
    ).subscribe();
  }

  private _onServerBackupChange(): void {
    let server = getSafeFormValue(this.fcServers, (obj) => obj.value);

    this._serverBackupService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.CreateAddOnServerBackup,
            referenceId: ADD_SERVER_BACKUP,
            parentServiceId: server.serviceId,
            properties: this._serverBackup
          })
        ]
      })
    );
  }

  private _subscribeToServers(): void {
    // TODO: map server backup provisioned with server list, call endpoint
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
