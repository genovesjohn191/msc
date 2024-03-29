import {
  filter,
  takeUntil,
  tap,
  Subject,
  Subscription
} from 'rxjs';

import {
  ChangeDetectorRef,
  Injector
} from '@angular/core';
import {
  EventBusDispatcherService,
  EventBusState
} from '@app/event-bus';
import { McsEvent } from '@app/events';
import {
  DataStatus,
  McsStateNotification
} from '@app/models';
import {
  isNullOrEmpty,
  unsubscribeSafely,
  McsDataSource,
  McsDisposable
} from '@app/utilities';

export interface McsDataEventsConfig<TEntity> {
  dataChangeEvent?: EventBusState<TEntity[]>;
  dataClearEvent?: EventBusState<void>;
  entityDeleteEvent?: EventBusState<any>;
}
// TODO(apascual): Rename this to McsDataEvents to consider all datasource binding
export class McsTableEvents<TEntity> implements McsDisposable {
  private _dataChangeHandler: Subscription;
  private _dataClearHandler: Subscription;
  private _entityDeleteHandler: Subscription;
  private _destroySubject = new Subject<void>();

  private readonly _changeDetectorRef: ChangeDetectorRef;
  private readonly _eventDispatcher: EventBusDispatcherService;

  constructor(
    _injector: Injector,
    private _dataSource: McsDataSource<TEntity>,
    private _dataConfig?: McsDataEventsConfig<TEntity>
  ) {
    this._changeDetectorRef = _injector.get(ChangeDetectorRef);
    this._eventDispatcher = _injector.get(EventBusDispatcherService);

    this._validateDatasource();
    this._registerDataEventsByConfig();
    this._registerErrorNotification();
  }

  public dispose(): void {
    unsubscribeSafely(this._dataChangeHandler);
    unsubscribeSafely(this._dataClearHandler);
    unsubscribeSafely(this._entityDeleteHandler);
    unsubscribeSafely(this._destroySubject);
  }

  private _registerDataEventsByConfig(): void {
    if (!isNullOrEmpty(this._dataConfig.dataChangeEvent)) {
      this._dataChangeHandler = this._eventDispatcher.addEventListener(
        this._dataConfig.dataChangeEvent, this._onDataChange.bind(this)
      );
    }

    if (!isNullOrEmpty(this._dataConfig.dataClearEvent)) {
      this._dataClearHandler = this._eventDispatcher.addEventListener(
        this._dataConfig.dataClearEvent, this._onDataClear.bind(this)
      );
    }

    if (!isNullOrEmpty(this._dataConfig.entityDeleteEvent)) {
      this._entityDeleteHandler = this._eventDispatcher.addEventListener(
        this._dataConfig.entityDeleteEvent, this._onDeleteRecord.bind(this)
      );
    }
  }

  private _onDataChange(): void {
    this._changeDetectorRef.markForCheck();
  }

  private _onDataClear(): void {
    if (isNullOrEmpty(this._dataSource)) { return; }
    this._dataSource.refreshDataRecords();
    this._changeDetectorRef.markForCheck();
  }

  private _onDeleteRecord(): void {
    if (isNullOrEmpty(this._dataSource)) { return; }
    this._dataSource.refreshDataRecords();
    this._changeDetectorRef.markForCheck();
  }

  private _registerErrorNotification(): void {
    this._dataSource.dataStatusChange().pipe(
      takeUntil(this._destroySubject),
      filter(status => status === DataStatus.Error),
      tap(() => {
        this._eventDispatcher.dispatch(McsEvent.stateNotificationShow,
          new McsStateNotification('error', 'message.tableError')
        );
      })
    ).subscribe();
  }

  private _validateDatasource(): void {
    if (isNullOrEmpty(this._dataSource)) {
      throw new Error(`Datasource for table events must not be empty.`);
    }
  }
}
