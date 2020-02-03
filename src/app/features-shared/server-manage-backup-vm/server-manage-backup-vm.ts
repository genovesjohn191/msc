import {
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  SimpleChanges,
  OnChanges,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder
} from '@angular/forms';
import {
  takeUntil,
  tap,
  distinctUntilChanged,
  filter
} from 'rxjs/operators';
import {
  Subject,
  Observable,
  of,
  BehaviorSubject,
  zip
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  buildCron
} from '@app/utilities';
import {
  CoreValidators,
  IMcsDataChange,
  IMcsFormGroup
} from '@app/core';
import {
  McsServerCreateAddOnVmBackup,
  McsOption,
  InviewLevel,
  McsStorageBackUpAggregationTarget,
  inviewLevelText
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';

const DEFAULT_QUOTA_MAX = 5120;
const DEFAULT_QUOTA_MIN = 1;
const DEFAULT_QUOTA_STEP = 1;
const DEFAULT_RETENTION = '30';

@Component({
  selector: 'mcs-server-manage-backup-vm',
  templateUrl: './server-manage-backup-vm.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'server-manage-backup-vm-wrapper'
  }
})

export class ServerManageBackupVmComponent implements
  OnInit, OnChanges, OnDestroy, IMcsDataChange<McsServerCreateAddOnVmBackup>, IMcsFormGroup {

  public aggregationTargetOptions$: Observable<McsOption[]>;
  public retentionOptions$: Observable<McsOption[]>;
  public inviewLevelOptions$: Observable<McsOption[]>;
  public scheduleBackupOptions$: Observable<McsOption[]>;

  public fgBackUp: FormGroup;
  public fcAggregation: FormControl;
  public fcRetention: FormControl;
  public fcInview: FormControl;
  public fcBackupSchedule: FormControl;
  public fcDailyQuota: FormControl;

  @Output()
  public dataChange = new EventEmitter<McsServerCreateAddOnVmBackup>();

  @Input()
  public aggregationTargets: McsStorageBackUpAggregationTarget[];

  @ViewChild(McsFormGroupDirective, { static: false })
  public set formGroup(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;

  private _aggregationTargetsChange = new BehaviorSubject<McsOption[]>([]);
  private _valueChangesSubject = new Subject<void>();

  public constructor(
    private _translate: TranslateService,
    private _formBuilder: FormBuilder,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this._registerFormGroup();
  }

  public ngOnInit(): void {
    this._subscribeToAggregationTargetOptions();
    this._subscribeToRetentionOptions();
    this._subscribeToInviewOptions();
    this._subscribeToScheduleBackupOptions();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let aggregationTargets = changes['aggregationTargets'];
    if (!isNullOrEmpty(aggregationTargets)) {
      this._createAggregationTargetOptions();
    }
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._valueChangesSubject);
  }

  public get dailyQuotaMin(): number {
    return DEFAULT_QUOTA_MIN;
  }

  public get dailyQuotaMax(): number {
    return DEFAULT_QUOTA_MAX;
  }

  public get stepQuota(): number {
    return DEFAULT_QUOTA_STEP;
  }

  public get hasAggregation(): boolean {
    return getSafeProperty(this.fcAggregation, (obj) => obj.value) ? true : false;
  }

  public get isAggregationInviewPremium(): boolean {
    return getSafeProperty(this.fcAggregation, (obj) => obj.value.inviewLevel) === InviewLevel.Premium;
  }

  /**
   * Returns true when the form group is valid
   */
  public isValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  /**
   * Returns the form group object
   */
  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Returns true when the aggregation target list is less than or equal to zero
   */
  public isAggregationTargetsEmpty(aggregationTargets: McsStorageBackUpAggregationTarget[]): boolean {
    return getSafeProperty(aggregationTargets, (obj) => obj.length <= 0, true);
  }

  /**
   * Returns true when the inview level is Premium
   */
  public isInviewLevelPremium(aggregationTarget: McsStorageBackUpAggregationTarget): boolean {
    return InviewLevel.Premium === getSafeProperty(aggregationTarget, (obj) => obj.inviewLevel);
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    if (!this.isValid()) { return; }
    let backupDetils = new McsServerCreateAddOnVmBackup();
    backupDetils.backupAggregationTarget = this.fcAggregation.value || null;
    backupDetils.dailySchedule = buildCron({ minute: '0', hour: this.fcBackupSchedule.value });
    backupDetils.retentionPeriodDays = this.fcRetention.enabled ? this.fcRetention.value || null : null;
    backupDetils.inviewLevel = this.fcInview.enabled ? this.fcInview.value || null : inviewLevelText[InviewLevel.Premium];
    backupDetils.dailyBackupQuotaGB = this.fcDailyQuota.enabled ? this.fcDailyQuota.value || null : null;

    this.dataChange.emit(backupDetils);
  }

  /**
   * Returns the collection of aggregation target option as an observable.
   */
  private _subscribeToAggregationTargetOptions(): void {
    this.aggregationTargetOptions$ = this._aggregationTargetsChange.asObservable().pipe(
      distinctUntilChanged()
    );
  }

  /**
   * Subscribe to the form changes
   */
  private _subscribeToValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges()
    ).pipe(
      takeUntil(this._valueChangesSubject),
      filter(() => this.isValid()),
      tap(() => this.notifyDataChange())
    ).subscribe();
  }

  /**
   * Registers all form group
   */
  private _registerFormGroup(): void {
    // Register Form Groups using binding
    this.fcAggregation = new FormControl(null, []);
    this.fcRetention = new FormControl(DEFAULT_RETENTION, [CoreValidators.required]);
    this.fcInview = new FormControl(inviewLevelText[InviewLevel.Premium], [CoreValidators.required]);
    this.fcBackupSchedule = new FormControl('', [CoreValidators.required]);
    this.fcDailyQuota = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.dailyQuotaMin)(control),
      (control) => CoreValidators.max(this.dailyQuotaMax)(control),
      (control) => CoreValidators.custom(this._quotaIsValid.bind(this), 'valid')(control)
    ]);

    this.fcAggregation.valueChanges.pipe(
      tap((value) => {
        if (isNullOrEmpty(value)) {
          this.fcRetention.enable();
          this.fcDailyQuota.enable();
          this.fcInview.enable();
        } else {
          this.fcRetention.disable();
          this.fcDailyQuota.disable();

          if (value.inviewLevel === InviewLevel.Premium) {
            this.fcInview.disable();
          }
        }
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();

    this.fgBackUp = this._formBuilder.group({
      fcAggregation: this.fcBackupSchedule,
      fcBackupSchedule: this.fcBackupSchedule,
      fcRetention: this.fcRetention,
      fcInview: this.fcInview,
      fcDailyQuota: this.fcDailyQuota
    });
  }

  /**
   * Returns true if the value is a valid quota
   * @param inputValue Value to be checked
   */
  private _quotaIsValid(inputValue: any): boolean {
    return inputValue % DEFAULT_QUOTA_STEP === 0;
  }

  /**
   * Initialize all the options for aggregation target
   */
  private _createAggregationTargetOptions(): void {

    if (this.isAggregationTargetsEmpty(this.aggregationTargets)) {
      this.fcAggregation.disable();
      return;
    }

    this.fcAggregation.enable();
    let aggregationOptions: McsOption[] = [];
    aggregationOptions.push(createObject(McsOption, {
      text: 'None',
      value: null
    }));

    aggregationOptions.push(...this.aggregationTargets.map((aggregationTarget) =>
      createObject(McsOption, {
        text: this._translate.instant('serverShared.addOnBackup.vmAggregation.optionLabel',
          { retention: `${aggregationTarget.serviceId} ${aggregationTarget.retentionPeriod || 0}` }),
        value: aggregationTarget.serviceId
      }))
    );
    this._aggregationTargetsChange.next(aggregationOptions);
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
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Standard], value: inviewLevelText[InviewLevel.Standard] }),
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Premium], value: inviewLevelText[InviewLevel.Premium] })
    ]);
  }

  /**
   * Initialize all the options for schedule backup
   */
  private _subscribeToScheduleBackupOptions(): void {
    this.scheduleBackupOptions$ = of([
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
