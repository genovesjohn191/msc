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
  zip,
  of
} from 'rxjs';
import {
  takeUntil,
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
  McsOrderItemCreate,
  OrderIdType,
  inviewLevelText,
  InviewLevel,
  McsOrderBackupAggregationTargetAdd
} from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  Guid,
  getSafeProperty,
  CommonDefinition,
  createObject
} from '@app/utilities';
import { McsFormGroupDirective } from '@app/shared';
import { OrderDetails } from '@app/features-shared';
import { AddBatService } from './add-bat.service';
import {
  retentionOptionText,
  RetentionOption
} from '@app/models/enumerations/retention-option.enum';

const DEFAULT_QUOTA_MIN = 1;
const DEFAULT_QUOTA_MAX = 5120;
const ADD_BAT = Guid.newGuid().toString();

@Component({
  selector: 'mcs-order-add-bat',
  templateUrl: 'add-bat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AddBatService]
})

export class AddBatComponent extends McsOrderWizardBase implements OnInit, OnDestroy {

  public retentionOptions$: Observable<McsOption[]>;
  public inviewLevelOptions$: Observable<McsOption[]>;

  public fgBat: FormGroup<any>;
  public fcRetention: FormControl<number>;
  public fcInview: FormControl<any>;
  public fcDailyQuota: FormControl<number>;

  @ViewChild(McsFormGroupDirective)
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;
  private _formGroupSubject = new Subject<void>();

  constructor(
    _injector: Injector,
    private _formBuilder: FormBuilder,
    private _batService: AddBatService
  ) {
    super(
      _batService,
      _injector,
      {
        billingDetailsStep: {
          category: 'order',
          label: 'add-bat-goto-provisioning-step',
          action: 'next-button'
        }
      });
    this._registerFormGroup();
  }

  public ngOnInit() {
    this._subscribeToInviewOptions();
    this._subscribeToRetentionOptions();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._formGroupSubject);
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

  public onSubmitOrder(submitDetails: OrderDetails): void {
    if (isNullOrEmpty(submitDetails)) { return; }

    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription
    };
    this.submitOrderWorkflow(workflow);
  }

  public onOrderDetailsChange(orderDetails: OrderDetails): void {
    if (isNullOrEmpty(orderDetails)) { return; }

    this._batService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        contractDurationMonths: orderDetails.contractDurationMonths,
        description: orderDetails.description,
        billingEntityId: orderDetails.billingEntityId,
        billingSiteId: orderDetails.billingSiteId,
        billingCostCentreId: orderDetails.billingCostCentreId
      }),
      OrderRequester.Billing
    );
    this._batService.submitOrderRequest();
  }

  private _registerFormGroup(): void {
    this.fcRetention = new FormControl<number>(30, [CoreValidators.required]); // Default value is 30 days, refer for the values below
    this.fcInview = new FormControl<any>(InviewLevel.Premium, [CoreValidators.required]); // Default value Premium
    this.fcDailyQuota = new FormControl<number>(null, [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.dailyQuotaMin)(control),
      (control) => CoreValidators.max(this.dailyQuotaMax)(control)
    ]);

    this.fgBat = this._formBuilder.group({
      fcRetention: this.fcRetention,
      fcInview: this.fcInview,
      fcDailyQuota: this.fcDailyQuota
    });
  }

  private _subscribeToValueChanges(): void {
    this._formGroupSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._formGroupSubject),
      filter(() => this.formIsValid),
      tap(() => this._onBatDetailsChange())
    ).subscribe();
  }

  private _onBatDetailsChange(): void {
    this._batService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.AddBat,
            referenceId: ADD_BAT,
            properties: createObject(McsOrderBackupAggregationTargetAdd, {
              dailyBackupQuotaGB: +this.fcDailyQuota.value,
              retentionPeriodDays: this.fcRetention.value,
              inviewLevel: this.fcInview.value
            })
          })
        ]
      })
    );
  }

  /**
   * Initialize all the options for retention
   */
  private _subscribeToRetentionOptions(): void {
    // TODO: make a enum or constant for these options, duplicate code in VM and Server Backup, create common source data
    this.retentionOptions$ = of([
      createObject(McsOption, { text: retentionOptionText[RetentionOption.FourteenDays], value: RetentionOption.FourteenDays }),
      createObject(McsOption, { text: retentionOptionText[RetentionOption.ThirtyDays], value:  RetentionOption.ThirtyDays }),
      createObject(McsOption, { text: retentionOptionText[RetentionOption.SixMonths], value:  RetentionOption.SixMonths }),
      createObject(McsOption, { text: retentionOptionText[RetentionOption.OneYear], value:  RetentionOption.OneYear }),
      createObject(McsOption, { text: retentionOptionText[RetentionOption.TwoYears], value:  RetentionOption.TwoYears }),
      createObject(McsOption, { text: retentionOptionText[RetentionOption.ThreeYears], value:  RetentionOption.ThreeYears }),
      createObject(McsOption, { text: retentionOptionText[RetentionOption.FourYears], value:  RetentionOption.FourYears }),
      createObject(McsOption, { text: retentionOptionText[RetentionOption.FiveYears], value:  RetentionOption.FiveYears }),
      createObject(McsOption, { text: retentionOptionText[RetentionOption.SixYears], value:  RetentionOption.SixYears }),
      createObject(McsOption, { text: retentionOptionText[RetentionOption.SevenYears], value:  RetentionOption.SevenYears }),
    ]);
  }

  /**
   * Initialize all the options for inview
   */
  private _subscribeToInviewOptions(): void {
    this.inviewLevelOptions$ = of([
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Standard], value: InviewLevel.Standard }),
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Premium], value: InviewLevel.Premium })
    ]);
  }
}
