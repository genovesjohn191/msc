import {
  of,
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  finalize,
  switchMap,
  tap,
  map
} from 'rxjs/operators';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  McsFormGroupService,
  McsMatTableContext,
  McsMatTableQueryParam,
  McsTableDataSource2
} from '@app/core';
import { EventBusDispatcherService } from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  DnsRecordType,
  McsFilterInfo,
  McsNetworkDnsRecordRequest,
  McsNetworkDnsZone,
  McsStateNotification
} from '@app/models';
import { McsApiService } from '@app/services';
import {
  DialogActionType,
  DialogResult,
  DialogResultAction,
  DialogService2
} from '@app/shared';
import {
  animateFactory,
  createObject,
  getSafeFormValue,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely,
  compareStrings
} from '@app/utilities';
import { TranslateService } from '@ngx-translate/core';

import { DnsZoneViewModel } from './dns-zone-viewmodel';

@Component({
  selector: 'mcs-dns-zone-manage',
  templateUrl: 'dns-zone-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.expansionVertical
  ]
})
export class DnsZoneManageComponent implements OnInit, OnChanges, OnDestroy {
  public readonly dataSource: McsTableDataSource2<DnsZoneViewModel>;
  public readonly addViewModel: DnsZoneViewModel;
  public readonly processOnGoing$: BehaviorSubject<boolean>;

  @Input()
  public zone: McsNetworkDnsZone;

