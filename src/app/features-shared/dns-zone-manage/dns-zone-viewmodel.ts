import { BehaviorSubject } from 'rxjs';

import {
  FormControl,
  FormGroup
} from '@angular/forms';
import { CoreValidators } from '@app/core';
import {
  McsNetworkDnsRrSets,
  McsNetworkDnsRrSetsRecord
} from '@app/models';
import { isNullOrUndefined } from '@app/utilities';

export class DnsZoneViewModel {
  public updating: boolean;
  public recordId: string;

  public readonly inProgress$: BehaviorSubject<boolean>;
  public readonly fgDnsZone: FormGroup;
  public readonly fcZoneType: FormControl;
  public readonly fcHostName: FormControl;
  public readonly fcTarget: FormControl;
  public readonly fcTtlSeconds: FormControl;

  constructor(
    private _mainRrSet?: McsNetworkDnsRrSets,
    private _subRecord?: McsNetworkDnsRrSetsRecord
  ) {
    this.inProgress$ = new BehaviorSubject<boolean>(false);

    this.fcZoneType = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcHostName = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcTarget = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcTtlSeconds = new FormControl('', [
      CoreValidators.required,
      CoreValidators.numeric
    ]);

    this.fgDnsZone = new FormGroup({
      fcZoneType: this.fcZoneType,
      fcHostName: this.fcHostName,
      fcTarget: this.fcTarget,
      fcTtlSeconds: this.fcTtlSeconds
    });

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
    this.fcTtlSeconds.markAsTouched();
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
}
