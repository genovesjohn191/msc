import {
  ChangeDetectionStrategy,
  OnInit,
  Component,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {
  FormGroup,
  FormControl
} from '@angular/forms';
import {
  of,
  Observable,
  Subject,
  zip
} from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import {
  McsOption,
  DnsRecordType
} from '@app/models';
import {
  createObject,
  getSafeProperty,
  isNullOrEmpty,
  unsubscribeSafely
} from '@app/utilities';
import { IMcsFormGroup } from '@app/core';
import { McsFormGroupDirective } from '@app/shared';
import {
  ChangeToApply,
  ActionType
} from './change-to-apply';
import { ChangeToApplyFactory } from './change-to-apply.factory';

@Component({
  selector: 'mcs-order-hosted-dns-change-to-apply',
  templateUrl: 'change-to-apply.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChangeToApplyComponent implements IMcsFormGroup, OnInit, OnDestroy {

  public actionTypeOptions$: Observable<McsOption[]>;
  public recordTypeOptions$: Observable<McsOption[]>;

  @Output()
  public dataChange = new EventEmitter<ChangeToApply>();

  @Input()
  public formGroup: FormGroup;

  @ViewChild(McsFormGroupDirective)
  public set formGroupRef(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }
  private _formGroup: McsFormGroupDirective;
  private _valueChangesSubject = new Subject<void>();

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _translate: TranslateService
  ) { }

  public ngOnInit(): void {
    this._subscribeToActionTypeOptions();
    this._subscribeToRecordTypeOptions();
  }

  public ngOnDestroy() {
    unsubscribeSafely(this._valueChangesSubject);
  }

  /**
   * Returns the form group
   */
  public getFormGroup(): McsFormGroupDirective {
    return this._formGroup;
  }

  /**
   * Returns true when the form group is valid
   */
  public isValid(): boolean {
    return getSafeProperty(this._formGroup, (obj) => obj.isValid());
  }

  /**
   * Returns true when the record type is MX
   */
  public isMxRecordType(value: DnsRecordType): boolean {
    return value === DnsRecordType.MX;
  }

  /**
   * Returns true when the record type is TXT
   */
  public isTxtRecordType(value: DnsRecordType): boolean {
    return value === DnsRecordType.TXT;
  }

  /**
   * Return the target placeholder based on the Record Type
   */
  public targetPlaceholder(value: DnsRecordType): string {
    return this.isTxtRecordType(value) ?
      this._translate.instant('orderHostedDnsChange.requestDetails.desiredChange.target.placeholderValue') :
      this._translate.instant('orderHostedDnsChange.requestDetails.desiredChange.target.placeholder');
  }

  /**
   * Event listener when the action type was change
   */
  public onActionTypeSelectionChange(action: ActionType): void {
    let changeControls = ChangeToApplyFactory.createChangeFormControls(action);
    this._assignFormControlsToGroup(changeControls);
    this._changeDetector.markForCheck();
  }

  /**
   * Event listener when the record type was change
   */
  public onRecordTypeSelectionChange(value: DnsRecordType): void {
    if (this.isMxRecordType(value)) {
      this.formGroup.controls['fcPriority'].enable();
      this.formGroup.updateValueAndValidity();
      return;
    }
    this.formGroup.controls['fcPriority'].disable();
    this.formGroup.updateValueAndValidity();
  }

  /**
   * Subscribe to the form changes
   */
  private _subscribeToValueChanges(): void {
    this._valueChangesSubject.next();
    zip(
      this._formGroup.valueChanges(),
      this._formGroup.stateChanges(),
    ).pipe(
      takeUntil(this._valueChangesSubject),
      tap(() => this.notifyDataChange())
    ).subscribe();
  }

  /**
   * Event that emits whenever there are changes in the data
   */
  public notifyDataChange(): void {
    this.dataChange.emit(createObject(ChangeToApply, {
      action: getSafeProperty(this.formGroup.controls['fcActionType'], (obj) => obj.value),
      type: getSafeProperty(this.formGroup.controls['fcRecordType'], (obj) => obj.value),
      hostName: getSafeProperty(this.formGroup.controls['fcHostName'], (obj) => obj.value),
      value: getSafeProperty(this.formGroup.controls['fcTarget'], (obj) => obj.value),
      priority: getSafeProperty(this.formGroup.controls['fcPriority'], (obj) => +obj.value),
      ttlSeconds: getSafeProperty(this.formGroup.controls['fcTtl'], (obj) => +obj.value)
    }));
  }

  /**
   * Assign the passed form controls to the form group
   */
  private _assignFormControlsToGroup(controlDetails: { controlName: string, control: FormControl }[]): void {
    controlDetails.forEach((item) => {
      let formControl = this.formGroup.controls[item.controlName];
      if (!isNullOrEmpty(formControl)) {
        this.formGroup.setControl(item.controlName, item.control);
      }
    });
    this.formGroup.updateValueAndValidity();
  }

  /**
   * Initialize the options for action types
   */
  private _subscribeToActionTypeOptions(): void {
    let actionTypeOptions: McsOption[] = [];
    actionTypeOptions.push(createObject(McsOption, { text: ActionType.Add, value: ActionType.Add }));
    actionTypeOptions.push(createObject(McsOption, { text: ActionType.Remove, value: ActionType.Remove }));
    this.actionTypeOptions$ = of(actionTypeOptions);
  }

  /**
   * Initialize the options for record types
   */
  private _subscribeToRecordTypeOptions(): void {
    let recordTypeOptions: McsOption[] = [];
    recordTypeOptions.push(createObject(McsOption, { text: DnsRecordType.A, value: DnsRecordType.A }));
    recordTypeOptions.push(createObject(McsOption, { text: DnsRecordType.CNAME, value: DnsRecordType.CNAME }));
    recordTypeOptions.push(createObject(McsOption, { text: DnsRecordType.MX, value: DnsRecordType.MX }));
    recordTypeOptions.push(createObject(McsOption, { text: DnsRecordType.PTR, value: DnsRecordType.PTR }));
    recordTypeOptions.push(createObject(McsOption, { text: DnsRecordType.TXT, value: DnsRecordType.TXT }));
    this.recordTypeOptions$ = of(recordTypeOptions);
  }
}
