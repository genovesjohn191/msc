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
  InviewLevel
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

  public fgBat: FormGroup;
  public fcRetention: FormControl;
  public fcInview: FormControl;
  public fcDailyQuota: FormControl;

  @ViewChild(McsFormGroupDirective, { static: false })
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
    super(_injector, _batService);
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

    // TODO: Check on what reference object to put here to make the bat busy
    let workflow = new McsOrderWorkflow();
    workflow.state = submitDetails.workflowAction;
    workflow.clientReferenceObject = {
      resourceDescription: this.progressDescription,
      // serverId: selectedServerId
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
    this.fcRetention = new FormControl('', [CoreValidators.required]);
    this.fcInview = new FormControl('', [CoreValidators.required]);
    this.fcDailyQuota = new FormControl('', [
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
    // TODO: Confirm the payload of the backup aggregation target and populate the
    // object using form values

    this._batService.createOrUpdateOrder(
      createObject(McsOrderCreate, {
        items: [
          createObject(McsOrderItemCreate, {
            itemOrderType: OrderIdType.CreateAddOnServerBackup,
            referenceId: ADD_BAT,
            // parentServiceId: server.serviceId,
            // properties: this._serverBackup
          })
        ]
      })
    );
  }

  /**
   * Initialize all the options for retention
   */
  private _subscribeToRetentionOptions(): void {
    this.retentionOptions$ = of([
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
