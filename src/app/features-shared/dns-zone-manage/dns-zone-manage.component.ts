import {
  of,
  Observable
} from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import {
  DnsRecordType,
  McsFilterInfo,
  McsNetworkDnsRecordRequest,
  McsNetworkDnsZone
} from '@app/models';
import { McsApiService } from '@app/services';
import { McsFormGroupDirective } from '@app/shared';
import {
  createObject,
  getSafeFormValue,
  isNullOrUndefined
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { DnsZoneViewModel } from './dns-zone-viewmodel';

@Component({
  selector: 'mcs-dns-zone-manage',
  templateUrl: 'dns-zone-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DnsZoneManageComponent implements OnInit, OnDestroy {
  public readonly dataSource: McsTableDataSource2<DnsZoneViewModel>;
  public readonly addViewModel: DnsZoneViewModel;

  @Input()
  public dnsId: string;

  @Input()
  public zone: McsNetworkDnsZone;

  @Output()
  public requestUpdate = new EventEmitter<void>();

  @ViewChild(McsFormGroupDirective)
  public formGroup: McsFormGroupDirective;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
    private _translateService: TranslateService,
    private _apiService: McsApiService
  ) {
    this.addViewModel = new DnsZoneViewModel();
    this.dataSource = new McsTableDataSource2(this._getNetworkDnsZoneRecords.bind(this));
    this.dataSource.registerColumnsFilterInfo([
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'recordType' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'hostname' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'target' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'ttlSeconds' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'actions' })
    ]);
  }

  public ngOnInit(): void {
    this._validateInputs();
  }

  public ngOnDestroy(): void {
    this.dataSource?.disconnect(null);
  }

  public onClickAddDnsZoneRecord(): void {
    this.formGroup.validateFormControls(true);
    if (!this.formGroup.isValid()) { return; }

    let zoneRecord = new McsNetworkDnsRecordRequest();
    zoneRecord.type = getSafeFormValue<DnsRecordType>(this.addViewModel.fcHostName);
    zoneRecord.name = getSafeFormValue(this.addViewModel.fcHostName);
    zoneRecord.value = getSafeFormValue(this.addViewModel.fcTarget);
    zoneRecord.ttlSeconds = +getSafeFormValue(this.addViewModel.fcTtlSeconds);

    this._apiService.createNetworkDnsZoneRecord(
      this.dnsId,
      this.zone.id,
      zoneRecord
    ).pipe(
      tap(() => {
        this.formGroup.resetAllControls();
        this.requestUpdate.next();
      })
    ).subscribe();
  }

  public onClickSaveDnsZoneRecord(record: DnsZoneViewModel): void {
    // TODO(apascual): We need id here isnt? because we need to pass the record to be updated.
  }

  public onClickEditDnsZoneRecord(record: DnsZoneViewModel): void {
    // TODO(apascual): We need id here isnt? because we need to pass the record to be updated.
  }

  public onClickDeleteDnsZoneRecord(record: DnsZoneViewModel): void {
    // TODO(apascual): We need id here isnt? because we need to pass the record to be updated.
  }

  public onClickCancelEdit(record: DnsZoneViewModel): void {
    // TODO(apascual): Do we need to display discard changes dialog here before proceeding?
  }

  private _validateInputs(): void {
    if (isNullOrUndefined(this.dnsId)) {
      throw new Error('Unable to manage dns-zone without DNS Id.');
    }

    if (isNullOrUndefined(this.zone)) {
      throw new Error('Unable to manage dns-zone without target zone.');
    }
  }

  private _getNetworkDnsZoneRecords(
    _param: McsMatTableQueryParam
  ): Observable<McsMatTableContext<DnsZoneViewModel>> {
    let dataModels = this.zone?.rrsets?.map(record =>
      new DnsZoneViewModel().updateViewModelData(record)
    );
    return of(new McsMatTableContext(dataModels));
  }
}
