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
  OnChanges,
  SimpleChanges,
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
  BehaviorSubject,
  Observable,
  of,
  zip
} from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty,
  createObject,
  buildCron,
  getSafeFormValue
} from '@app/utilities';
import {
  CoreValidators,
  IMcsDataChange,
  IMcsFormGroup
} from '@app/core';
import {
  McsOption,
  InviewLevel,
  McsBackUpAggregationTarget,
  inviewLevelText,
  McsOrderServerBackupAdd
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import {
  scheduleBackupOptionText,
  ScheduleBackupOption
} from '@app/models/enumerations/schedule-backup-options.enum';

const DEFAULT_QUOTA_MIN = 1;
const DEFAULT_QUOTA_MAX = 5120;
const DEFAULT_QUOTA_STEP = 1;
const DEFAULT_RETENTION = '30';

@Component({
  selector: 'mcs-server-manage-backup',
  templateUrl: './server-manage-backup.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'server-manage-backup-wrapper'
  }
})

export class ServerManageBackupComponent implements
  OnInit, OnChanges, OnDestroy, IMcsDataChange<McsOrderServerBackupAdd>, IMcsFormGroup {

  public aggregationTargetOptions$: Observable<McsOption[]>;
  public retentionOptions$: Observable<McsOption[]>;
  public inviewLevelOptions$: Observable<McsOption[]>;
  public scheduleBackupOptions$: Observable<McsOption[]>;

  public fgBackUp: FormGroup<any>;
  public fcAggregation: FormControl<any>;
  public fcRetention: FormControl<any>;
  public fcInview: FormControl<any>;
  public fcBackupSchedule: FormControl<any>;
  public fcDailyQuota: FormControl<any>;

  @Output()
  public dataChange = new EventEmitter<McsOrderServerBackupAdd>();

  @Input()
  public aggregationTargets: McsBackUpAggregationTarget[];

  @Input()
  public storageSize: number;

  @ViewChild(McsFormGroupDirective)
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

    this._setDailyQuotaDefaultValue();
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
  public isAggregationTargetsEmpty(options: any[]): boolean {
    return getSafeProperty(options, (obj) => obj.length <= 0, true);
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    if (!this.isValid()) { return; }

    this.dataChange.emit(createObject(McsOrderServerBackupAdd, {
      backupAggregationTarget: this.fcAggregation.value || null,
      dailySchedule: buildCron({ minute: '0', hour: this.fcBackupSchedule.value }),
      retentionPeriodDays: getSafeFormValue(this.fcRetention, (obj) => obj.value),
      inviewLevel: getSafeFormValue(this.fcInview, (obj) => obj.value, InviewLevel.Premium),
      dailyBackupQuotaGB: getSafeFormValue(this.fcDailyQuota, (obj) => obj.value)
    }));
  }

  private _setDailyQuotaDefaultValue(): void {
    if (!this.fcDailyQuota.touched) {
      let defaultValue = !isNullOrEmpty(this.storageSize) ? this.storageSize : null;
      this.fcDailyQuota.setValue(defaultValue);
    }
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
    this.fcAggregation = new FormControl<any>(null, []);
    this.fcRetention = new FormControl<any>(DEFAULT_RETENTION, [CoreValidators.required]);
    this.fcInview = new FormControl<any>(InviewLevel.Premium, [CoreValidators.required]);
    this.fcBackupSchedule = new FormControl<any>('', [CoreValidators.required]);
    this.fcDailyQuota = new FormControl<any>('', [
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
      fcRetention: this.fcRetention,
      fcInview: this.fcInview,
      fcBackupSchedule: this.fcBackupSchedule,
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
        text: this._translate.instant('serverShared.addOnBackup.serverAggregation.optionLabel',
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
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Standard], value: InviewLevel.Standard }),
      createObject(McsOption, { text: inviewLevelText[InviewLevel.Premium], value: InviewLevel.Premium })
    ]);
  }

  /**
   * Initialize all the options for schedule backup
   */
  private _subscribeToScheduleBackupOptions(): void {
    this.scheduleBackupOptions$ = of([
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.EigthPM], value: ScheduleBackupOption.EigthPM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.NinePM], value: ScheduleBackupOption.NinePM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.TenPM], value: ScheduleBackupOption.TenPM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.ElevenPM], value: ScheduleBackupOption.ElevenPM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.TwelveAM], value: ScheduleBackupOption.TwelveAM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.OneAM], value: ScheduleBackupOption.OneAM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.TwoAM], value: ScheduleBackupOption.TwoAM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.ThreeAM], value: ScheduleBackupOption.ThreeAM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.FourAM], value: ScheduleBackupOption.FourAM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.FiveAM], value: ScheduleBackupOption.FiveAM }),
      createObject(McsOption, { text: scheduleBackupOptionText[ScheduleBackupOption.SixAM], value: ScheduleBackupOption.SixAM }),
    ]);
  }
}
