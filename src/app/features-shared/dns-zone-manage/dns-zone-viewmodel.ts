import { BehaviorSubject } from 'rxjs';

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
  isNullOrEmpty,
  isNullOrUndefined,
  CommonDefinition
} from '@app/utilities';

export const DNS_TTLSECONDS_MIN_VALUE = 600;
export const DNS_TTLSECONDS_MAX_VALUE = 2147483647;

export class DnsZoneViewModel {
  public updating: boolean;
  public recordId: string;

  public readonly inProgress$: BehaviorSubject<boolean>;
  public readonly fgDnsZone: FormGroup;
  public readonly fcZoneType: FormControl;
  public readonly fcHostName: FormControl;
  public readonly fcTarget: FormControl;
  public readonly fcTtlSeconds: FormControl;

  private readonly targetRegexMap: Map<string, RegExp>;

  constructor(
    private _mainRrSet?: McsNetworkDnsRrSets,
    private _subRecord?: McsNetworkDnsRrSetsRecord
  ) {
    this.targetRegexMap = new Map();
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
      (control) => CoreValidators.min(DNS_TTLSECONDS_MIN_VALUE)(control),
      (control) => CoreValidators.max(DNS_TTLSECONDS_MAX_VALUE)(control)
    ]);

    this.fgDnsZone = new FormGroup({
      fcZoneType: this.fcZoneType,
      fcHostName: this.fcHostName,
      fcTarget: this.fcTarget,
      fcTtlSeconds: this.fcTtlSeconds
    });

    this._registerRegexMap();
    this.setDefaultValues();
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

    this.fcZoneType.reset();
    this.fcHostName.reset();
    this.fcTtlSeconds.reset();
    this.fcTarget.reset();

    this.recordId = this._subRecord.id;
    this.fcZoneType.setValue(this._mainRrSet.type);
    this.fcHostName.setValue(this._mainRrSet.name);
    this.fcTtlSeconds.setValue(this._mainRrSet.ttlSeconds?.toString());
    this.fcTarget.setValue(this._subRecord.target);
    return this;
  }

  public validateFields(): void {
    this.fcZoneType.markAsTouched();
    this.fcHostName.markAsTouched();
    this.fcTarget.markAsTouched();
  }

  public isValid(): boolean {
    return this.fcZoneType?.valid &&
      this.fcHostName.valid &&
      this.fcTarget.valid &&
      this.fcTtlSeconds.valid;
  }

  public setProgressState(inProgress: boolean): void {
    this.inProgress$.next(inProgress);
  }

  private _onValidateHostName(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }
    return CommonDefinition.REGEX_DNS_HOSTNAME.test(inputValue);
  }

  private _onValidateTarget(inputValue: string): boolean {
    if (isNullOrEmpty(inputValue)) { return false; }

    let associatedRegex = this.targetRegexMap.get(this.fcZoneType?.value);
    if (isNullOrEmpty(associatedRegex)) {
      associatedRegex = CommonDefinition.REGEX_DNS_TYPE_DEFAULT;
    }
    return associatedRegex.test(inputValue);
  }

  private _registerRegexMap(): void {
    this.targetRegexMap.set(DnsRecordType.A, CommonDefinition.REGEX_DNS_TYPE_A);
    this.targetRegexMap.set(DnsRecordType.AAA, CommonDefinition.REGEX_DNS_TYPE_AAA);
    this.targetRegexMap.set(DnsRecordType.CNAME, CommonDefinition.REGEX_DNS_TYPE_CNAME);
    this.targetRegexMap.set(DnsRecordType.MX, CommonDefinition.REGEX_DNS_TYPE_MX_OR_SV);
    this.targetRegexMap.set(DnsRecordType.NAPTR, CommonDefinition.REGEX_DNS_TYPE_NAPTR);
    this.targetRegexMap.set(DnsRecordType.NS, CommonDefinition.REGEX_DNS_TYPE_NS);
    this.targetRegexMap.set(DnsRecordType.PTR, CommonDefinition.REGEX_DNS_TYPE_PTR);
    this.targetRegexMap.set(DnsRecordType.SRV, CommonDefinition.REGEX_DNS_TYPE_MX_OR_SV);
    this.targetRegexMap.set(DnsRecordType.TXT, CommonDefinition.REGEX_DNS_TYPE_TXT);
  }
}
