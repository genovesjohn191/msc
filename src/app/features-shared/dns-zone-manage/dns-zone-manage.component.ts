import {
  of,
  BehaviorSubject,
  Observable
} from 'rxjs';
import {
  finalize,
  switchMap,
  tap
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
  SimpleChanges,
  ViewChild
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
  DialogService2,
  McsFormGroupDirective
} from '@app/shared';
import {
  animateFactory,
  createObject,
  getSafeFormValue,
  isNullOrEmpty,
  isNullOrUndefined,
  unsubscribeSafely
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
  public dnsId: string;

  @Input()
  public zone: McsNetworkDnsZone;

  @Output()
  public requestUpdate = new EventEmitter<void>();

  @ViewChild(McsFormGroupDirective)
  public formGroup: McsFormGroupDirective;

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

  public onClickAddDnsZoneRecord(): void {
    this._formGroupService.touchAllFormFields(this.addViewModel?.fgDnsZone);
    let allAreValid = this._formGroupService.allFormFieldsValid(this.addViewModel?.fgDnsZone);
    if (!allAreValid) { return; }

    // Validate first if the record exists, otherwise display error message
    let recordFound = this.dataSource.findRecord(item =>
      item.fcZoneType?.value === this.addViewModel.fcZoneType?.value &&
      item.fcHostName?.value === this.addViewModel.fcHostName?.value &&
      item.fcTarget?.value === this.addViewModel.fcTarget?.value);

    if (recordFound) {
      this._dialogService.openMessage({
        type: DialogActionType.Error,
        title: this._translateService.instant('label.addZoneRecord'),
        message: this._translateService.instant('message.createRecordExist', {
          name: this.addViewModel.fcTarget?.value
        })
      });
      return;
    }

    let zoneRecord = this._createRequestPayloadByViewModel(this.addViewModel);
    this.processOnGoing$.next(true);
    this._apiService.createNetworkDnsZoneRecord(
      this.dnsId,
      this.zone.id,
      zoneRecord
    ).pipe(
      tap(() => {
        this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
          new McsStateNotification('success', 'message.successfullyCreated')
        );
        this.formGroup.resetAllControls();
        this.requestUpdate.next();
      }),
      finalize(() => this.processOnGoing$.next(false))
    ).subscribe();
  }

  public onClickSaveDnsZoneRecord(record: DnsZoneViewModel): void {
    this._formGroupService.touchAllFormFields(record.fgDnsZone);
    let allAreValid = this._formGroupService.allFormFieldsValid(record.fgDnsZone);
    if (!allAreValid) { return; }

    let zoneRecord = this._createRequestPayloadByViewModel(record);
    record.setProgressState(true);
    this._apiService.updateNetworkDnsZoneRecord(
      this.dnsId,
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
          this.dnsId,
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

    let dataModels = new Array<DnsZoneViewModel>();
    this.zone?.rrsets.forEach(rrset => {
      if (isNullOrEmpty(rrset?.records)) { return; }

      rrset.records.forEach(record => {
        let dnsViewModel = new DnsZoneViewModel(rrset, record);
        dataModels.push(dnsViewModel);
      });
    });
    return of(new McsMatTableContext(dataModels));
  }

  private _createRequestPayloadByViewModel(
    viewModel: DnsZoneViewModel
  ): McsNetworkDnsRecordRequest {
    let zoneRecord = new McsNetworkDnsRecordRequest();
    zoneRecord.name = getSafeFormValue(viewModel.fcHostName);
    zoneRecord.type = getSafeFormValue<DnsRecordType>(viewModel.fcZoneType);
    zoneRecord.ttlSeconds = +getSafeFormValue(viewModel.fcTtlSeconds);
    zoneRecord.data = getSafeFormValue(viewModel.fcData);
    zoneRecord.target = getSafeFormValue(viewModel.fcTarget);
    zoneRecord.service = getSafeFormValue(viewModel.fcService);
    zoneRecord.protocol = getSafeFormValue(viewModel.fcProtocol);
    zoneRecord.priority = +getSafeFormValue(viewModel.fcPriority);
    zoneRecord.weight = +getSafeFormValue(viewModel.fcWeight);
    zoneRecord.port = +getSafeFormValue(viewModel.fcPort);
    zoneRecord.order = +getSafeFormValue(viewModel.fcOrder);
    zoneRecord.preference = +getSafeFormValue(viewModel.fcPreference);
    zoneRecord.flags = getSafeFormValue(viewModel.fcFlags);
    zoneRecord.regexp = getSafeFormValue(viewModel.fcRegex);
    zoneRecord.replacement = getSafeFormValue(viewModel.fcReplacement);
    return zoneRecord;
  }
}
