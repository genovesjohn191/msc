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
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup
} from '@angular/forms';
import {
  takeUntil,
  tap
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
  unsubscribeSafely,
  getSafeProperty,
  isNullOrEmpty
} from '@app/utilities';
import {
  CoreValidators,
  IMcsDataChange,
  IMcsFormGroup
} from '@app/core';
import {
  McsServerCreateAddOnServerBackup,
  McsOption,
  InviewLevel,
  McsStorageBackUpAggregationTarget,
  inviewLevelText
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';

const DEFAULT_MAXIMUM = 5120;
const DEFAULT_MINIMUM = 1;
const QUOTA_STEP = 1;
const DEFAULT_RETENTION = '30';

@Component({
  selector: 'mcs-addon-backup-server',
  templateUrl: './addon-backup-server.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'addon-backup-server-wrapper'
  }
})

export class AddOnBackupServerComponent implements
  OnInit, OnChanges, AfterViewInit, OnDestroy, IMcsDataChange<McsServerCreateAddOnServerBackup>, IMcsFormGroup {

  public fgBackUp: FormGroup;
  public fcAggregation: FormControl;
  public fcRetention: FormControl;
  public fcInview: FormControl;
  public fcBackupSchedule: FormControl;
  public fcDailyQuota: FormControl;

  public retentionOptions: McsOption[] = [];
  public inviewLevelOptions: McsOption[] = [];
  public scheduleBackupOptions: McsOption[] = [];

  @Output()
  public dataChange = new EventEmitter<McsServerCreateAddOnServerBackup>();

  @Input()
  public aggregationTargets: McsStorageBackUpAggregationTarget[];

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();

  public constructor() {
    this._registerFormGroup();
  }

  public ngOnInit(): void {
    this._subscribeToRetentionOptions();
    this._subscribeToInviewOptions();
    this._subscribeToScheduleBackupOptions();
  }

  public ngAfterViewInit(): void {
    this._subscribeToFormChanges();
  }

  public ngOnChanges(changes: SimpleChanges) {
    let aggregationTargets = changes['aggregationTargets'];
    if (!isNullOrEmpty(aggregationTargets)) {
      let hasAggregationTargets = !isNullOrEmpty(this.aggregationTargets) && this.aggregationTargets.length > 0;
      hasAggregationTargets ? this.fgBackUp.setControl('fcAggregation', this.fcAggregation) :
        this.fgBackUp.removeControl('fcAggregation');
    }
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._destroySubject);
  }

  public get minimumQuota(): number {
    return DEFAULT_MINIMUM;
  }

  public get maximumQuota(): number {
    return DEFAULT_MAXIMUM;
  }

  public get stepQuota(): number {
    return QUOTA_STEP;
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
    let backupDetils = new McsServerCreateAddOnServerBackup();
    backupDetils.backupAggregationTarget = this.fcAggregation.value || null;
    backupDetils.dailySchedule = this._convertToCron(this.fcBackupSchedule.value);
    backupDetils.retentionPeriodDays = this.fcRetention.value || null;
    backupDetils.inviewLevel = this.fcInview.value || null;
    backupDetils.dailyBackupQuotaGB = this.fcDailyQuota.value || null;

    this.dataChange.emit(backupDetils);
  }

  /**
   * Registers all form group
   */
  private _registerFormGroup(): void {
    // Register Form Groups using binding
    this.fcAggregation = new FormControl('', [CoreValidators.required]);
    this.fcRetention = new FormControl(DEFAULT_RETENTION, [CoreValidators.required]);
    this.fcInview = new FormControl(InviewLevel.Premium, [CoreValidators.required]);
    this.fcBackupSchedule = new FormControl('', [CoreValidators.required]);
    this.fcDailyQuota = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.minimumQuota)(control),
      (control) => CoreValidators.max(this.maximumQuota)(control),
      (control) => CoreValidators.custom(this._quotaIsValid.bind(this), 'valid')(control)
    ]);

    this.fgBackUp = new FormGroup({
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
    return inputValue % QUOTA_STEP === 0;
  }

  /**
   * Returns a cron string based on a given time
   * TODO: extract and put in a generic cron service
   */
  private _convertToCron(time: string): string {
    return `0 ${time} * * *`;
  }

  /**
   * Subscribe to the form changes
   */
  private _subscribeToFormChanges(): void {
    this._formGroup.valueChanges().pipe(
      takeUntil(this._destroySubject),
      tap(() => this.notifyDataChange())
    ).subscribe();

    this.fcAggregation.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(() => this._removeFormControl())
    ).subscribe();
  }

  /**
   * Remove form controls based on the value of aggregation target
   */
  private _removeFormControl(): void {
    let aggregationTargetValue = getSafeProperty(this.fcAggregation, (obj) => obj.value, '');

    if (isNullOrEmpty(aggregationTargetValue)) {
      this.fgBackUp.setControl('fcRetention', this.fcRetention);
      this.fgBackUp.setControl('fcDailyQuota', this.fcDailyQuota);
    } else {
      this.fgBackUp.removeControl('fcRetention');
      this.fgBackUp.removeControl('fcDailyQuota');
    }

    if (this.isInviewLevelPremium(this.fcAggregation.value)) {
      this.fgBackUp.removeControl('fcInview');
    } else {
      this.fgBackUp.setControl('fcInview', this.fcInview);
    }
  }

  /**
   * Initialize all the options for retention
   */
  private _subscribeToRetentionOptions(): void {
    this.retentionOptions.push(new McsOption('14', '14 Days'));
    this.retentionOptions.push(new McsOption('30', '30 Days'));
    this.retentionOptions.push(new McsOption('180', '6 Months'));
    this.retentionOptions.push(new McsOption('365', '1 Year'));
    this.retentionOptions.push(new McsOption('730', '2 Year'));
    this.retentionOptions.push(new McsOption('1095', '3 Year'));
    this.retentionOptions.push(new McsOption('1460', '4 Year'));
    this.retentionOptions.push(new McsOption('1825', '5 Year'));
    this.retentionOptions.push(new McsOption('2190', '6 Year'));
    this.retentionOptions.push(new McsOption('2555', '7 Year'));
  }

  /**
   * Initialize all the options for inview
   */
  private _subscribeToInviewOptions(): void {
    this.inviewLevelOptions.push(new McsOption(InviewLevel.Standard, inviewLevelText[InviewLevel.Standard]));
    this.inviewLevelOptions.push(new McsOption(InviewLevel.Premium, inviewLevelText[InviewLevel.Premium]));
  }

  /**
   * Initialize all the options for schedule backup
   */
  private _subscribeToScheduleBackupOptions(): void {
    this.scheduleBackupOptions.push(new McsOption('20', '8 PM'));
    this.scheduleBackupOptions.push(new McsOption('21', '9 PM'));
    this.scheduleBackupOptions.push(new McsOption('22', '10 PM'));
    this.scheduleBackupOptions.push(new McsOption('23', '11 PM'));
    this.scheduleBackupOptions.push(new McsOption('0', '12 AM'));
    this.scheduleBackupOptions.push(new McsOption('1', '1 AM'));
    this.scheduleBackupOptions.push(new McsOption('2', '2 AM'));
    this.scheduleBackupOptions.push(new McsOption('3', '3 AM'));
    this.scheduleBackupOptions.push(new McsOption('4', '4 AM'));
    this.scheduleBackupOptions.push(new McsOption('5', '5 AM'));
    this.scheduleBackupOptions.push(new McsOption('6', '6 AM'));
  }
}
