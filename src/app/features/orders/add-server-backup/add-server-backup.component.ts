import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
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
  of,
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
  OrderRequester
} from '@app/core';
import {
  McsOrderWorkflow,
  McsOrderCreate,
  McsOption,
  InviewLevel,
  inviewLevelText,
  McsOrderItemCreate,
  OrderIdType,
  McsOptionGroup,
  McsOrderServerBackupAdd
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  animateFactory,
  getSafeProperty,
  CommonDefinition,
  createObject,
  Guid,
  buildCron
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';

import { AddServerBackupService } from './add-server-backup.service';

const DEFAULT_QUOTA_MIN = 1;
const DEFAULT_QUOTA_MAX = 5120;
const ADD_SERVER_BACKUP = Guid.newGuid().toString();

@Component({
  selector: 'mcs-order-add-server-backup',
  templateUrl: 'add-server-backup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddServerBackupService],
  animations: [
    animateFactory.fadeIn
  ],
})

export class AddServerBackupComponent extends McsOrderWizardBase implements OnInit, OnDestroy {
  public serverGroups$: Observable<McsOptionGroup[]>;
  public aggregations$: Observable<McsOption[]>;
  public aggregationsTemp$: Observable<McsOption[]>;

  public retentionList$: Observable<McsOption[]>;
  public inviewLevels$: Observable<McsOption[]>;
  public backupList$: Observable<McsOption[]>;

  public fgServerBackup: FormGroup;
  public fcServers: FormControl;
  public fcAggregation: FormControl;
  public fcRetentionList: FormControl;
  public fcInviewLevel: FormControl;
  public fcBackupList: FormControl;
  public fcDailyQuota: FormControl;

  private _destroySubject = new Subject<void>();
  private _valueChangesSubject = new Subject<void>();

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
    private _changeDetectorRef: ChangeDetectorRef,
    private _apiService: McsApiService,
  ) {
    super(_injector, _serverBackupService);
    this._registerFormGroup();
  }

  public ngOnInit() {
    this._subscribeToServers();
    this._subscribeToAggregationTargets();
    this._subscribeToBackupDays();
    this._subscribeToInviewLevels();
    this._subscribeToBackupTimes();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
    unsubscribeSafely(this._valueChangesSubject);
  }

  public get backIconKey(): string {
    return CommonDefinition.ASSETS_SVG_CHEVRON_LEFT;
  }

  public get formIsValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  public get dailyQuotaMin(): number {
    return DEFAULT_QUOTA_MIN;
  }

  public get dailyQuotaMax(): number {
    return DEFAULT_QUOTA_MAX;
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
    this.fcAggregation = new FormControl('', [CoreValidators.required]);
    this.fcRetentionList = new FormControl('', [CoreValidators.required]);
    this.fcInviewLevel = new FormControl('', [CoreValidators.required]);
    this.fcBackupList = new FormControl('', [CoreValidators.required]);
    this.fcDailyQuota = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      CoreValidators.min(this.dailyQuotaMin),
      CoreValidators.max(this.dailyQuotaMax)
    ]);

    this.fgServerBackup = this._formBuilder.group({
      fcServers: this.fcServers,
      fcAggregation: this.fcAggregation,
      fcRetentionList: this.fcRetentionList,
      fcInviewLevel: this.fcInviewLevel,
      fcBackupList: this.fcBackupList,
      fcDailyQuota: this.fcDailyQuota
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
    let server = getSafeProperty(this.fcServers, (obj) => obj.value);
    let aggregationTarget = getSafeProperty(this.fcAggregation, (obj) => obj.value.serviceId);
    let retention = getSafeProperty(this.fcRetentionList, (obj) => obj.value);
    let inview = getSafeProperty(this.fcInviewLevel, (obj) => obj.value);
    let backupSchedule = getSafeProperty(this.fcBackupList, (obj) => obj.value);
    let dailyQuota = getSafeProperty(this.fcDailyQuota, (obj) => obj.value);

    this._serverBackupService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.CreateAddOnServerBackup,
            referenceId: ADD_SERVER_BACKUP,
            serviceId: server.serviceId,
            properties: createObject(McsOrderServerBackupAdd, {
              backupAggregationTarget: aggregationTarget,
              retentionPeriodDays: retention,
              inviewLevel: inview,
              dailySchedule: buildCron({ minute: '0', hour: backupSchedule }),
              dailyBackupQuotaGB: dailyQuota,
            })
          })
        ]
      })
    );
  }

  private _subscribeToServers(): void {
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
    this.aggregations$ = this._apiService.getStorageBackupAggregationTargets().pipe(
      map((response) =>
        response && response.collection.map((aggregationTarget) =>
          createObject(McsOption, { text: aggregationTarget.description, value: aggregationTarget })
        )
      )
    );
  }

  private _subscribeToBackupDays(): void {
    this.retentionList$ = of([
      createObject(McsOption, { text: '14 Days', value: '14' }),
      createObject(McsOption, { text: '30 Days', value: '30' }),
      createObject(McsOption, { text: '6 Months', value: '180' }),
      createObject(McsOption, { text: '1 Year', value: '365' }),
      createObject(McsOption, { text: '2 Years', value: '730' }),
      createObject(McsOption, { text: '3 Years', value: '1095' }),
      createObject(McsOption, { text: '4 Years', value: '1460' }),
      createObject(McsOption, { text: '5 Years', value: '1825' }),
      createObject(McsOption, { text: '6 Years', value: '2190' }),
      createObject(McsOption, { text: '7 Years', value: '2555' })
    ]);
  }

  private _subscribeToInviewLevels(): void {
    this.inviewLevels$ = of([
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Standard], value: InviewLevel.Standard }),
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Premium], value: InviewLevel.Premium })
    ]);
  }

  private _subscribeToBackupTimes(): void {
    this.backupList$ = of([
      createObject(McsOption, { text: '8 PM', value: '20' }),
      createObject(McsOption, { text: '9 PM', value: '21' }),
      createObject(McsOption, { text: '10 PM', value: '22' }),
      createObject(McsOption, { text: '11 PM', value: '23' }),
      createObject(McsOption, { text: '12 AM', value: '0' }),
      createObject(McsOption, { text: '1 AM', value: '1' }),
      createObject(McsOption, { text: '2 AM', value: '2' }),
      createObject(McsOption, { text: '3 AM', value: '3' }),
      createObject(McsOption, { text: '4 AM', value: '4' }),
      createObject(McsOption, { text: '5 AM', value: '5' }),
      createObject(McsOption, { text: '6 AM', value: '6' })
    ]);
  }
}
