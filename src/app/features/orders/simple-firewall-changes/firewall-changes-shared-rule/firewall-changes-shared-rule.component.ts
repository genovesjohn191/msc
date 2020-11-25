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
  zip,
  Subscription
} from 'rxjs';
import {
  takeUntil,
  tap
} from 'rxjs/operators';
import {
    TranslateService
} from '@ngx-translate/core';
import {
  ActionType,
  ProtocolType,
  RuleAction,
  FirewallChangesSharedRule
} from './firewall-changes-shared-rule';
import { FirewallChangesRuleFactory } from './firewall-changes-shared-rule.factory';
import { IMcsFormGroup } from '@app/core';
import { McsOption } from '@app/models';
import { McsFormGroupDirective } from '@app/shared';
import { createObject, getSafeProperty, isNullOrEmpty, unsubscribeSafely } from '@app/utilities';

@Component({
  selector: 'mcs-firewall-changes-shared-rule',
  templateUrl: 'firewall-changes-shared-rule.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FirewallChangesSharedRuleComponent implements IMcsFormGroup, OnInit, OnDestroy {

  public actionTypeOptions$: Observable<McsOption[]>;
  public protocolTypeOptions$: Observable<McsOption[]>;

  @Output()
  public dataChange = new EventEmitter<FirewallChangesSharedRule>();

  @Input()
  public formGroup: FormGroup;

  @ViewChild(McsFormGroupDirective)
  public set formGroupRef(value: McsFormGroupDirective) {
    if (isNullOrEmpty(value)) { return; }

    this._formGroup = value;
    this._subscribeToValueChanges();
  }

  private _routerHandler: Subscription;

  private _formGroup: McsFormGroupDirective;
  private _valueChangesSubject = new Subject<void>();

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _translate: TranslateService
  ) { }

  public ngOnInit(): void {
    this._subscribeToActionTypeOptions();
    this._subscribeToProtocolTypeOptions();
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
   * Returns true when the rule action is Add
   */
  public isAddRule(value: RuleAction): boolean {
    return value === RuleAction.Add;
  }

  /**
   * Returns true when the rule action is Remove
   */
  public isRemoveRule(value: RuleAction): boolean {
    return value === RuleAction.Remove;
  }

  /**
   * Returns true when the rule action is Modify
   */
  public isModifyRule(value: RuleAction): boolean {
    return value === RuleAction.Modify;
  }

  /**
   * Event listener when the action type was change
   */
  public onActionTypeSelectionChange(action: RuleAction): void {
    let changeControls = FirewallChangesRuleFactory.createFormControls(action);
    this._assignFormControlsToGroup(changeControls);
    this._changeDetector.markForCheck();
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
    this.dataChange.emit(createObject(FirewallChangesSharedRule, {
      action: getSafeProperty(this.formGroup.controls['fcActionType'], (obj) => obj.value),
      sourceIpAddress: getSafeProperty(this.formGroup.controls['fcSourceZoneInterface'], (obj) => obj.value),
      sourceZone: getSafeProperty(this.formGroup.controls['fcSourceIpSubnet'], (obj) => obj.value),
      destinationZone: getSafeProperty(this.formGroup.controls['fcDestinationZoneInterface'], (obj) => obj.value),
      destinationIpAddress: getSafeProperty(this.formGroup.controls['fcDestinationIpSubnet'], (obj) => obj.value),
      destinationPort: getSafeProperty(this.formGroup.controls['fcDestinationPort'], (obj) => obj.value),
      protocol: getSafeProperty(this.formGroup.controls['fcProtocol'], (obj) => obj.value)
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
    actionTypeOptions.push(createObject(McsOption, { text: ActionType.Allow, value: ActionType.Allow }));
    actionTypeOptions.push(createObject(McsOption, { text: ActionType.Deny, value: ActionType.Deny }));
    this.actionTypeOptions$ = of(actionTypeOptions);
  }

  /**
   * Initialize the options for protocol types
   */
  private _subscribeToProtocolTypeOptions(): void {
    let protocolTypeOptions: McsOption[] = [];
    protocolTypeOptions.push(createObject(McsOption, { text: ProtocolType.TCP, value:  ProtocolType.TCP }));
    protocolTypeOptions.push(createObject(McsOption, { text:  ProtocolType.UDP, value: ProtocolType.UDP }));
    protocolTypeOptions.push(createObject(McsOption, { text: ProtocolType.ICMP, value: ProtocolType.ICMP }));
    protocolTypeOptions.push(createObject(McsOption, { text: ProtocolType.IP, value: ProtocolType.IP }));
    protocolTypeOptions.push(createObject(McsOption, { text: ProtocolType.TCPUDP, value: ProtocolType.TCPUDP }));
    this.protocolTypeOptions$ = of(protocolTypeOptions);
  }
}
