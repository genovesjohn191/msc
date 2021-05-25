import {
  FormControl,
  FormGroup
} from '@angular/forms';
import { CoreValidators } from '@app/core';
import { McsNetworkDnsRrSets } from '@app/models';
import { isNullOrUndefined } from '@app/utilities';

export class DnsZoneViewModel {
  public updating: boolean;

  public readonly fgDnsZone: FormGroup;
  public readonly fcZoneType: FormControl;
  public readonly fcHostName: FormControl;
  public readonly fcTarget: FormControl;
  public readonly fcTtlSeconds: FormControl;

  constructor() {
    this.fcZoneType = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcHostName = new FormControl('', [
      CoreValidators.required
    ]);

    this.fcTarget = new FormControl('', [
      CoreValidators.required,
      CoreValidators.url,
      CoreValidators.ipAddress
    ]);

    this.fcTtlSeconds = new FormControl('', [
      CoreValidators.required
    ]);

    this.fgDnsZone = new FormGroup({
      fcZoneType: this.fcZoneType,
      fcHostName: this.fcHostName,
      fcTarget: this.fcTarget,
      fcTtlSeconds: this.fcTtlSeconds
    });
  }

  public updateViewModelData(model: McsNetworkDnsRrSets): DnsZoneViewModel {
    if (isNullOrUndefined(model)) { return; }

    this.fcZoneType.setValue(model.type);
    this.fcHostName.setValue(model.name);
    this.fcTtlSeconds.setValue(model.ttlSeconds?.toString());
    this.fcTarget.setValue(model.class);
    return this;
  }
}
