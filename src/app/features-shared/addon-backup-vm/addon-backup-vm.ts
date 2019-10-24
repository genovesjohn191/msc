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
} from '@angular/core';
import {
  FormControl,
  FormGroup
} from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import {
  Subject,
  Observable,
  of
} from 'rxjs';
import {
  unsubscribeSafely,
  getSafeProperty
} from '@app/utilities';
import {
  CoreValidators,
  IMcsDataChange,
  IMcsFormGroup
} from '@app/core';
import {
  McsServerCreateAddOnVmBackup,
  McsOption
} from '@app/models';
import { McsFormGroupDirective } from '@app/shared';

const DEFAULT_MAXIMUM = 5120;
const DEFAULT_MINIMUM = 1;
const QUOTA_STEP = 1;

@Component({
  selector: 'mcs-addon-backup-vm',
  templateUrl: './addon-backup-vm.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'addon-backup-vm-wrapper'
  }
})

export class AddOnBackupVmComponent implements
  OnInit, OnDestroy, IMcsDataChange<McsServerCreateAddOnVmBackup>, IMcsFormGroup {

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
  public dataChange = new EventEmitter<McsServerCreateAddOnVmBackup>();

  @Input()
  public aggregationOptions$: Observable<any>;

  @ViewChild(McsFormGroupDirective, { static: false })
  private _formGroup: McsFormGroupDirective;

  private _destroySubject = new Subject<void>();

  public ngOnInit(): void {
    this._registerFormGroup();
    this._subscribeToRetentionOptions();
    this._subscribeToInviewOptions();
    this._subscribeToScheduleBackupOptions();
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
  public isAggregationOptionsEmpty(aggregationOptions: any[]): boolean {
    return getSafeProperty(aggregationOptions, (obj) => obj.length <= 0, true);
  }

  /**
   * Returns true when the aggregation target is set to None
   */
  public isAggregationTargetNone(aggregationOption: any): boolean {
    return aggregationOption === 'none';
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    if (!this.isValid()) { return; }
    let backupDetils = new McsServerCreateAddOnVmBackup();
    backupDetils.aggregation = this.fcAggregation.value;
    backupDetils.backupSchedule = this.fcBackupSchedule.value;
    backupDetils.retention = this.fcRetention.value;
    backupDetils.inview = this.fcInview.value;
    backupDetils.dailyQuotaGb = this.fcDailyQuota.value;

    this.dataChange.emit(backupDetils);
  }

  /**
   * Registers all form group
   */
  private _registerFormGroup(): void {
    // Register Form Groups using binding
    this.fcAggregation = new FormControl('', [CoreValidators.required]);
    this.fcRetention = new FormControl('', [CoreValidators.required]);
    this.fcInview = new FormControl('', [CoreValidators.required]);
    this.fcBackupSchedule = new FormControl('', [CoreValidators.required]);
    this.fcDailyQuota = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.minimumQuota)(control),
      (control) => CoreValidators.max(this.maximumQuota)(control),
      (control) => CoreValidators.custom(this._quotaIsValid.bind(this), 'valid')(control)
    ]);

    this.fgBackUp = new FormGroup({
      fcAggregation: this.fcAggregation,
      fcRetention: this.fcRetention,
      fcInview: this.fcInview,
      fcBackupSchedule: this.fcBackupSchedule,
      fcDailyQuota: this.fcDailyQuota
    });

    this.fgBackUp.valueChanges.pipe(
      takeUntil(this._destroySubject)
    ).subscribe(this.notifyDataChange.bind(this));
  }

  /**
   * Returns true if the value is a valid quota
   * @param inputValue Value to be checked
   */
  private _quotaIsValid(inputValue: any): boolean {
    return inputValue % QUOTA_STEP === 0;
  }

  /**
   * Initialize all the options for retention
   */
  private _subscribeToRetentionOptions(): void {
    // TODO: temporary value, need to verify with API for final model
    this.retentionOptions.push(new McsOption('14 Days', '14 Days'));
    this.retentionOptions.push(new McsOption('30 Days', '30 Days'));
    this.retentionOptions.push(new McsOption('6 Months', '6 Months'));
    this.retentionOptions.push(new McsOption('1 Year', '1 Year'));
    this.retentionOptions.push(new McsOption('2 Year', '2 Year'));
    this.retentionOptions.push(new McsOption('3 Year', '3 Year'));
    this.retentionOptions.push(new McsOption('4 Year', '4 Year'));
    this.retentionOptions.push(new McsOption('5 Year', '5 Year'));
    this.retentionOptions.push(new McsOption('6 Year', '6 Year'));
    this.retentionOptions.push(new McsOption('7 Year', '7 Year'));
  }

  /**
   * Initialize all the options for inview
   */
  private _subscribeToInviewOptions(): void {
    this.inviewLevelOptions.push(new McsOption('Premium', 'Premium'));
    this.inviewLevelOptions.push(new McsOption('Premium', 'Premium'));
  }

  /**
   * Initialize all the options for schedule backup
   */
  private _subscribeToScheduleBackupOptions(): void {
    // TODO: temporary value, need to verify with API for final model
    this.scheduleBackupOptions.push(new McsOption('8 PM', '8 PM'));
    this.scheduleBackupOptions.push(new McsOption('9 PM', '9 PM'));
    this.scheduleBackupOptions.push(new McsOption('10 PM', '10 PM'));
    this.scheduleBackupOptions.push(new McsOption('11 PM', '11 PM'));
    this.scheduleBackupOptions.push(new McsOption('12 AM', '12 AM'));
    this.scheduleBackupOptions.push(new McsOption('1 AM', '1 AM'));
    this.scheduleBackupOptions.push(new McsOption('2 AM', '2 AM'));
    this.scheduleBackupOptions.push(new McsOption('3 AM', '3 AM'));
    this.scheduleBackupOptions.push(new McsOption('4 AM', '4 AM'));
    this.scheduleBackupOptions.push(new McsOption('5 AM', '5 AM'));
    this.scheduleBackupOptions.push(new McsOption('6 AM', '6 AM'));
  }
}
