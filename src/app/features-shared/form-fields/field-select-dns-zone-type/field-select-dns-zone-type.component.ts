import {
  of,
  Observable
} from 'rxjs';

import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  DnsRecordType,
  McsOption
} from '@app/models';
import { unsubscribeSafely } from '@app/utilities';

import { FormFieldBaseComponent2 } from '../abstraction/form-field.base';
import { IFieldSelectDnsZoneType } from './field-select-dns-zone-type';

@Component({
  selector: 'mcs-field-select-dns-zone-type',
  templateUrl: './field-select-dns-zone-type.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'mcs-field-select-dns-zone-type'
  }
})
export class FieldSelectDnsZoneTypeComponent
  extends FormFieldBaseComponent2<DnsRecordType>
  implements IFieldSelectDnsZoneType, OnInit, OnDestroy {

  public optionItems$: Observable<McsOption[]>;

  constructor(_injector: Injector) {
    super(_injector);
  }

  public ngOnInit(): void {
    this._subscribeToDnsZoneTypes();
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this.destroySubject);
  }

  private _subscribeToDnsZoneTypes(): void {
    let optionItems = new Array<McsOption>();

    optionItems.push(new McsOption(DnsRecordType.A, this.translate.instant('label.a')));
    optionItems.push(new McsOption(DnsRecordType.AAAA, this.translate.instant('label.aaaa')));
    optionItems.push(new McsOption(DnsRecordType.CNAME, this.translate.instant('label.cname')));
    optionItems.push(new McsOption(DnsRecordType.MX, this.translate.instant('label.mx')));
    optionItems.push(new McsOption(DnsRecordType.NAPTR, this.translate.instant('label.naptr')));
    optionItems.push(new McsOption(DnsRecordType.NS, this.translate.instant('label.ns')));
    optionItems.push(new McsOption(DnsRecordType.PTR, this.translate.instant('label.ptr')));
    optionItems.push(new McsOption(DnsRecordType.SRV, this.translate.instant('label.srv')));
    optionItems.push(new McsOption(DnsRecordType.TXT, this.translate.instant('label.txt')));
    this.optionItems$ = of(optionItems);
  }
}