  @Output()
  public requestUpdate = new EventEmitter<void>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _translateService: TranslateService,
    private _eventDispatcher: EventBusDispatcherService,
    private _apiService: McsApiService,
    private _dialogService: DialogService2,
    private _formGroupService: McsFormGroupService
  ) {
    this.addViewModel = new DnsZoneViewModel();
    this.processOnGoing$ = new BehaviorSubject<boolean>(false);
    this.dataSource = new McsTableDataSource2();
    this.dataSource.registerColumnsFilterInfo([
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'recordType' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'hostName' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'target' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'ttlSeconds' }),
      createObject(McsFilterInfo, { value: true, exclude: true, id: 'actions' })
    ]);
  }

  public ngOnInit(): void {
    this._validateInputs();
    this.dataSource.updateDatasource(this._getNetworkDnsZoneRecords.bind(this));
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let zoneChange = changes['zone'];
    if (!isNullOrEmpty(zoneChange)) {
      this.dataSource.updateDatasource(this._getNetworkDnsZoneRecords.bind(this));
    }
  }

  public ngOnDestroy(): void {
    this.dataSource?.disconnect(null);
    unsubscribeSafely(this.processOnGoing$);
  }

  public validateRecordConflict(isExistingRecord: boolean,existingRecord?: DnsZoneViewModel): boolean {
    let thisRecord = {
      zoneType: (isExistingRecord) ? existingRecord.recordInfo?.zoneType : this.addViewModel.fcZoneType?.value,
      hostName: (isExistingRecord) ? existingRecord.fgDnsZone?.get('fcHostName')?.value : this.addViewModel.fcHostName?.value,
      data: (isExistingRecord) ? existingRecord.fgDnsZone?.get('fcData')?.value : this.addViewModel.fcData?.value,
      id: (isExistingRecord) ? existingRecord.recordInfo?.id : null
    }

    // Validate first if a conflicting record exists, otherwise display error message
    // Also check for CNAME record that has a conflicting name with any other record (special case)
    let conflictingRecordFound = this.dataSource.findRecord(item =>
          thisRecord.zoneType === DnsRecordType.CNAME &&
          !compareStrings(thisRecord.hostName,item.fcHostName?.value) &&
          !!compareStrings(thisRecord.id, item.recordInfo.id)
        )
      ||
        //String cast required for handling TXT data
        this.dataSource.findRecord(item =>
          thisRecord.zoneType === item.fcZoneType?.value &&
          !compareStrings(thisRecord.hostName, item.fcHostName?.value) &&
          (thisRecord.data? !compareStrings(thisRecord.data?.toString(), item.fcData?.value?.toString()) : false) &&
          !!compareStrings(thisRecord.id, item.recordInfo.id)
        );

    if (!conflictingRecordFound) { return true; }
      this._dialogService.openMessage({
        type: DialogActionType.Error,
        title: this._translateService.instant('label.conflictingRecord'),
        message: this._translateService.instant('message.recordExists', {
          name: this.addViewModel.fcTarget?.value
        })
      });
    return false;
  }

  public validateCnameFqdn(isExistingRecord: boolean, existingRecord?: DnsZoneViewModel): boolean {
    let fullyQualifiedZoneName = `${this.zone.name.toLowerCase()}.`;

    let recordType = isExistingRecord?
      existingRecord.recordInfo?.zoneType
      : this.addViewModel.fcZoneType?.value;

    let hostName = isExistingRecord?
      existingRecord.fgDnsZone?.get('fcHostName')?.value?.toLowerCase()
      : this.addViewModel.fcHostName?.value.toLowerCase();

      if (recordType !== DnsRecordType.CNAME || !['@', fullyQualifiedZoneName].includes(hostName)) {
        return true;
      }

    this._dialogService.openMessage({
      type: DialogActionType.Error,
      title: this._translateService.instant('label.invalidCnameRecord'),
      message: this._translateService.instant('message.cnameNameMatchesRoot', {
        name: this.addViewModel.fcTarget?.value
      })
    });
    return false;
  }

  public validateHostnameMatchingZoneFqdn(isExistingRecord: boolean, existingRecord?: DnsZoneViewModel): Observable<boolean> {
    let zoneName = this.zone.name;

    let hostName = (isExistingRecord)?
    existingRecord.fgDnsZone?.get('fcHostName')?.value
    : this.addViewModel.fcHostName?.value;

    if (compareStrings(zoneName,hostName)) { return of(true); }

    let dialogRef = this._dialogService.openConfirmation({
      type: DialogActionType.Warning,
      title: this._translateService.instant('label.confirmRecordName'),
      message: this._translateService.instant('message.recordNameMatchesZoneName'),
      confirmText: this._translateService.instant('action.confirm'),
      cancelText: this._translateService.instant('action.cancel')
    });

    return dialogRef.afterClosed().pipe(
      map((result: DialogResult<boolean>) => {
        return (result?.action == DialogResultAction.Confirm);
      })
    );
  }

  public onClickAddDnsZoneRecord(): void {
    this._formGroupService.touchAllFormFields(this.addViewModel?.fgDnsZone);
    let allAreValid = this._formGroupService.allFormFieldsValid(this.addViewModel?.fgDnsZone);
    if (!allAreValid) { return; }
    if (!this.validateCnameFqdn(false)) { return; }
    if (!this.validateRecordConflict(false)) { return; }
    this.validateHostnameMatchingZoneFqdn(false).subscribe(confirmation=>{
      if (!confirmation) { return; }
      let zoneRecord = this._createRequestPayloadByViewModel(this.addViewModel);
      this.processOnGoing$.next(true);
      this._apiService.createNetworkDnsZoneRecord(
        this.zone.id,
        zoneRecord
      ).pipe(
        tap(() => {
          this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
            new McsStateNotification('success', 'message.successfullyCreated')
          );
          this._formGroupService.resetAllControls(this.addViewModel?.fgDnsZone);
          this.requestUpdate.next();
        }),
        finalize(() => this.processOnGoing$.next(false))
      ).subscribe();
    });
  }

  public onClickSaveDnsZoneRecord(record: DnsZoneViewModel): void {
    this._formGroupService.touchAllFormFields(record.fgDnsZone);
    let allAreValid = this._formGroupService.allFormFieldsValid(record.fgDnsZone);
    if (!allAreValid) { return; }
    if (!this.validateCnameFqdn(true,record)) { return; }
    if (!this.validateRecordConflict(true,record)) { return; }
    this.validateHostnameMatchingZoneFqdn(true,record).subscribe(confirmation=>{
      if (!confirmation) { return; }
      let zoneRecord = this._createRequestPayloadByViewModel(record);
      record.setProgressState(true);
      this._apiService.updateNetworkDnsZoneRecord(
        this.zone.id,
        record.recordInfo?.id,
        zoneRecord
      ).pipe(
        tap(() => {
          this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
            new McsStateNotification('success', 'message.successfullyUpdated')
          );
          this.requestUpdate.next();
          record.updating = false;
        }),
        finalize(() => record.setProgressState(false))
      ).subscribe();
    });
  }

  public onClickDeleteDnsZoneRecord(record: DnsZoneViewModel): void {
    let dialogRef = this._dialogService.openConfirmation({
      title: this._translateService.instant('label.deleteZoneRecord'),
      message: this._translateService.instant('message.deleteZoneRecord', {
        dnsTarget: record.fcTarget.value || record.fcHostName.value
      })
    });

    dialogRef.afterClosed().pipe(
      switchMap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm) { return; }

        record.setProgressState(true);
        return this._apiService.deleteNetworkDnsZoneRecord(
          this.zone.id,
          record.recordInfo?.id
        ).pipe(
          tap(() => {
            this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
              new McsStateNotification('success', 'message.successfullyDeleted')
            );
            this.requestUpdate.next();
          }),
          finalize(() => {
            record.setProgressState(false);
            record.updating = false;
          })
        );
      })
    ).subscribe();
  }

  public onClickEditDnsZoneRecord(record: DnsZoneViewModel): void {
    record.updating = true;
    this._changeDetectorRef.markForCheck();
  }

  public onClickCancelEdit(record: DnsZoneViewModel): void {
    if (!record.hasChanges) {
      record.setDefaultValues();
      record.updating = false;
      this._changeDetectorRef.markForCheck();
      return;
    }

    // Confirm first if changes has been made
    let dialogRef = this._dialogService.openConfirmation({
      title: this._translateService.instant('label.discardChanges'),
      message: this._translateService.instant('message.discardChanges')
    });

    dialogRef.afterClosed().pipe(
      tap((result: DialogResult<boolean>) => {
        if (result?.action !== DialogResultAction.Confirm) { return; }
        record.setDefaultValues();
        record.updating = false;
        this._changeDetectorRef.markForCheck();
      })
    ).subscribe();
  }

  private _validateInputs(): void {
    if (isNullOrUndefined(this.zone)) {
      throw new Error('Unable to manage dns-zone without target zone.');
    }
  }

  private _getNetworkDnsZoneRecords(
    _param: McsMatTableQueryParam
  ): Observable<McsMatTableContext<DnsZoneViewModel>> {

    this.zone?.rrsets.sort((a,b) => a.type.localeCompare(b.type));
    this.zone?.rrsets.sort(function(a, b) { return a.type === DnsRecordType.MX ? -1 : b.type === DnsRecordType.MX ? 1 : 0; });
    this.zone?.rrsets.sort(function(a, b) { return a.type === DnsRecordType.NS ? -1 : b.type === DnsRecordType.NS ? 1 : 0; });
    this.zone?.rrsets.sort(function(a, b) { return a.type === DnsRecordType.SOA ? -1 : b.type === DnsRecordType.SOA ? 1 : 0; });

    let dataModels = new Array<DnsZoneViewModel>();
    this.zone?.rrsets.forEach(rrset => {
      if (isNullOrEmpty(rrset?.records)) { return; }

      rrset?.records.sort((a, b) => a.name.localeCompare(b.name));
      rrset.records.forEach(record => {
        let dnsViewModel = new DnsZoneViewModel(this.zone, rrset, record);
        dataModels.push(dnsViewModel);
      });
    });
    return of(new McsMatTableContext(dataModels));
  }

  private _createRequestPayloadByViewModel(
    viewModel: DnsZoneViewModel
  ): McsNetworkDnsRecordRequest {
    let zoneRecord = new McsNetworkDnsRecordRequest();

    zoneRecord.name = (getSafeFormValue<DnsRecordType>(viewModel.fcZoneType) === DnsRecordType.SOA) ?
    (getSafeFormValue(viewModel.fcHostNameSoa) || null) : (getSafeFormValue(viewModel.fcHostName) || null);

    zoneRecord.data = (getSafeFormValue<DnsRecordType>(viewModel.fcZoneType) === DnsRecordType.SOA) ?
    (getSafeFormValue(viewModel.fcDataSoa) || null) : (getSafeFormValue(viewModel.fcData) || null);

    zoneRecord.ttlSeconds = (getSafeFormValue<DnsRecordType>(viewModel.fcZoneType) === DnsRecordType.SOA) ?
    (+getSafeFormValue(viewModel.fcTtlSecondsSoa) || null) : (+getSafeFormValue(viewModel.fcTtlSeconds) || null);

    zoneRecord.type = getSafeFormValue<DnsRecordType>(viewModel.fcZoneType);
    zoneRecord.target = getSafeFormValue(viewModel.fcTarget);
    zoneRecord.service = getSafeFormValue(viewModel.fcService);
    zoneRecord.protocol = getSafeFormValue(viewModel.fcProtocol);
    zoneRecord.priority = +getSafeFormValue(viewModel.fcPriority) || null;
    zoneRecord.weight = +getSafeFormValue(viewModel.fcWeight) || null;
    zoneRecord.port = +getSafeFormValue(viewModel.fcPort) || null;
    zoneRecord.order = +getSafeFormValue(viewModel.fcOrder) || null;
    zoneRecord.preference = +getSafeFormValue(viewModel.fcPreference) || null;
    zoneRecord.flags = getSafeFormValue(viewModel.fcFlags);
    zoneRecord.regexp = getSafeFormValue(viewModel.fcRegex);
    zoneRecord.replacement = getSafeFormValue(viewModel.fcReplacement);
    zoneRecord.respPerson = getSafeFormValue(viewModel.fcResponsiblePerson);
    zoneRecord.refresh = getSafeFormValue(viewModel.fcRefreshSeconds);
    zoneRecord.retry = getSafeFormValue(viewModel.fcRetrySeconds);
    zoneRecord.expire = getSafeFormValue(viewModel.fcExpireSeconds);
    zoneRecord.minimum = getSafeFormValue(viewModel.fcMinimumSeconds);
    return zoneRecord;
  }
}
