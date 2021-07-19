import {
  BehaviorSubject,
  Subject
} from 'rxjs';
import {
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
  McsNetworkDnsRrSetsRecord
} from '@app/models';
import {
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
const DNS_PROTOCOL_MAX_LENGTH = 255;
enum ControlFieldType {
  Default = 1,
  MxField = 2,
  SvcField = 3
}

interface DnsZoneModel {
  id: string;
  dnsZone: string;
  zoneType: string;
  hostName: string;
  target: string;
  ttlSeconds: number;
  service: string;
  protocol: string;
  priority: number;
  weight: number;
  port: number;
}

export class DnsZoneViewModel {
  public updating: boolean;
  public recordInfo: DnsZoneModel | null;

  public readonly inProgress$: BehaviorSubject<boolean>;
  public readonly fgDnsZone: FormGroup;
  public readonly fcZoneType: FormControl;
  public readonly fcHostName: FormControl;
  public readonly fcTarget: FormControl;
  public readonly fcTtlSeconds: FormControl;
  public readonly fcService: FormControl;
  public readonly fcProtocol: FormControl;
  public readonly fcPriority: FormControl;
  public readonly fcWeight: FormControl;
  public readonly fcPort: FormControl;

  private readonly _targetRegexMap: Map<string, RegExp>;
  private readonly _destroySubject = new Subject<void>();
  private readonly _formFieldsChange = new BehaviorSubject<ControlFieldType>(ControlFieldType.Default);

  constructor(
    private _mainRrSet?: McsNetworkDnsRrSets,
    private _subRecord?: McsNetworkDnsRrSetsRecord
  ) {
    this._targetRegexMap = new Map();
    this.inProgress$ = new BehaviorSubject<boolean>(false);

    this.fcZoneType = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcHostName = new FormControl('', [
      CoreValidators.required,
      CoreValidators.custom(this._onValidateHostName.bind(this), 'invalidDnsHostName')
    ]);

    this.fcTarget = new FormControl('', [
      CoreValidators.required,
      CoreValidators.custom(this._onValidateTarget.bind(this), 'invalidDnsTarget')
    ]);

    this.fcTtlSeconds = new FormControl('', [
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.ttlMinValue)(control),
      (control) => CoreValidators.max(this.ttlMaxValue)(control)
    ]);

    this.fcService = new FormControl('', [
      CoreValidators.required,
      (control) => CoreValidators.maxLength(this.serviceMaxLength)(control),
      CoreValidators.custom(this._onValidateService.bind(this), 'invalidDnsService')
    ]);

    this.fcProtocol = new FormControl('', [
      CoreValidators.required,
      (control) => CoreValidators.maxLength(this.protocolMaxLength)(control),
      CoreValidators.custom(this._onValidateProtocol.bind(this), 'invalidDnsProtocol')
    ]);

    this.fcPriority = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.intMinValue)(control),
      (control) => CoreValidators.max(this.intMaxValue)(control)
    ]);

    this.fcWeight = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.intMinValue)(control),
      (control) => CoreValidators.max(this.intMaxValue)(control)
    ]);

    this.fcPort = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric,
      (control) => CoreValidators.min(this.intMinValue)(control),
      (control) => CoreValidators.max(this.intMaxValue)(control)
    ]);

    this.fgDnsZone = new FormGroup({
      fcZoneType: this.fcZoneType,
      fcHostName: this.fcHostName,
      fcTarget: this.fcTarget,
      fcTtlSeconds: this.fcTtlSeconds,
      fcService: this.fcService,
      fcProtocol: this.fcProtocol,
      fcPriority: this.fcPriority,
      fcWeight: this.fcWeight,
      fcPort: this.fcPort
    });

    this._registerRegexMap();
    this._subscribeToFieldChange();
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

  public get protocolMaxLength(): number {
    return DNS_PROTOCOL_MAX_LENGTH;
  }

  public get isSrvType(): boolean {
    return getSafeFormValue<DnsRecordType>(this.fcZoneType) === DnsRecordType.SRV;
  }

  public get isMxType(): boolean {
    return getSafeFormValue<DnsRecordType>(this.fcZoneType) === DnsRecordType.MX;
  }

  public get hasChanges(): boolean {
    return this.fcTarget.dirty ||
      this.fcHostName.dirty ||
      this.fcTtlSeconds.dirty ||
      this.fcZoneType.dirty;
  }

  public setDefaultValues(): DnsZoneViewModel {
    if (isNullOrUndefined(this._mainRrSet) &&
      isNullOrUndefined(this._subRecord)) { return; }

    this.recordInfo = {
      id: this._subRecord.id,
      zoneType: this._mainRrSet.type,
      hostName: this._mainRrSet.name,
      ttlSeconds: this._mainRrSet.ttlSeconds,
      target: this._subRecord.data,
      service: this._subRecord.service,
      protocol: this._subRecord.protocol,
      priority: this._subRecord.priority,
      weight: this._subRecord.weight,
      port: this._subRecord.port
    } as DnsZoneModel;

    this.resetFields(true);
    this.fcZoneType.setValue(this.recordInfo.zoneType);
    this.fcHostName.setValue(this.recordInfo.hostName);
    this.fcTtlSeconds.setValue(this.recordInfo.ttlSeconds);
    this.fcTarget.setValue(this.recordInfo.target);
    this.fcService.setValue(this.recordInfo.service);
    this.fcProtocol.setValue(this.recordInfo.protocol);
    this.fcPriority.setValue(this.recordInfo.priority);
    this.fcWeight.setValue(this.recordInfo.weight);
    this.fcPort.setValue(this.recordInfo.port);
    return this;
  }

  public resetFields(includeZoneType: boolean = false): void {
    if (includeZoneType) {
      this.fcZoneType.reset();
    }
    this.fcHostName.reset();
    this.fcTtlSeconds.reset();
    this.fcTarget.reset();
    this.fcService.reset();
    this.fcProtocol.reset();
    this.fcPriority.reset();
    this.fcWeight.reset();
    this.fcPort.reset();
  }

  public setProgressState(inProgress: boolean): void {
    this.inProgress$.next(inProgress);
  }

  private _onValidateHostName(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_HOSTNAME.test(inputValue);
  }

  private _onValidateService(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_SERVICE.test(inputValue);
  }

  private _onValidateProtocol(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_PROTOCOL.test(inputValue);
  }

  private _onValidateTarget(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }

    let associatedRegex = this._targetRegexMap.get(this.fcZoneType?.value);
    if (isNullOrEmpty(associatedRegex)) {
      associatedRegex = CommonDefinition.REGEX_DNS_TYPE_DEFAULT;
    }
    return associatedRegex.test(inputValue);
  }

  private _registerRegexMap(): void {
    this._targetRegexMap.set(DnsRecordType.A, CommonDefinition.REGEX_DNS_TYPE_A);
    this._targetRegexMap.set(DnsRecordType.AAA, CommonDefinition.REGEX_DNS_TYPE_AAA);
    this._targetRegexMap.set(DnsRecordType.CNAME, CommonDefinition.REGEX_DNS_TYPE_CNAME);
    this._targetRegexMap.set(DnsRecordType.MX, CommonDefinition.REGEX_DNS_TYPE_MX_OR_SV);
    this._targetRegexMap.set(DnsRecordType.NAPTR, CommonDefinition.REGEX_DNS_TYPE_NAPTR);
    this._targetRegexMap.set(DnsRecordType.NS, CommonDefinition.REGEX_DNS_TYPE_NS);
    this._targetRegexMap.set(DnsRecordType.PTR, CommonDefinition.REGEX_DNS_TYPE_PTR);
    this._targetRegexMap.set(DnsRecordType.SRV, CommonDefinition.REGEX_DNS_TYPE_MX_OR_SV);
    this._targetRegexMap.set(DnsRecordType.TXT, CommonDefinition.REGEX_DNS_TYPE_TXT);
  }

  private _subscribeToFieldChange(): void {
    this._formFieldsChange.pipe(
      takeUntil(this._destroySubject),
      distinctUntilChanged(),
      tap(type => {
        if (isNullOrUndefined(type)) { return; }
        type === ControlFieldType.SvcField ? this._updateSrvFields() :
          type === ControlFieldType.MxField ? this._updateMxFields() :
            this._updateDefaultFields();
      })
    ).subscribe();
  }

  private _subscribeToZoneTypeChange(): void {
    if (isNullOrEmpty(this.fcZoneType)) { return; }

    this.fcZoneType.valueChanges.pipe(
      takeUntil(this._destroySubject),
      tap(value => {
        let fieldType = value === DnsRecordType.SRV ? ControlFieldType.SvcField :
          value === DnsRecordType.MX ? ControlFieldType.MxField : ControlFieldType.Default;
        this._formFieldsChange.next(fieldType);
      })
    ).subscribe();
  }

  private _updateSrvFields(): void {
    this.fcService.enable();
    this.fcProtocol.enable();
    this.fcPriority.enable();
    this.fcWeight.enable();
    this.fcPort.enable();
  }

  private _updateMxFields(): void {
    this.fcPriority.enable();
    this.fcService.disable();
    this.fcProtocol.disable();
    this.fcWeight.disable();
    this.fcPort.disable();
  }

  private _updateDefaultFields(): void {
    this.fcPriority.disable();
    this.fcService.disable();
    this.fcProtocol.disable();
    this.fcWeight.disable();
    this.fcPort.disable();
  }
}
