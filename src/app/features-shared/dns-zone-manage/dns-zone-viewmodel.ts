import {
  BehaviorSubject,
  Subject
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  tap
} from 'rxjs/operators';

import {
  FormControl,
  FormGroup
} from '@angular/forms';
import { CoreValidators } from '@app/core';
import {
  DnsRecordType,
  McsNetworkDnsRrSets,
  McsNetworkDnsRrSetsRecord,
  McsNetworkDnsZone
} from '@app/models';
import {
  compareStrings,
  getSafeFormValue,
  isNullOrEmpty,
  isNullOrUndefined,
  CommonDefinition
} from '@app/utilities';

const DNS_TTLSECONDS_MIN_VALUE = 600;
const DNS_TTLSECONDS_MAX_VALUE = 2147483647;
const DNS_INT_MIN_VALUE = 0;
const DNS_INT_MAX_VALUE = 65535;
const DNS_SERVICE_MAX_LENGTH = 25;
const DNS_STRING_MAX_LENGTH = 255;

interface DnsZoneModel {
  id: string;
  dnsZone: string;
  zoneType: string;
  hostName: string;
  target: string;
  ttlSeconds: number;
  data: any;
  service: string;
  protocol: string;
  priority: number;
  weight: number;
  port: number;
  preference: number;
  flags: string;
  regex: string;
  replacement: string;
}

export class DnsZoneViewModel {
  public updating: boolean;
  public recordInfo: DnsZoneModel | null;

  public readonly inProgress$: BehaviorSubject<boolean>;
  public readonly fgDnsZone: FormGroup<any>;
  public readonly fcZoneType: FormControl<any>;
  public readonly fcHostName: FormControl<any>;
  public readonly fcTarget: FormControl<any>;
  public readonly fcTtlSeconds: FormControl<any>;
  public readonly fcService: FormControl<any>;
  public readonly fcProtocol: FormControl<any>;
  public readonly fcPriority: FormControl<any>;
  public readonly fcWeight: FormControl<any>;
  public readonly fcPort: FormControl<any>;
  public readonly fcData: FormControl<any>;
  public readonly fcOrder: FormControl<any>;
  public readonly fcPreference: FormControl<any>;
  public readonly fcFlags: FormControl<any>;
  public readonly fcRegex: FormControl<any>;
  public readonly fcReplacement: FormControl<any>;

  private readonly _destroySubject = new Subject<void>();

  private readonly _dataFieldRegexMap = new Map<string, RegExp>();
  private readonly _formFieldsStateMap = new Map<DnsRecordType, () => void>();

  constructor(
    private _zone?: McsNetworkDnsZone,
    private _mainRrSet?: McsNetworkDnsRrSets,
    private _subRecord?: McsNetworkDnsRrSetsRecord
  ) {
    this.inProgress$ = new BehaviorSubject<boolean>(false);

    this.fcZoneType = new FormControl<any>('', [
      CoreValidators.required
    ]);

    this.fcHostName = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.custom(this._onValidateHostName.bind(this), 'invalidDnsHostName')
    ]);

    this.fcTarget = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.custom(this._onValidateTarget.bind(this), 'invalidDnsTarget')
    ]);

    this.fcTtlSeconds = new FormControl<any>('', [
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.ttlMinValue)(control),
      (control) => CoreValidators.max(this.ttlMaxValue)(control)
    ]);

    // TODO(apascual): Set the maximum based on zonetype
    // For A: 15, for AAAA: 39, Others: 255
    this.fcData = new FormControl<any>('', [
      CoreValidators.required,
      (control) => CoreValidators.maxLength(this.stringMaxLength)(control),
      CoreValidators.custom(this._onValidateData.bind(this), 'invalidDnsData')
    ]);

    this.fcService = new FormControl<any>('', [
      CoreValidators.required,
      (control) => CoreValidators.maxLength(this.serviceMaxLength)(control),
      CoreValidators.custom(this._onValidateService.bind(this), 'invalidDnsService')
    ]);

    this.fcProtocol = new FormControl<any>('', [
      CoreValidators.required,
      (control) => CoreValidators.maxLength(this.stringMaxLength)(control),
      CoreValidators.custom(this._onValidateProtocol.bind(this), 'invalidDnsProtocol')
    ]);

    this.fcPriority = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.intMinValue)(control),
      (control) => CoreValidators.max(this.intMaxValue)(control)
    ]);

    this.fcWeight = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.intMinValue)(control),
      (control) => CoreValidators.max(this.intMaxValue)(control)
    ]);

    this.fcPort = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.intMinValue)(control),
      (control) => CoreValidators.max(this.intMaxValue)(control)
    ]);

    this.fcOrder = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.intMinValue)(control),
      (control) => CoreValidators.max(this.intMaxValue)(control)
    ]);

    this.fcPreference = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.intMinValue)(control),
      (control) => CoreValidators.max(this.intMaxValue)(control)
    ]);

    this.fcFlags = new FormControl<any>('', [
      CoreValidators.required,
      CoreValidators.maxLength(1),
      CoreValidators.custom(this._onValidateFlags.bind(this), 'invalidDnsFlags')
    ]);

    this.fcRegex = new FormControl<any>('', [
      CoreValidators.required,
      (control) => CoreValidators.maxLength(this.stringMaxLength)(control),
      CoreValidators.custom(this._onValidateRegex.bind(this), 'invalidDnsRegex')
    ]);

    this.fcReplacement = new FormControl<any>('', [
      CoreValidators.required,
      (control) => CoreValidators.maxLength(this.stringMaxLength)(control),
      CoreValidators.custom(this._onValidateReplacement.bind(this), 'invalidDnsReplacement')
    ]);

    this.fgDnsZone = new FormGroup<any>({
      fcZoneType: this.fcZoneType,
      fcHostName: this.fcHostName,
      fcTarget: this.fcTarget,
      fcTtlSeconds: this.fcTtlSeconds,
      fcData: this.fcData,
      fcService: this.fcService,
      fcProtocol: this.fcProtocol,
      fcPriority: this.fcPriority,
      fcWeight: this.fcWeight,
      fcPort: this.fcPort,
      fcOrder: this.fcOrder,
      fcPreference: this.fcPreference,
      fcFlags: this.fcFlags,
      fcRegex: this.fcRegex,
      fcReplacement: this.fcReplacement
    });

    this._registerRegexMap();
    this._registerFieldsVisibilityMap();
    this._subscribeToZoneTypeChange();
    this.setDefaultValues();
  }

  public get ttlMinValue(): number {
    return DNS_TTLSECONDS_MIN_VALUE;
  }

  public get ttlMaxValue(): number {
    return DNS_TTLSECONDS_MAX_VALUE;
  }

  public get intMinValue(): number {
    return DNS_INT_MIN_VALUE;
  }

  public get intMaxValue(): number {
    return DNS_INT_MAX_VALUE;
  }

  public get serviceMaxLength(): number {
    return DNS_SERVICE_MAX_LENGTH;
  }

  public get stringMaxLength(): number {
    return DNS_STRING_MAX_LENGTH;
  }

  public get isNaptr(): boolean {
    return getSafeFormValue<DnsRecordType>(this.fcZoneType) === DnsRecordType.NAPTR;
  }

  public get isTtlSecondsFromZone(): boolean {
    return isNullOrUndefined(this._mainRrSet?.ttlSeconds);
  }

  public get dataFieldIsArray(): boolean {
    return getSafeFormValue<DnsRecordType>(this.fcZoneType) === DnsRecordType.TXT;
  }

  public get targetForCreate(): boolean {
    return isNullOrUndefined(this._zone) &&
      isNullOrUndefined(this._mainRrSet) &&
      isNullOrUndefined(this._subRecord);
  }

  public get targetOrDataValue(): string {
    if (isNullOrUndefined(this.recordInfo)) { return ''; }

    let hasTargetValue = !isNullOrUndefined(this.recordInfo?.target);
    if (hasTargetValue) { return this.recordInfo?.target; }

    return this.dataFieldIsArray ?
      this.recordInfo?.data?.join(', ') :
      this.recordInfo?.data;
  }

  public get hasChanges(): boolean {
    return this.fcTarget.dirty ||
      this.fcHostName.dirty ||
      this.fcTtlSeconds.dirty ||
      this.fcZoneType.dirty;
  }

  public get isReservedRecord(): boolean {
    if (this.recordInfo?.zoneType === DnsRecordType.NS && this.recordInfo?.hostName === '@') {
      return true;
    }
    return false;
  }

  public setDefaultValues(): DnsZoneViewModel {
    if (this.targetForCreate) {
      setTimeout(() => { this.fcZoneType.setValue(DnsRecordType.A); });
      return this;
    }

    // We need to set the record information here because
    // the formfield is always being updated
    this.recordInfo = {
      id: this._subRecord.id,
      zoneType: this._mainRrSet.type,
      hostName: this._subRecord.name,
      ttlSeconds: this._mainRrSet.ttlSeconds || this._zone.ttlSeconds,
      target: this._subRecord.target,
      data: this._subRecord.data,
      service: this._subRecord.service,
      protocol: this._subRecord.protocol,
      priority: this._subRecord.priority,
      weight: this._subRecord.weight,
      port: this._subRecord.port,
      preference: this._subRecord.preference,
      flags: this._subRecord.flags,
      regex: this._subRecord.regexp,
      replacement: this._subRecord.replacement
    } as DnsZoneModel;

    setTimeout(() => {
      this.fcZoneType.setValue(this.recordInfo.zoneType);
      this.fcHostName.setValue(this.recordInfo.hostName);
      this.fcTtlSeconds.setValue(this.recordInfo.ttlSeconds);
      this.fcTarget.setValue(this.recordInfo.target);
      this.fcData.setValue(this.recordInfo.data);
      this.fcService.setValue(this.recordInfo.service);
      this.fcProtocol.setValue(this.recordInfo.protocol);
      this.fcPriority.setValue(this.recordInfo.priority);
      this.fcWeight.setValue(this.recordInfo.weight);
      this.fcPort.setValue(this.recordInfo.port);
      this.fcPreference.setValue(this.recordInfo.preference);
      this.fcFlags.setValue(this.recordInfo.flags);
      this.fcRegex.setValue(this.recordInfo.regex);
      this.fcReplacement.setValue(this.recordInfo.replacement);
    });
    return this;
  }

  public setProgressState(inProgress: boolean): void {
    this.inProgress$.next(inProgress);
  }

  private _onValidateHostName(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    if (this.fcZoneType.value === DnsRecordType.CNAME || this.fcZoneType.value === DnsRecordType.TXT) {
      return CommonDefinition.REGEX_DNS_HOSTNAME_CNAME_OR_TXT_TYPE.test(inputValue);
    }
    return CommonDefinition.REGEX_DNS_HOSTNAME.test(inputValue);
  }

  private _onValidateData(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    let associatedRegex = this._dataFieldRegexMap.get(this.fcZoneType?.value);
    if (isNullOrEmpty(associatedRegex)) {
      associatedRegex = CommonDefinition.REGEX_DNS_TYPE_DEFAULT;
    }
    return associatedRegex.test(inputValue);
  }

  private _onValidateService(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_SERVICE.test(inputValue);
  }

  private _onValidateProtocol(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_PROTOCOL.test(inputValue);
  }

  private _onValidateFlags(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_FLAGS.test(inputValue);
  }

  private _onValidateRegex(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_REGEX.test(inputValue);
  }

  private _onValidateReplacement(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_REPLACEMENT.test(inputValue);
  }

  private _onValidateTarget(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_TARGET.test(inputValue);
  }

  private _registerRegexMap(): void {
    this._dataFieldRegexMap.set(DnsRecordType.A, CommonDefinition.REGEX_DNS_DATA_A);
    this._dataFieldRegexMap.set(DnsRecordType.AAAA, CommonDefinition.REGEX_DNS_DATA_AAAA);
    this._dataFieldRegexMap.set(DnsRecordType.CNAME, CommonDefinition.REGEX_DNS_DATA_DEFAULT);
    this._dataFieldRegexMap.set(DnsRecordType.MX, CommonDefinition.REGEX_DNS_DATA_DEFAULT);
    this._dataFieldRegexMap.set(DnsRecordType.NS, CommonDefinition.REGEX_DNS_DATA_DEFAULT);
    this._dataFieldRegexMap.set(DnsRecordType.PTR, CommonDefinition.REGEX_DNS_DATA_GENERIC);
    this._dataFieldRegexMap.set(DnsRecordType.TXT, CommonDefinition.REGEX_DNS_DATA_GENERIC);
  }

  private _registerFieldsVisibilityMap(): void {
    this._formFieldsStateMap.set(DnsRecordType.A, this._updateFormFieldsState.bind(this,
      'fcZoneType', 'fcHostName', 'fcTtlSeconds', 'fcData'));

    this._formFieldsStateMap.set(DnsRecordType.AAAA, this._updateFormFieldsState.bind(this,
      'fcZoneType', 'fcHostName', 'fcTtlSeconds', 'fcData'));

    this._formFieldsStateMap.set(DnsRecordType.CNAME, this._updateFormFieldsState.bind(this,
      'fcZoneType', 'fcHostName', 'fcTtlSeconds', 'fcData'));

    this._formFieldsStateMap.set(DnsRecordType.MX, this._updateFormFieldsState.bind(this,
      'fcZoneType', 'fcHostName', 'fcTtlSeconds', 'fcData', 'fcPriority'));

    this._formFieldsStateMap.set(DnsRecordType.NAPTR, this._updateFormFieldsState.bind(this,
      'fcZoneType', 'fcHostName', 'fcTtlSeconds', 'fcService', 'fcOrder',
      'fcPreference', 'fcFlags', 'fcRegex', 'fcReplacement'));

    this._formFieldsStateMap.set(DnsRecordType.NS, this._updateFormFieldsState.bind(this,
      'fcZoneType', 'fcHostName', 'fcTtlSeconds', 'fcData'));

    this._formFieldsStateMap.set(DnsRecordType.PTR, this._updateFormFieldsState.bind(this,
      'fcZoneType', 'fcHostName', 'fcTtlSeconds', 'fcData'));

    this._formFieldsStateMap.set(DnsRecordType.SRV, this._updateFormFieldsState.bind(this,
      'fcZoneType', 'fcHostName', 'fcTtlSeconds', 'fcPriority', 'fcService',
      'fcProtocol', 'fcTarget', 'fcWeight', 'fcPort'));

    this._formFieldsStateMap.set(DnsRecordType.TXT, this._updateFormFieldsState.bind(this,
      'fcZoneType', 'fcHostName', 'fcTtlSeconds', 'fcData'));
  }

  private _subscribeToZoneTypeChange(): void {
    if (isNullOrEmpty(this.fcZoneType)) { return; }

    this.fcZoneType.valueChanges.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged(),
      debounceTime(500),
      tap(value => {
        let updateFormFieldFunc = this._formFieldsStateMap.get(value as DnsRecordType);
        if (isNullOrEmpty(updateFormFieldFunc)) { return; }
        updateFormFieldFunc();
      })
    ).subscribe();
  }

  /**
   * Update all form fields state. All remaining fields will be set to disabled
   * @param enableFieldNames Enabled field names
   */
  private _updateFormFieldsState(...enableFieldNames: string[]): void {
    enableFieldNames?.forEach(fieldName => {
      let formField = this.fgDnsZone.controls[fieldName];
      if (isNullOrEmpty(formField)) { return; }
      formField.enable();
    });

    // Disable all fields that we're not declared
    let disabledFieldNames = Object.keys(this.fgDnsZone.controls)
      ?.filter(controlName => {
        let controlFound = enableFieldNames?.find(inputName =>
          compareStrings(inputName, controlName) === 0);
        return !controlFound;
      });

    disabledFieldNames?.forEach(fieldName => {
      let formField = this.fgDnsZone.controls[fieldName];
      if (isNullOrEmpty(formField)) { return; }
      formField.disable();
    });
  }
}
